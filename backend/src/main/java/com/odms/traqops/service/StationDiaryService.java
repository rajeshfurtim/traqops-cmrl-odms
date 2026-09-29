package com.odms.traqops.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.odms.traqops.dto.FileResponse;
import com.odms.traqops.dto.StationDiaryDto;
import com.odms.traqops.dto.StationDiaryEntryDto;
import com.odms.traqops.entity.StationDiary;
import com.odms.traqops.entity.StationDiaryEntry;
import com.odms.traqops.exception.ForbiddenException;
import com.odms.traqops.exception.ResourceNotFoundException;
import com.odms.traqops.exception.ValidationException;
import com.odms.traqops.repository.StationDiaryEntryRepository;
import com.odms.traqops.repository.StationDiaryRepository;
import com.odms.traqops.response.ApiResponse;
import com.odms.traqops.response.DefaultListResponse;
import com.odms.traqops.response.PageResponse;
import com.odms.traqops.security.CustomUserDetails;
import com.odms.traqops.util.DiaryStatus;
import com.odms.traqops.util.FileType;
import com.odms.traqops.util.ShiftCode;
import com.odms.traqops.util.SpecificationUtils;
import com.odms.traqops.util.StationCodeUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Service
@RequiredArgsConstructor
@Slf4j
public class StationDiaryService {

	private static final String ENTRY_REFERENCE_TYPE = FileType.STATION_DIARY_ENTRY.name();
	private static final int CONTENT_MAX_LENGTH = 10000;

	private final StationDiaryRepository stationDiaryRepository;
	private final StationDiaryEntryRepository stationDiaryEntryRepository;
	private final FilesService filesService;


	public PageResponse<StationDiaryDto> list(String stationCode, LocalDate fromDate, LocalDate toDate, ShiftCode shiftCode,
			Pageable pageable) {
		try {
			Specification<StationDiary> spec = SpecificationUtils.allOf(
					SpecificationUtils.<StationDiary>activeEquals(true),
					stationCodeEquals(stationCode),
					diaryDateFrom(fromDate),
					diaryDateTo(toDate),
					shiftCodeEquals(shiftCode));
			Page<StationDiaryDto> page = stationDiaryRepository.findAll(spec, pageable).map(this::toDiaryResponse);
			return PageResponse.success("Station diaries fetched successfully", page);
		} catch (ValidationException e) {
			throw e;
		} catch (Exception e) {
			log.error("Error fetching station diaries", e);
			return PageResponse.error("Something went wrong");
		}
	}

	public DefaultListResponse<StationDiaryDto> getById(Long id) {
		try {
			StationDiary diary = findDiaryOrThrow(id);
			List<StationDiaryEntry> entries = stationDiaryEntryRepository.findByDiaryIdAndIsActiveTrueOrderByLoggedAtAscIdAsc(id);
			Map<Long, List<FileResponse>> filesByEntry = filesService.listActiveFilesByReferenceIds(ENTRY_REFERENCE_TYPE,
					entries.stream().map(StationDiaryEntry::getId).toList());

			StationDiaryDto dto = toDiaryResponse(diary);
			dto.setEntries(entries.stream()
					.map(entry -> toEntryResponse(entry, diary, filesByEntry.getOrDefault(entry.getId(), List.of())))
					.toList());
			return DefaultListResponse.success("Station diary fetched successfully", dto);
		} catch (ResourceNotFoundException e) {
			throw e;
		} catch (Exception e) {
			log.error("Error fetching station diary with id {}", id, e);
			return DefaultListResponse.error("Something went wrong");
		}
	}

	@Transactional(readOnly = true)
	public DefaultListResponse<StationDiaryEntryDto> getEntryById(Long id) {
		try {
			StationDiaryEntry entry = findEntryOrThrow(id);
			return DefaultListResponse.success("Diary entry fetched successfully",
					toEntryResponse(entry, entry.getDiary(), filesService.listActiveFiles(ENTRY_REFERENCE_TYPE, id)));
		} catch (ResourceNotFoundException e) {
			throw e;
		} catch (Exception e) {
			log.error("Error fetching diary entry with id {}", id, e);
			return DefaultListResponse.error("Something went wrong");
		}
	}

