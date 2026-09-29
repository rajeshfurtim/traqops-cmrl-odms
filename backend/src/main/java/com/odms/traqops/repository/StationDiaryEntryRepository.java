package com.odms.traqops.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.odms.traqops.entity.StationDiaryEntry;

public interface StationDiaryEntryRepository extends JpaRepository<StationDiaryEntry, Long> {

	Optional<StationDiaryEntry> findByIdAndIsActiveTrue(Long id);

	List<StationDiaryEntry> findByDiaryIdAndIsActiveTrueOrderByLoggedAtAscIdAsc(Long diaryId);

}
