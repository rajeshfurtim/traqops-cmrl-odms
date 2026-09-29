package com.odms.traqops.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
public class StationDiaryEntryDto extends BaseDto {

	private Long diaryId;

	private String stationCode;

	private LocalDate diaryDate;

	private ShiftCode shiftCode;

	private String content;

	private Boolean important;

	private LocalDateTime loggedAt;

	private LocalDateTime editedAt;

	private Long authorId;

	private String authorName;

	private String authorEmployeeId;

	private Boolean isSystem;

	private List<FileResponse> files;

	@JsonIgnore
	private List<MultipartFile> attachments;

	@JsonIgnore
	private List<Long> removeAttachmentIds;

}
