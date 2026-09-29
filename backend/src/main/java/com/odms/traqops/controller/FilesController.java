package com.odms.traqops.controller;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.odms.traqops.dto.FileResponse;
import com.odms.traqops.dto.FileUploadDto;
import com.odms.traqops.entity.Files;
import com.odms.traqops.response.ApiResponse;
import com.odms.traqops.response.DefaultListResponse;
import com.odms.traqops.security.CustomUserDetails;
import com.odms.traqops.service.FilesService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FilesController {

	private static final String DEFAULT_CONTENT_TYPE = "application/octet-stream";

	private final FilesService filesService;

	@PostMapping("/files/upload")
	public ApiResponse uploadFile(@ModelAttribute FileUploadDto request, @AuthenticationPrincipal CustomUserDetails principal) {
		return filesService.uploadFile(request.getFile(), request.getReferenceType(), request.getReferenceId(), request.getDocumentType(),
				principal.getFullName());
	}

	@GetMapping("/files")
	public DefaultListResponse<List<FileResponse>> list(
			@RequestParam String referenceType,
			@RequestParam Long referenceId) {
		return filesService.listFiles(referenceType, referenceId);
	}

	@GetMapping("/files/{id}/view")
	public ResponseEntity<Resource> view(@PathVariable Long id) throws IOException {
		Files file = filesService.getActiveFileOrThrow(id);
		Resource resource = filesService.loadFileAsResource(file);
		return ResponseEntity.ok()
				.contentType(MediaType.parseMediaType(contentType(file)))
				.header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + encodedFileName(file) + "\"")
				.body(resource);
	}

	@GetMapping("/files/{id}/download")
	public ResponseEntity<Resource> download(@PathVariable Long id) throws IOException {
		Files file = filesService.getActiveFileOrThrow(id);
		Resource resource = filesService.loadFileAsResource(file);
		return ResponseEntity.ok()
				.contentType(MediaType.parseMediaType(contentType(file)))
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodedFileName(file) + "\"")
				.body(resource);
	}

	@DeleteMapping("/files/{id}/delete")
	public ApiResponse delete(@PathVariable Long id) {
		return filesService.deleteFile(id);
	}

	private String contentType(Files file) {
		return file.getContentType() != null ? file.getContentType() : DEFAULT_CONTENT_TYPE;
	}

	private String encodedFileName(Files file) {
		String name = file.getOriginalFileName() != null ? file.getOriginalFileName() : file.getStoredFileName();
		return URLEncoder.encode(name, StandardCharsets.UTF_8).replace("+", "%20");
	}

}
