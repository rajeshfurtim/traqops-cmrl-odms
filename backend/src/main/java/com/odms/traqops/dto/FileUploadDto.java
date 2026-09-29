package com.odms.traqops.dto;

import org.springframework.web.multipart.MultipartFile;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FileUploadDto {

	private String referenceType;

	private Long referenceId;

	private String documentType;

	private MultipartFile file;

}
