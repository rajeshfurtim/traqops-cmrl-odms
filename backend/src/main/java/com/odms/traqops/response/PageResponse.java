package com.odms.traqops.response;

import java.io.Serializable;
import java.util.List;

import org.springframework.data.domain.Page;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class PageResponse<T> implements Serializable {

	private Boolean success;

	private String message;

	private List<T> data;

	private int page;

	private int size;

	private long totalElements;

	private int totalPages;

	public static <T> PageResponse<T> success(String message, Page<T> page) {
		return new PageResponse<>(Boolean.TRUE, message, page.getContent(), page.getNumber(), page.getSize(),
				page.getTotalElements(), page.getTotalPages());
	}

	public static <T> PageResponse<T> error(String message) {
		return new PageResponse<>(Boolean.FALSE, message, List.of(), 0, 0, 0L, 0);
	}

}
