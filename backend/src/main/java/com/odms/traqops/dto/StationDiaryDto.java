package com.odms.traqops.dto;

import java.time.LocalDate;
import java.util.List;

import com.odms.traqops.util.DiaryStatus;
import com.odms.traqops.util.ShiftCode;

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
public class StationDiaryDto extends BaseDto {

	private String stationCode;

	private LocalDate diaryDate;

	private ShiftCode shiftCode;

	private DiaryStatus status;

	private List<StationDiaryEntryDto> entries;

}
