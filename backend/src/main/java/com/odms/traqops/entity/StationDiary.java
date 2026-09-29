package com.odms.traqops.entity;

import java.time.LocalDate;

import com.odms.traqops.util.DiaryStatus;
import com.odms.traqops.util.ShiftCode;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "station_diary", uniqueConstraints = @UniqueConstraint(name = "uk_station_diary_station_date_shift",
		columnNames = { "station_code", "diary_date", "shift_code" }))
public class StationDiary extends BaseEntity {

	private String stationCode;

	private LocalDate diaryDate;

	@Enumerated(EnumType.STRING)
	private ShiftCode shiftCode;

	@Enumerated(EnumType.STRING)
	private DiaryStatus status;

}
