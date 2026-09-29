package com.odms.traqops.service.dataseeder;

import java.util.List;

import org.springframework.stereotype.Service;

import com.odms.traqops.entity.UserRole;
import com.odms.traqops.repository.UserRoleRepository;
import com.odms.traqops.util.UserRoleConstants;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserRoleSeederService {

	private final UserRoleRepository userRoleRepository;

	private record SeedRole(String code, String name, String description) {
	}

	private static final List<SeedRole> SEED_ROLES = List.of(
			new SeedRole(UserRoleConstants.ADMIN, "Admin", "Global scope - full access to every module, including user administration"),
			new SeedRole(UserRoleConstants.STATION_CONTROLLER, "Station Controller", "Station scope - runs the shift: station diary, hot keys, PN numbers"),
			new SeedRole(UserRoleConstants.STATION_INCHARGE, "Station Incharge", "Station scope - supervises the station's controllers and records"),
			new SeedRole(UserRoleConstants.LINE_INCHARGE, "Line Incharge", "Line scope - oversees every station on the assigned line"));

	public void seed() {
		for (SeedRole seedRole : SEED_ROLES) {
			if (!userRoleRepository.existsByRoleCode(seedRole.code())) {
				UserRole userRole = new UserRole();
				userRole.setRoleCode(seedRole.code());
				userRole.setRoleName(seedRole.name());
				userRole.setDescription(seedRole.description());
				userRoleRepository.save(userRole);
				log.info("Seeded role {}", seedRole.code());
			}
		}
	}

}
