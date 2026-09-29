package com.odms.traqops.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.odms.traqops.service.dataseeder.DefaultUserSeederService;
import com.odms.traqops.service.dataseeder.UserRoleSeederService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

	private final UserRoleSeederService userRoleSeederService;
	private final DefaultUserSeederService defaultUserSeederService;

	@Override
	public void run(String... args) {
		userRoleSeederService.seed();
		defaultUserSeederService.seed();
	}

}
