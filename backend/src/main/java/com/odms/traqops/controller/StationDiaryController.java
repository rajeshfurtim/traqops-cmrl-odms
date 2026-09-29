package com.odms.traqops.controller;

import java.time.LocalDate;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.odms.traqops.dto.StationDiaryDto;
import com.odms.traqops.dto.StationDiaryEntryDto;
import com.odms.traqops.response.ApiResponse;
import com.odms.traqops.response.DefaultListResponse;
import com.odms.traqops.response.PageResponse;
import com.odms.traqops.security.CustomUserDetails;
import com.odms.traqops.service.StationDiaryService;
import com.odms.traqops.util.ShiftCode;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class StationDiaryController {

	private final StationDiaryService stationDiaryService;

	@GetMapping("/station-diaries")
	public PageResponse<StationDiaryDto> list(
			@RequestParam(required = false) String stationCode,
			@RequestParam(required = false) LocalDate fromDate,
			@RequestParam(required = false) LocalDate toDate,
			@RequestParam(required = false) ShiftCode shiftCode,
			@PageableDefault(size = 20, sort = { "diaryDate", "id" }, direction = Sort.Direction.DESC) Pageable pageable) {
		return stationDiaryService.list(stationCode, fromDate, toDate, shiftCode, pageable);
	}

	@GetMapping("/station-diaries/{id}")
	public DefaultListResponse<StationDiaryDto> getById(@PathVariable Long id) {
		return stationDiaryService.getById(id);
	}

	@GetMapping("/station-diaries/entries/{id}")
	public DefaultListResponse<StationDiaryEntryDto> getEntryById(@PathVariable Long id) {
		return stationDiaryService.getEntryById(id);
	}

	@PostMapping(value = "/station-diaries/entries/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ApiResponse createEntry(@ModelAttribute StationDiaryEntryDto request,
			@AuthenticationPrincipal CustomUserDetails principal) {
		return stationDiaryService.createEntry(request, principal);
	}

	@PatchMapping(value = "/station-diaries/entries/{id}/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ApiResponse updateEntry(@PathVariable Long id, @ModelAttribute StationDiaryEntryDto request,
			@AuthenticationPrincipal CustomUserDetails principal) {
		return stationDiaryService.updateEntry(id, request, principal);
	}

	@DeleteMapping("/station-diaries/entries/{id}/delete")
	public ApiResponse deleteEntry(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails principal) {
		return stationDiaryService.deleteEntry(id, principal);
	}

}
