package com.odms.traqops.dto;

import java.time.LocalDateTime;

import com.odms.traqops.util.PnNumberStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PnNumberDto extends BaseDto {

	private String pnNumber;

	private String stationCode;

	private PnNumberStatus status;

	private LocalDateTime generatedAt;

	private String generatedByName;

	private String exchangedWith;

	private String exchangedPnNo;

	private String purpose;

	private LocalDateTime exchangedAt;

}
