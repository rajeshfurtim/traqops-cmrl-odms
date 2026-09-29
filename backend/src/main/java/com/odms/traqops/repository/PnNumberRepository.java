package com.odms.traqops.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;

import com.odms.traqops.entity.PnNumber;

import jakarta.persistence.LockModeType;

public interface PnNumberRepository extends JpaRepository<PnNumber, Long>, JpaSpecificationExecutor<PnNumber> {

	Optional<PnNumber> findByIdAndIsActiveTrue(Long id);

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	Optional<PnNumber> findForUpdateByIdAndIsActiveTrue(Long id);

}
