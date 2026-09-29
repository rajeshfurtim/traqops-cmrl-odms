package com.odms.traqops.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.odms.traqops.entity.HotKey;

public interface HotKeyRepository extends JpaRepository<HotKey, Long> {

	Optional<HotKey> findByIdAndIsActiveTrue(Long id);

	List<HotKey> findByStationCodeAndIsActiveTrueOrderByIdAsc(String stationCode);

	boolean existsByStationCodeAndLabelIgnoreCaseAndIsActiveTrue(String stationCode, String label);

	boolean existsByStationCodeAndLabelIgnoreCaseAndIsActiveTrueAndIdNot(String stationCode, String label, Long id);

}
