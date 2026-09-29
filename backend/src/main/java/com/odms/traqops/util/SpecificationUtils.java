package com.odms.traqops.util;

import java.util.Arrays;
import java.util.Objects;

import org.springframework.data.jpa.domain.Specification;

public final class SpecificationUtils {

	private SpecificationUtils() {
	}

	@SafeVarargs
	public static <T> Specification<T> allOf(Specification<T>... specs) {
		return Specification.allOf(Arrays.stream(specs).filter(Objects::nonNull).toList());
	}

	public static <T> Specification<T> activeEquals(Boolean isActive) {
		if (isActive == null) {
			return null;
		}
		return (root, query, cb) -> cb.equal(root.get("isActive"), isActive);
	}

	public static <T> Specification<T> fieldContainsIgnoreCase(String field, String value) {
		if (value == null || value.isBlank()) {
			return null;
		}
		String pattern = "%" + value.trim().toLowerCase() + "%";
		return (root, query, cb) -> cb.like(cb.lower(root.get(field)), pattern);
	}

}
