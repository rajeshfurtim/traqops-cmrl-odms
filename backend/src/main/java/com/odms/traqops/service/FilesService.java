package com.odms.traqops.service;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.odms.traqops.dto.FileResponse;
import com.odms.traqops.entity.Files;
import com.odms.traqops.exception.ResourceNotFoundException;
import com.odms.traqops.exception.ValidationException;
import com.odms.traqops.repository.FilesRepository;
import com.odms.traqops.response.ApiResponse;
import com.odms.traqops.response.DefaultListResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class FilesService {

	private static final String DEFAULT_DOCUMENT_TYPE = "DOCUMENT";

	private final FilesRepository filesRepository;
	private final FileStorageService fileStorageService;

	@Transactional
	public ApiResponse uploadFile(MultipartFile file, String referenceType, Long referenceId, String documentType, String actor) {
		try {
			uploadAndSave(file, referenceType, referenceId, documentType, actor);
			return ApiResponse.success("File uploaded successfully");
		} catch (ValidationException e) {
			throw e;
		} catch (Exception e) {
			log.error("Error uploading file for {} {}", referenceType, referenceId, e);
			return ApiResponse.error("Something went wrong");
		}
	}

	public Long attachFile(MultipartFile file, String referenceType, Long referenceId, String documentType, String actor) {
		return uploadAndSave(file, referenceType, referenceId, documentType, actor).getId();
	}

	@Transactional
	public Long replaceFile(MultipartFile file, String referenceType, Long referenceId, String documentType, String actor) {
		filesRepository.findByReferenceTypeAndReferenceIdAndDocumentTypeAndIsActiveTrue(referenceType, referenceId, documentType)
				.forEach(existing -> {
					existing.setIsActive(false);
					filesRepository.save(existing);
				});
		return attachFile(file, referenceType, referenceId, documentType, actor);
	}

	public FileResponse getActiveFile(String referenceType, Long referenceId, String documentType) {
		return filesRepository.findByReferenceTypeAndReferenceIdAndDocumentTypeAndIsActiveTrue(referenceType, referenceId, documentType)
				.stream()
				.max(Comparator.comparing(Files::getId))
				.map(this::toResponse)
				.orElse(null);
	}

	public DefaultListResponse<List<FileResponse>> listFiles(String referenceType, Long referenceId) {
		try {
			return DefaultListResponse.success("Files fetched successfully", listActiveFiles(referenceType, referenceId));
		} catch (Exception e) {
			log.error("Error fetching files for {} {}", referenceType, referenceId, e);
			return DefaultListResponse.error("Something went wrong");
		}
	}

	public List<FileResponse> listActiveFiles(String referenceType, Long referenceId) {
		return filesRepository.findByReferenceTypeAndReferenceIdAndIsActiveTrueOrderByIdDesc(referenceType, referenceId)
				.stream()
				.map(this::toResponse)
				.collect(Collectors.toList());
	}

	/** Active files for many records of one type in a single query, grouped by referenceId. */
	public Map<Long, List<FileResponse>> listActiveFilesByReferenceIds(String referenceType, List<Long> referenceIds) {
		if (referenceIds == null || referenceIds.isEmpty()) {
			return Map.of();
		}
		return filesRepository.findByReferenceTypeAndReferenceIdInAndIsActiveTrue(referenceType, referenceIds)
				.stream()
				.sorted(Comparator.comparing(Files::getId))
				.map(this::toResponse)
				.collect(Collectors.groupingBy(FileResponse::getReferenceId));
	}

	/** Deactivates a file only if it belongs to the given record. */
	public void detachFile(Long fileId, String referenceType, Long referenceId) {
		Files file = getActiveFileOrThrow(fileId);
		if (!referenceType.equals(file.getReferenceType()) || !referenceId.equals(file.getReferenceId())) {
			throw new ValidationException("File " + fileId + " is not attached to this record");
		}
		file.setIsActive(false);
		filesRepository.save(file);
	}

	@Transactional
	public ApiResponse deleteFile(Long id) {
		try {
			Files file = getActiveFileOrThrow(id);
			file.setIsActive(false);
			filesRepository.save(file);
			return ApiResponse.success("File deleted successfully");
		} catch (ResourceNotFoundException e) {
			throw e;
		} catch (Exception e) {
			log.error("Error deleting file with id {}", id, e);
			return ApiResponse.error("Something went wrong");
		}
	}

	public Files getActiveFileOrThrow(Long id) {
		return filesRepository.findByIdAndIsActiveTrue(id)
				.orElseThrow(() -> new ResourceNotFoundException("File not found with id: " + id));
	}

	public Resource loadFileAsResource(Files file) throws FileNotFoundException, IOException {
		return fileStorageService.loadAsResource(file.getFilePath());
	}

	private Files uploadAndSave(MultipartFile file, String referenceType, Long referenceId, String documentType, String actor) {
		if (file == null || file.isEmpty()) {
			throw new ValidationException("A file is required");
		}

		String originalFileName = file.getOriginalFilename();
		String storedFileName = UUID.randomUUID() + extractExtension(originalFileName);

		String filePath = fileStorageService.store(file, referenceType, storedFileName);
		if (filePath == null) {
			throw new ValidationException("Could not store file '" + originalFileName + "'");
		}

		Files files = new Files();
		files.setReferenceType(referenceType);
		files.setReferenceId(referenceId);
		files.setDocumentType(documentType != null && !documentType.isBlank() ? documentType : DEFAULT_DOCUMENT_TYPE);
		files.setOriginalFileName(originalFileName);
		files.setStoredFileName(storedFileName);
		files.setContentType(file.getContentType());
		files.setFileSize(file.getSize());
		files.setFilePath(filePath);
		files.setIsActive(true);
		files.setCreatedBy(actor);

		return filesRepository.save(files);
	}

	private FileResponse toResponse(Files file) {
		return FileResponse.builder()
				.id(file.getId())
				.referenceType(file.getReferenceType())
				.referenceId(file.getReferenceId())
				.documentType(file.getDocumentType())
				.originalFileName(file.getOriginalFileName())
				.contentType(file.getContentType())
				.fileSize(file.getFileSize())
				.viewUrl("/api/files/" + file.getId() + "/view")
				.downloadUrl("/api/files/" + file.getId() + "/download")
				.build();
	}

	private String extractExtension(String fileName) {
		if (fileName != null && fileName.contains(".")) {
			return fileName.substring(fileName.lastIndexOf('.'));
		}
		return "";
	}

}
