package com.odms.traqops.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.odms.traqops.entity.StationDiary;
import com.odms.traqops.util.ShiftCode;

public interface StationDiaryRepository extends JpaRepository<StationDiary, Long>, JpaSpecificationExecutor<StationDiary> {

	Optional<StationDiary> findByIdAndIsActiveTrue(Long id);

	Optional<StationDiary> findByStationCodeAndDiaryDateAndShiftCode(String stationCode, LocalDate diaryDate, ShiftCode shiftCode);

	@Modifying
	@Transactional
	@Query(value = """
			INSERT INTO station_diary (station_code, diary_date, shift_code, status, is_active, created_at, updated_at, created_by, updated_by)
			VALUES (:stationCode, :diaryDate, :shiftCode, 'OPEN', true, :now, :now, :actor, :actor)
			ON CONFLICT (station_code, diary_date, shift_code) DO NOTHING
			""", nativeQuery = true)
	int insertIfAbsent(@Param("stationCode") String stationCode, @Param("diaryDate") LocalDate diaryDate,
			@Param("shiftCode") String shiftCode, @Param("now") LocalDateTime now, @Param("actor") String actor);

}
