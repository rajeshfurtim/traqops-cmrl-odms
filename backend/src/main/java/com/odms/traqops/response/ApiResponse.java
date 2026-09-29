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
public class ApiResponse implements Serializable {

	private Boolean success;

	private String message;

	public static ApiResponse success(String message) {
		return new ApiResponse(Boolean.TRUE, message);
	}

	public static ApiResponse error(String message) {
		return new ApiResponse(Boolean.FALSE, message);
	}

}
