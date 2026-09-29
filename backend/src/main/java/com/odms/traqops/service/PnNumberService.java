package com.odms.traqops.service;

import java.time.LocalDateTime;
import java.util.regex.Pattern;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.odms.traqops.dto.PnNumberDto;
import com.odms.traqops.entity.PnNumber;
import com.odms.traqops.exception.ResourceNotFoundException;
import com.odms.traqops.exception.ValidationException;
import com.odms.traqops.repository.PnNumberRepository;
import com.odms.traqops.repository.PnNumberSequenceRepository;
import com.odms.traqops.response.ApiResponse;
import com.odms.traqops.response.DefaultListResponse;
import com.odms.traqops.response.PageResponse;
import com.odms.traqops.security.CustomUserDetails;
import com.odms.traqops.util.PnNumberStatus;
import com.odms.traqops.util.SpecificationUtils;
import com.odms.traqops.util.StationCodeUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PnNumberService {

	private static final String PN_FORMAT = "PN/%s/%d/%06d";
	private static final Pattern EXCHANGED_PN_NO = Pattern.compile("^\\d{2}$");
	private static final int EXCHANGED_WITH_MAX_LENGTH = 100;
	private static final int PURPOSE_MAX_LENGTH = 1000;

	private final PnNumberRepository pnNumberRepository;
	private final PnNumberSequenceRepository pnNumberSequenceRepository;

	public PageResponse<PnNumberDto> list(String stationCode, PnNumberStatus status, String search, Pageable pageable) {
		try {
			Specification<PnNumber> spec = SpecificationUtils.allOf(
					SpecificationUtils.<PnNumber>activeEquals(true),
					stationCodeEquals(stationCode),
					statusEquals(status),
					SpecificationUtils.<PnNumber>fieldContainsIgnoreCase("pnNumber", search));
			Page<PnNumberDto> page = pnNumberRepository.findAll(spec, pageable).map(this::toResponse);
			return PageResponse.success("PN numbers fetched successfully", page);
		} catch (ValidationException e) {
			throw e;
		} catch (Exception e) {
			log.error("Error fetching PN numbers", e);
			return PageResponse.error("Something went wrong");
		}
	}

	public DefaultListResponse<PnNumberDto> getById(Long id) {
		try {
			return DefaultListResponse.success("PN number fetched successfully", toResponse(findOrThrow(id)));
		} catch (ResourceNotFoundException e) {
			throw e;
		} catch (Exception e) {
			log.error("Error fetching PN number with id {}", id, e);
			return DefaultListResponse.error("Something went wrong");
		}
	}

	@Transactional
	public DefaultListResponse<PnNumberDto> generate(PnNumberDto request, CustomUserDetails principal) {
		String stationCode = StationCodeUtils.normalize(request.getStationCode());
		LocalDateTime now = LocalDateTime.now();
		int year = now.getYear();

		Long value = pnNumberSequenceRepository.nextValue(stationCode, year);

		PnNumber pnNumber = new PnNumber();
		pnNumber.setPnNumber(String.format(PN_FORMAT, stationCode, year, value));
		pnNumber.setStationCode(stationCode);
		pnNumber.setSequenceYear(year);
		pnNumber.setSequenceValue(value);
		pnNumber.setStatus(PnNumberStatus.GENERATED);
		pnNumber.setGeneratedAt(now);
		pnNumber.setGeneratedById(principal.getId());
		pnNumber.setGeneratedByName(principal.getFullName());
		pnNumber.setIsActive(true);
		pnNumber.setCreatedBy(principal.getFullName());
		pnNumber.setUpdatedBy(principal.getFullName());

		return DefaultListResponse.success("PN number generated successfully", toResponse(pnNumberRepository.save(pnNumber)));
	}

	@Transactional
	public ApiResponse update(Long id, PnNumberDto request, String updatedBy) {
		String exchangedWith = requireText(request.getExchangedWith(), "Exchanged with", EXCHANGED_WITH_MAX_LENGTH);
		String exchangedPnNo = requireExchangedPnNo(request.getExchangedPnNo());
		String purpose = requireText(request.getPurpose(), "Purpose of PN exchange", PURPOSE_MAX_LENGTH);

		PnNumber pnNumber = pnNumberRepository.findForUpdateByIdAndIsActiveTrue(id)
				.orElseThrow(() -> new ResourceNotFoundException("PN number not found with id: " + id));
		if (pnNumber.getStatus() == PnNumberStatus.EXCHANGED) {
			throw new ValidationException("The exchange for " + pnNumber.getPnNumber() + " is already recorded");
		}

		pnNumber.setExchangedWith(exchangedWith);
		pnNumber.setExchangedPnNo(exchangedPnNo);
		pnNumber.setPurpose(purpose);
		pnNumber.setStatus(PnNumberStatus.EXCHANGED);
		pnNumber.setExchangedAt(LocalDateTime.now());
		pnNumber.setUpdatedBy(updatedBy);

		pnNumberRepository.save(pnNumber);
		return ApiResponse.success("PN exchange saved successfully");
	}

	private PnNumber findOrThrow(Long id) {
		return pnNumberRepository.findByIdAndIsActiveTrue(id)
				.orElseThrow(() -> new ResourceNotFoundException("PN number not found with id: " + id));
	}

	private String requireExchangedPnNo(String exchangedPnNo) {
		String trimmed = exchangedPnNo == null ? "" : exchangedPnNo.trim();
		if (!EXCHANGED_PN_NO.matcher(trimmed).matches()) {
			throw new ValidationException("Exchanged PN No must be exactly 2 digits, e.g. 07");
		}
		return trimmed;
	}

	private String requireText(String value, String fieldName, int maxLength) {
		String trimmed = value == null ? "" : value.trim();
		if (trimmed.isEmpty()) {
			throw new ValidationException(fieldName + " is required");
		}
		if (trimmed.length() > maxLength) {
			throw new ValidationException(fieldName + " must be " + maxLength + " characters or fewer");
		}
		return trimmed;
	}

	private Specification<PnNumber> stationCodeEquals(String stationCode) {
		if (stationCode == null || stationCode.isBlank()) {
			return null;
		}
		String normalized = StationCodeUtils.normalize(stationCode);
		return (root, query, cb) -> cb.equal(root.get("stationCode"), normalized);
	}

	private Specification<PnNumber> statusEquals(PnNumberStatus status) {
		return status == null ? null : (root, query, cb) -> cb.equal(root.get("status"), status);
	}

	private PnNumberDto toResponse(PnNumber pnNumber) {
		PnNumberDto dto = PnNumberDto.builder()
				.pnNumber(pnNumber.getPnNumber())
				.stationCode(pnNumber.getStationCode())
				.status(pnNumber.getStatus())
				.generatedAt(pnNumber.getGeneratedAt())
				.generatedByName(pnNumber.getGeneratedByName())
				.exchangedWith(pnNumber.getExchangedWith())
				.exchangedPnNo(pnNumber.getExchangedPnNo())
				.purpose(pnNumber.getPurpose())
				.exchangedAt(pnNumber.getExchangedAt())
				.build();
		dto.setId(pnNumber.getId());
		dto.setIsActive(pnNumber.getIsActive());
		dto.setCreatedAt(pnNumber.getCreatedAt());
		dto.setUpdatedAt(pnNumber.getUpdatedAt());
		return dto;
	}

}
