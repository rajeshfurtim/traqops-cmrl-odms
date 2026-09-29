package com.odms.traqops.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(name = "station_diary_entry", indexes = @Index(name = "idx_station_diary_entry_diary", columnList = "diary_id"))
public class StationDiaryEntry extends BaseEntity {

	@ManyToOne
	@JoinColumn(name = "diary_id")
	private StationDiary diary;

	@Column(columnDefinition = "TEXT")
	private String content;

	private Boolean important;

	private LocalDateTime loggedAt;

	private LocalDateTime editedAt;

	private Long authorId;

	private String authorName;

	private String authorEmployeeId;

	private Boolean isSystem;

}
