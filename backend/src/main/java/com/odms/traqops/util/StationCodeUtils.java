package com.odms.traqops.util;

import java.util.regex.Pattern;

import com.odms.traqops.exception.ValidationException;


public final class StationCodeUtils {

	private static final Pattern STATION_CODE = Pattern.compile("^[A-Z0-9-]{2,20}$");

	private StationCodeUtils() {
	}

	public static String normalize(String stationCode) {
		if (stationCode == null || stationCode.isBlank()) {
			throw new ValidationException("Station code is required");
		}
		String normalized = stationCode.trim().toUpperCase();
		if (!STATION_CODE.matcher(normalized).matches()) {
			throw new ValidationException("Station code must be 2-20 letters, digits or hyphens");
		}
		return normalized;
	}

}
