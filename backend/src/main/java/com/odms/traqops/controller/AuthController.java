package com.odms.traqops.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.odms.traqops.dto.LoginDto;
import com.odms.traqops.dto.LoginRequestDto;
import com.odms.traqops.dto.UserDto;
import com.odms.traqops.response.DefaultListResponse;
import com.odms.traqops.security.CustomUserDetails;
import com.odms.traqops.service.AuthService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
public class AuthController {

	private final AuthService authService;

	@PostMapping("/auth/login")
	public DefaultListResponse<LoginDto> login(@RequestBody LoginRequestDto loginRequest) {
		log.info("loginRequest {}", loginRequest.getEmail());
		return authService.login(loginRequest);
	}

	@GetMapping("/api/currentuser")
	public DefaultListResponse<UserDto> getCurrentUser(@AuthenticationPrincipal CustomUserDetails principal) {
		return authService.getCurrentUser(principal.getEmail());
	}

}
