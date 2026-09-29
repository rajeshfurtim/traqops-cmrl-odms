package com.odms.traqops.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public abstract class BaseDto {

	private Long id;

	private Boolean isActive;

	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;

}
