package com.odms.traqops.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileResponse {

	private Long id;

	private String referenceType;

	private Long referenceId;

	private String documentType;

	private String originalFileName;

	private String contentType;

	private Long fileSize;

	private String viewUrl;

	private String downloadUrl;

}