	@Transactional
	public ApiResponse createEntry(StationDiaryEntryDto request, CustomUserDetails principal) {
		String stationCode = StationCodeUtils.normalize(request.getStationCode());
		if (request.getDiaryDate() == null) {
			throw new ValidationException("Diary date is required");
		}
		if (request.getShiftCode() == null) {
			throw new ValidationException("Shift is required (A, G, B or C)");
		}
		String content = requireContent(request.getContent());

		StationDiary diary = resolveDiary(stationCode, request.getDiaryDate(), request.getShiftCode(), principal.getFullName());
		requireOpen(diary);

		StationDiaryEntry entry = new StationDiaryEntry();
		entry.setDiary(diary);
		entry.setContent(content);
		entry.setImportant(Boolean.TRUE.equals(request.getImportant()));
		entry.setLoggedAt(LocalDateTime.now());
		entry.setAuthorId(principal.getId());
		entry.setAuthorName(principal.getFullName());
		entry.setIsSystem(false);
		entry.setIsActive(true);
		entry.setCreatedBy(principal.getFullName());
		entry.setUpdatedBy(principal.getFullName());
		stationDiaryEntryRepository.save(entry);

		attachFiles(request.getAttachments(), entry.getId(), principal.getFullName());
		return ApiResponse.success("Diary entry logged successfully");
	}

	@Transactional
	public ApiResponse updateEntry(Long id, StationDiaryEntryDto request, CustomUserDetails principal) {
		StationDiaryEntry entry = findEntryOrThrow(id);
		requireChangeable(entry, principal);

		boolean changed = false;
		if (request.getContent() != null) {
			String content = requireContent(request.getContent());
			changed |= !content.equals(entry.getContent());
			entry.setContent(content);
		}
		if (request.getImportant() != null) {
			changed |= !request.getImportant().equals(entry.getImportant());
			entry.setImportant(request.getImportant());
		}
		if (request.getRemoveAttachmentIds() != null) {
			for (Long fileId : request.getRemoveAttachmentIds()) {
				filesService.detachFile(fileId, ENTRY_REFERENCE_TYPE, entry.getId());
				changed = true;
			}
		}
		changed |= attachFiles(request.getAttachments(), entry.getId(), principal.getFullName());

		if (changed) {
			// The logged time never changes; editedAt shows the entry was changed afterwards.
			entry.setEditedAt(LocalDateTime.now());
			entry.setUpdatedBy(principal.getFullName());
			stationDiaryEntryRepository.save(entry);
		}
		return ApiResponse.success("Diary entry updated successfully");
	}

	@Transactional
	public ApiResponse deleteEntry(Long id, CustomUserDetails principal) {
		StationDiaryEntry entry = findEntryOrThrow(id);
		requireChangeable(entry, principal);

		entry.setIsActive(false);
		entry.setUpdatedBy(principal.getFullName());
		stationDiaryEntryRepository.save(entry);
		return ApiResponse.success("Diary entry deleted successfully");
	}

	private StationDiary resolveDiary(String stationCode, LocalDate diaryDate, ShiftCode shiftCode, String actor) {
		stationDiaryRepository.insertIfAbsent(stationCode, diaryDate, shiftCode.name(), LocalDateTime.now(), actor);
		return stationDiaryRepository.findByStationCodeAndDiaryDateAndShiftCode(stationCode, diaryDate, shiftCode)
				.orElseThrow(() -> new IllegalStateException(
						"Station diary " + stationCode + "/" + diaryDate + "/" + shiftCode + " missing after insert"));
	}

	private void requireOpen(StationDiary diary) {
		if (diary.getStatus() != DiaryStatus.OPEN) {
			throw new ValidationException("This shift has been handed over and is locked. Entries can no longer be changed.");
		}
	}

