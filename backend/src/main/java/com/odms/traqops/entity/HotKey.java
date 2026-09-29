package com.odms.traqops.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class HotKey extends BaseEntity {

	private String stationCode;

	private String label;

	@Column(columnDefinition = "TEXT")
	private String template;

}
