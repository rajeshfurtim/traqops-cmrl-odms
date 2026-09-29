package com.odms.traqops.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.odms.traqops.dto.HotKeyDto;
import com.odms.traqops.entity.HotKey;
import com.odms.traqops.exception.DuplicateResourceException;
import com.odms.traqops.exception.ResourceNotFoundException;
import com.odms.traqops.exception.ValidationException;
import com.odms.traqops.repository.HotKeyRepository;
import com.odms.traqops.response.ApiResponse;
import com.odms.traqops.response.DefaultListResponse;
import com.odms.traqops.util.StationCodeUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class HotKeyService {

	private static final int LABEL_MAX_LENGTH = 24;
	private static final int TEMPLATE_MAX_LENGTH = 2000;

	private final HotKeyRepository hotKeyRepository;

	public DefaultListResponse<List<HotKeyDto>> list(String stationCode) {
		try {
			String normalized = StationCodeUtils.normalize(stationCode);
			List<HotKeyDto> hotKeys = hotKeyRepository.findByStationCodeAndIsActiveTrueOrderByIdAsc(normalized)
					.stream()
					.map(this::toResponse)
					.toList();
			return DefaultListResponse.success("Hot keys fetched successfully", hotKeys);
		} catch (ValidationException e) {
			throw e;
		} catch (Exception e) {
			log.error("Error fetching hot keys for station {}", stationCode, e);
			return DefaultListResponse.error("Something went wrong");
		}
	}

	public DefaultListResponse<HotKeyDto> create(HotKeyDto request, String createdBy) {
		try {
			String stationCode = StationCodeUtils.normalize(request.getStationCode());
			String label = requireLabel(request.getLabel());
			String template = requireTemplate(request.getTemplate());

			if (hotKeyRepository.existsByStationCodeAndLabelIgnoreCaseAndIsActiveTrue(stationCode, label)) {
				throw new DuplicateResourceException("A hot key named \"" + label + "\" already exists");
			}

			HotKey hotKey = new HotKey();
			hotKey.setStationCode(stationCode);
			hotKey.setLabel(label);
			hotKey.setTemplate(template);
			hotKey.setIsActive(true);
			hotKey.setCreatedBy(createdBy);
			hotKey.setUpdatedBy(createdBy);

			return DefaultListResponse.success("Hot key saved successfully", toResponse(hotKeyRepository.save(hotKey)));
		} catch (DuplicateResourceException | ValidationException e) {
			throw e;
		} catch (Exception e) {
			log.error("Error creating hot key", e);
			return DefaultListResponse.error("Something went wrong");
		}
	}

	public ApiResponse update(Long id, HotKeyDto request, String updatedBy) {
		try {
			HotKey hotKey = findOrThrow(id);

			if (request.getLabel() != null) {
				String label = requireLabel(request.getLabel());
				if (hotKeyRepository.existsByStationCodeAndLabelIgnoreCaseAndIsActiveTrueAndIdNot(hotKey.getStationCode(), label, id)) {
					throw new DuplicateResourceException("A hot key named \"" + label + "\" already exists");
				}
				hotKey.setLabel(label);
			}
			if (request.getTemplate() != null) {
				hotKey.setTemplate(requireTemplate(request.getTemplate()));
			}
			hotKey.setUpdatedBy(updatedBy);

			hotKeyRepository.save(hotKey);
			return ApiResponse.success("Hot key updated successfully");
		} catch (ResourceNotFoundException | DuplicateResourceException | ValidationException e) {
			throw e;
		} catch (Exception e) {
			log.error("Error updating hot key with id {}", id, e);
			return ApiResponse.error("Something went wrong");
		}
	}

	public ApiResponse delete(Long id, String updatedBy) {
		try {
			HotKey hotKey = findOrThrow(id);
			hotKey.setIsActive(false);
			hotKey.setUpdatedBy(updatedBy);
			hotKeyRepository.save(hotKey);
			return ApiResponse.success("Hot key deleted successfully");
		} catch (ResourceNotFoundException e) {
			throw e;
		} catch (Exception e) {
			log.error("Error deleting hot key with id {}", id, e);
			return ApiResponse.error("Something went wrong");
		}
	}

	private HotKey findOrThrow(Long id) {
		return hotKeyRepository.findByIdAndIsActiveTrue(id)
				.orElseThrow(() -> new ResourceNotFoundException("Hot key not found with id: " + id));
	}

	private String requireLabel(String label) {
		String normalized = label == null ? "" : label.trim().replaceAll("\\s+", " ");
		if (normalized.isEmpty()) {
			throw new ValidationException("Enter a name for the hot key");
		}
		if (normalized.length() > LABEL_MAX_LENGTH) {
			throw new ValidationException("Keep the hot key name to " + LABEL_MAX_LENGTH + " characters or fewer");
		}
		return normalized;
	}

	private String requireTemplate(String template) {
		String trimmed = template == null ? "" : template.trim();
		if (trimmed.isEmpty()) {
			throw new ValidationException("Enter the message this hot key adds");
		}
		if (trimmed.length() > TEMPLATE_MAX_LENGTH) {
			throw new ValidationException("Keep the hot key message to " + TEMPLATE_MAX_LENGTH + " characters or fewer");
		}
		return trimmed;
	}

	private HotKeyDto toResponse(HotKey hotKey) {
		HotKeyDto dto = HotKeyDto.builder()
				.stationCode(hotKey.getStationCode())
				.label(hotKey.getLabel())
				.template(hotKey.getTemplate())
				.build();
		dto.setId(hotKey.getId());
		dto.setIsActive(hotKey.getIsActive());
		dto.setCreatedAt(hotKey.getCreatedAt());
		dto.setUpdatedAt(hotKey.getUpdatedAt());
		return dto;
	}

}
