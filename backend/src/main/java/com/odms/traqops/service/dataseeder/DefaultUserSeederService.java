package com.odms.traqops.service.dataseeder;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.odms.traqops.entity.User;
import com.odms.traqops.entity.UserRole;
import com.odms.traqops.repository.UserRepository;
import com.odms.traqops.repository.UserRoleRepository;
import com.odms.traqops.util.UserRoleConstants;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DefaultUserSeederService {

	private final UserRepository userRepository;
	private final UserRoleRepository userRoleRepository;
	private final PasswordEncoder passwordEncoder;

	private record SeedUser(String fullName, String email, String password, String roleCode) {
	}

	private static final List<SeedUser> SEED_USERS = List.of(
			new SeedUser("Admin", "admin@traqops.com", "admin@123", UserRoleConstants.ADMIN),
			new SeedUser("Station Controller", "stationcontroller@traqops.com", "stationcontroller@123", UserRoleConstants.STATION_CONTROLLER),
			new SeedUser("Station Incharge", "stationincharge@traqops.com", "stationincharge@123", UserRoleConstants.STATION_INCHARGE),
			new SeedUser("Line Incharge", "lineincharge@traqops.com", "lineincharge@123", UserRoleConstants.LINE_INCHARGE));

	public void seed() {
		for (SeedUser seedUser : SEED_USERS) {
			if (userRepository.existsByEmail(seedUser.email())) {
				log.info("User '{}' already seeded", seedUser.email());
				continue;
			}

			UserRole role = userRoleRepository.findByRoleCode(seedUser.roleCode())
					.orElseThrow(() -> new IllegalStateException(
							seedUser.roleCode() + " role not found - UserRoleSeederService must run before DefaultUserSeederService"));

			User user = new User();
			user.setFullName(seedUser.fullName());
			user.setEmail(seedUser.email());
			user.setPassword(passwordEncoder.encode(seedUser.password()));
			user.setIsFirstLogin(true);
			user.setRole(role);

			userRepository.save(user);
			log.warn("Seeded default {} user '{}' with the configured default password - change it immediately.",
					seedUser.roleCode(), seedUser.email());
		}
	}

}
