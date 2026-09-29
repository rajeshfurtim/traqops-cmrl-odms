package com.odms.traqops.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.odms.traqops.entity.Files;

public interface FilesRepository extends JpaRepository<Files, Long> {

	Optional<Files> findByIdAndIsActiveTrue(Long id);

	List<Files> findByReferenceTypeAndReferenceIdAndIsActiveTrueOrderByIdDesc(String referenceType, Long referenceId);

	List<Files> findByReferenceTypeAndReferenceIdInAndIsActiveTrue(String referenceType, List<Long> referenceIds);

	List<Files> findByReferenceTypeAndReferenceIdAndDocumentTypeAndIsActiveTrue(String referenceType, Long referenceId, String documentType);

}
