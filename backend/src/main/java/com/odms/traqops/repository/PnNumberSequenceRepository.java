package com.odms.traqops.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.odms.traqops.entity.PnNumberSequence;

public interface PnNumberSequenceRepository extends JpaRepository<PnNumberSequence, Long> {

	@Transactional
	@Query(value = """
			INSERT INTO pn_number_sequence (station_code, sequence_year, last_value, updated_at)
			VALUES (:stationCode, :sequenceYear, 1, now())
			ON CONFLICT (station_code, sequence_year)
			DO UPDATE SET last_value = pn_number_sequence.last_value + 1, updated_at = now()
			RETURNING last_value
			""", nativeQuery = true)
	Long nextValue(@Param("stationCode") String stationCode, @Param("sequenceYear") Integer sequenceYear);

}
