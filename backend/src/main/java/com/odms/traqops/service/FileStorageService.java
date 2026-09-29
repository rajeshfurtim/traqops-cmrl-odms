package com.odms.traqops.service;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.odms.traqops.config.FileStorageProperties;

import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
@Slf4j
public class FileStorageService {

	private static final String S3_PATH_PREFIX = "s3://";
	private static final String STORAGE_TYPE_S3 = "s3";

	private final FileStorageProperties fileStorageProperties;
	private S3Client s3Client;

	public FileStorageService(FileStorageProperties fileStorageProperties) {
		this.fileStorageProperties = fileStorageProperties;
	}

	public String store(MultipartFile file, String referenceType, String storedFileName) {
		String relativePath = referenceType.toLowerCase() + "/" + fileStorageProperties.getDateTimePath() + "/" + storedFileName;
		try {
			return STORAGE_TYPE_S3.equalsIgnoreCase(fileStorageProperties.getStorageType())
					? storeInS3(file, relativePath)
					: storeLocally(file, relativePath);
		} catch (IOException | RuntimeException ex) {
			log.error("Could not store file {}", relativePath, ex);
			return null;
		}
	}

	public Resource loadAsResource(String filePath) throws FileNotFoundException, IOException {
		return filePath != null && filePath.startsWith(S3_PATH_PREFIX)
				? loadFromS3(filePath)
				: loadFromLocal(filePath);
	}

	public boolean delete(String filePath) {
		return filePath != null && filePath.startsWith(S3_PATH_PREFIX)
				? deleteFromS3(filePath)
				: deleteFromLocal(filePath);
	}

	private String storeInS3(MultipartFile file, String key) throws IOException {
		PutObjectRequest putRequest = PutObjectRequest.builder()
				.bucket(fileStorageProperties.getS3BucketName())
				.key(key)
				.contentType(file.getContentType())
				.build();
		s3().putObject(putRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
		return S3_PATH_PREFIX + fileStorageProperties.getS3BucketName() + "/" + key;
	}

	private String storeLocally(MultipartFile file, String relativePath) throws IOException {
		Path uploadRoot = Paths.get(fileStorageProperties.getUploadDir()).toAbsolutePath().normalize();
		Path target = uploadRoot.resolve(relativePath).normalize();
		if (!target.startsWith(uploadRoot)) {
			throw new IOException("Resolved path is outside the upload directory: " + relativePath);
		}
		Files.createDirectories(target.getParent());
		try (InputStream in = file.getInputStream()) {
			Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
		}
		return target.toString();
	}

	private Resource loadFromS3(String filePath) throws FileNotFoundException {
		String[] bucketAndKey = parseS3Path(filePath);
		try {
			GetObjectRequest getRequest = GetObjectRequest.builder()
					.bucket(bucketAndKey[0])
					.key(bucketAndKey[1])
					.build();
			byte[] data = s3().getObject(getRequest).readAllBytes();
			return new ByteArrayResource(data);
		} catch (IOException | RuntimeException ex) {
			log.error("Could not load file from S3: {}", filePath, ex);
			throw new FileNotFoundException("File not found in S3: " + filePath);
		}
	}

	private boolean deleteFromS3(String filePath) {
		try {
			String[] bucketAndKey = parseS3Path(filePath);
			s3().deleteObject(DeleteObjectRequest.builder().bucket(bucketAndKey[0]).key(bucketAndKey[1]).build());
			return true;
		} catch (Exception ex) {
			log.error("Could not delete file from S3: {}", filePath, ex);
			return false;
		}
	}

	private String[] parseS3Path(String filePath) throws FileNotFoundException {
		if (!filePath.startsWith(S3_PATH_PREFIX)) {
			throw new FileNotFoundException("Invalid S3 path: " + filePath);
		}
		String[] parts = filePath.substring(S3_PATH_PREFIX.length()).split("/", 2);
		return new String[] { parts[0], parts.length > 1 ? parts[1] : "" };
	}

	private Resource loadFromLocal(String filePath) throws FileNotFoundException, IOException {
		Path path = Paths.get(filePath).normalize();
		Resource resource = new UrlResource(path.toUri());
		if (resource.exists()) {
			return resource;
		}
		throw new FileNotFoundException("File not found: " + filePath);
	}

	private boolean deleteFromLocal(String filePath) {
		try {
			return Files.deleteIfExists(Paths.get(filePath).normalize());
		} catch (IOException ex) {
			log.error("Could not delete local file: {}", filePath, ex);
			return false;
		}
	}

	private synchronized S3Client s3() {
		if (s3Client == null) {
			S3ClientBuilder builder = S3Client.builder();
			if (isSet(fileStorageProperties.getS3AccessKey()) && isSet(fileStorageProperties.getS3SecretKey())) {
				builder.credentialsProvider(StaticCredentialsProvider.create(
						AwsBasicCredentials.create(fileStorageProperties.getS3AccessKey(), fileStorageProperties.getS3SecretKey())));
			}
			if (isSet(fileStorageProperties.getS3Region())) {
				builder.region(Region.of(fileStorageProperties.getS3Region()));
			}
			if (isSet(fileStorageProperties.getS3Endpoint())) {
				builder.endpointOverride(URI.create(fileStorageProperties.getS3Endpoint()));
			}
			s3Client = builder.build();
		}
		return s3Client;
	}

	private static boolean isSet(String value) {
		return value != null && !value.isBlank();
	}

}
