package com.odms.traqops.entity;

import java.time.LocalDateTime;

import com.odms.traqops.util.PnNumberStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class PnNumber extends BaseEntity {

	private String pnNumber;

	private String stationCode;

	private Integer sequenceYear;

	private Long sequenceValue;

	@Enumerated(EnumType.STRING)
	private PnNumberStatus status;

	private LocalDateTime generatedAt;

	private Long generatedById;

	private String generatedByName;

	private String exchangedWith;

	private String exchangedPnNo;

	@Column(columnDefinition = "TEXT")
	private String purpose;

	private LocalDateTime exchangedAt;

}
