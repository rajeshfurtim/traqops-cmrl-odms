package com.odms.traqops.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.odms.traqops.dto.IdNameDto;
import com.odms.traqops.dto.LoginDto;
import com.odms.traqops.dto.LoginRequestDto;
import com.odms.traqops.dto.UserDto;
import com.odms.traqops.entity.User;
import com.odms.traqops.exception.ResourceNotFoundException;
import com.odms.traqops.repository.UserRepository;
import com.odms.traqops.response.DefaultListResponse;
import com.odms.traqops.security.CustomUserDetails;
import com.odms.traqops.security.JwtUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

	private final AuthenticationManager authenticationManager;
	private final JwtUtil jwtUtil;
	private final UserRepository userRepository;

	public DefaultListResponse<LoginDto> login(LoginRequestDto request) {
		try {
			Authentication authentication;
			try {
				authentication = authenticationManager.authenticate(
						new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
			} catch (BadCredentialsException | UsernameNotFoundException e) {
				log.info("Failed login attempt for {}", request.getEmail());
				throw new BadCredentialsException("Invalid email or password");
			}

			CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
			String token = jwtUtil.generateToken(userDetails);
			User user = findByEmail(userDetails.getEmail());

			LoginDto response = LoginDto.builder()
					.accessToken(token)
					.user(toUserResponse(user))
					.build();
			return DefaultListResponse.success("Login successful", response);
		} catch (AuthenticationException | ResourceNotFoundException e) {
			throw e;
		} catch (Exception e) {
			log.error("Error during login for {}", request.getEmail(), e);
			return DefaultListResponse.error("Something went wrong");
		}
	}

	public DefaultListResponse<UserDto> getCurrentUser(String email) {
		try {
			return DefaultListResponse.success("Current user fetched successfully", toUserResponse(findByEmail(email)));
		} catch (ResourceNotFoundException e) {
			throw e;
		} catch (Exception e) {
			log.error("Error fetching current user {}", email, e);
			return DefaultListResponse.error("Something went wrong");
		}
	}

	private User findByEmail(String email) {
		return userRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
	}

	private UserDto toUserResponse(User user) {
		UserDto dto = UserDto.builder()
				.email(user.getEmail())
				.fullName(user.getFullName())
				.role(new IdNameDto(user.getRole().getId(), user.getRole().getRoleCode()))
				.isFirstLogin(user.getIsFirstLogin())
				.build();
		dto.setId(user.getId());
		dto.setIsActive(user.getIsActive());
		dto.setCreatedAt(user.getCreatedAt());
		dto.setUpdatedAt(user.getUpdatedAt());
		return dto;
	}

}
