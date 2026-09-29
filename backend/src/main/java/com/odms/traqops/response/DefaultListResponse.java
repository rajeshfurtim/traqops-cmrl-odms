package com.odms.traqops.response;

import java.io.Serializable;

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
public class DefaultListResponse<T> implements Serializable {

	private Boolean success;

	private String message;

	private T data;

	public static <T> DefaultListResponse<T> success(String message, T data) {
		return new DefaultListResponse<>(Boolean.TRUE, message, data);
	}

	public static <T> DefaultListResponse<T> error(String message) {
		return new DefaultListResponse<>(Boolean.FALSE, message, null);
	}

}
