package com.odms.traqops.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.odms.traqops.dto.PnNumberDto;
import com.odms.traqops.response.ApiResponse;
import com.odms.traqops.response.DefaultListResponse;
import com.odms.traqops.response.PageResponse;
import com.odms.traqops.security.CustomUserDetails;
import com.odms.traqops.service.PnNumberService;
import com.odms.traqops.util.PnNumberStatus;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PnNumberController {

	private final PnNumberService pnNumberService;

	@GetMapping("/pn-numbers")
	public PageResponse<PnNumberDto> list(
			@RequestParam(required = false) String stationCode,
			@RequestParam(required = false) PnNumberStatus status,
			@RequestParam(required = false) String search,
			@PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
		return pnNumberService.list(stationCode, status, search, pageable);
	}

	@GetMapping("/pn-numbers/{id}")
	public DefaultListResponse<PnNumberDto> getById(@PathVariable Long id) {
		return pnNumberService.getById(id);
	}

	@PostMapping("/pn-numbers/generate")
	public DefaultListResponse<PnNumberDto> generate(@RequestBody PnNumberDto request,
			@AuthenticationPrincipal CustomUserDetails principal) {
		return pnNumberService.generate(request, principal);
	}

	@PatchMapping("/pn-numbers/{id}/update")
	public ApiResponse update(@PathVariable Long id, @RequestBody PnNumberDto request,
			@AuthenticationPrincipal CustomUserDetails principal) {
		return pnNumberService.update(id, request, principal.getFullName());
	}

}