	private void requireChangeable(StationDiaryEntry entry, CustomUserDetails principal) {
		if (Boolean.TRUE.equals(entry.getIsSystem())) {
			throw new ValidationException("Entries recorded by ODMS cannot be changed");
		}
		if (!Objects.equals(entry.getAuthorId(), principal.getId())) {
			throw new ForbiddenException("You can only change entries you logged yourself");
		}
		requireOpen(entry.getDiary());
	}

	private String requireContent(String content) {
		if (content == null || content.isBlank()) {
			throw new ValidationException("Entry text is required");
		}
		String trimmed = content.trim();
		if (trimmed.length() > CONTENT_MAX_LENGTH) {
			throw new ValidationException("Entry text must be " + CONTENT_MAX_LENGTH + " characters or fewer");
		}
		return trimmed;
	}

	private boolean attachFiles(List<MultipartFile> attachments, Long entryId, String actor) {
		boolean attached = false;
		if (attachments != null) {
			for (MultipartFile file : attachments) {
				if (file != null && !file.isEmpty()) {
					filesService.attachFile(file, ENTRY_REFERENCE_TYPE, entryId, null, actor);
					attached = true;
				}
			}
		}
		return attached;
	}

	private StationDiary findDiaryOrThrow(Long id) {
		return stationDiaryRepository.findByIdAndIsActiveTrue(id)
				.orElseThrow(() -> new ResourceNotFoundException("Station diary not found with id: " + id));
	}

	private StationDiaryEntry findEntryOrThrow(Long id) {
		return stationDiaryEntryRepository.findByIdAndIsActiveTrue(id)
				.orElseThrow(() -> new ResourceNotFoundException("Diary entry not found with id: " + id));
	}

	private Specification<StationDiary> stationCodeEquals(String stationCode) {
		if (stationCode == null || stationCode.isBlank()) {
			return null;
		}
		String normalized = StationCodeUtils.normalize(stationCode);
		return (root, query, cb) -> cb.equal(root.get("stationCode"), normalized);
	}

	private Specification<StationDiary> diaryDateFrom(LocalDate fromDate) {
		return fromDate == null ? null : (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("diaryDate"), fromDate);
	}

	private Specification<StationDiary> diaryDateTo(LocalDate toDate) {
		return toDate == null ? null : (root, query, cb) -> cb.lessThanOrEqualTo(root.get("diaryDate"), toDate);
	}

	private Specification<StationDiary> shiftCodeEquals(ShiftCode shiftCode) {
		return shiftCode == null ? null : (root, query, cb) -> cb.equal(root.get("shiftCode"), shiftCode);
	}

	private StationDiaryDto toDiaryResponse(StationDiary diary) {
		StationDiaryDto dto = StationDiaryDto.builder()
				.stationCode(diary.getStationCode())
				.diaryDate(diary.getDiaryDate())
				.shiftCode(diary.getShiftCode())
				.status(diary.getStatus())
				.build();
		dto.setId(diary.getId());
		dto.setIsActive(diary.getIsActive());
		dto.setCreatedAt(diary.getCreatedAt());
		dto.setUpdatedAt(diary.getUpdatedAt());
		return dto;
	}

	private StationDiaryEntryDto toEntryResponse(StationDiaryEntry entry, StationDiary diary, List<FileResponse> files) {
		StationDiaryEntryDto dto = StationDiaryEntryDto.builder()
				.diaryId(diary.getId())
				.stationCode(diary.getStationCode())
				.diaryDate(diary.getDiaryDate())
				.shiftCode(diary.getShiftCode())
				.content(entry.getContent())
				.important(entry.getImportant())
				.loggedAt(entry.getLoggedAt())
				.editedAt(entry.getEditedAt())
				.authorId(entry.getAuthorId())
				.authorName(entry.getAuthorName())
				.authorEmployeeId(entry.getAuthorEmployeeId())
				.isSystem(entry.getIsSystem())
				.files(files)
				.build();
		dto.setId(entry.getId());
		dto.setIsActive(entry.getIsActive());
		dto.setCreatedAt(entry.getCreatedAt());
		dto.setUpdatedAt(entry.getUpdatedAt());
		return dto;
	}

}
