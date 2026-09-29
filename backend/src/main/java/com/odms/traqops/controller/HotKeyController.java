package com.odms.traqops.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.odms.traqops.dto.HotKeyDto;
import com.odms.traqops.response.ApiResponse;
import com.odms.traqops.response.DefaultListResponse;
import com.odms.traqops.security.CustomUserDetails;
import com.odms.traqops.service.HotKeyService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class HotKeyController {

	private final HotKeyService hotKeyService;

	@GetMapping("/hot-keys")
	public DefaultListResponse<List<HotKeyDto>> list(@RequestParam String stationCode) {
		return hotKeyService.list(stationCode);
	}

	@PostMapping("/hot-keys/add")
	public DefaultListResponse<HotKeyDto> create(@RequestBody HotKeyDto request,
			@AuthenticationPrincipal CustomUserDetails principal) {
		return hotKeyService.create(request, principal.getFullName());
	}

	@PatchMapping("/hot-keys/{id}/update")
	public ApiResponse update(@PathVariable Long id, @RequestBody HotKeyDto request,
			@AuthenticationPrincipal CustomUserDetails principal) {
		return hotKeyService.update(id, request, principal.getFullName());
	}

	@DeleteMapping("/hot-keys/{id}/delete")
	public ApiResponse delete(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails principal) {
		return hotKeyService.delete(id, principal.getFullName());
	}

}
