package com.odms.traqops.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Files {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String referenceType;

	private Long referenceId;

	private String documentType;

	private String originalFileName;

	private String storedFileName;

	private String contentType;

	private Long fileSize;

	private String filePath;

	private Boolean isActive;

	private String createdBy;

}
