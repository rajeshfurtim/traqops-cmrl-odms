package com.odms.traqops.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "pn_number_sequence", uniqueConstraints = @UniqueConstraint(name = "uk_pn_number_sequence_station_year",
		columnNames = { "station_code", "sequence_year" }))
public class PnNumberSequence {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String stationCode;

	private Integer sequenceYear;

	private Long lastValue;

	private LocalDateTime updatedAt;

}
