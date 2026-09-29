package com.odms.traqops.config;

import java.time.LocalDate;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "file")
public class FileStorageProperties {

	private String storageType = "local";

	private String uploadDir = "./uploads";

	private String s3BucketName;

	private String s3Region;

	private String s3AccessKey;

	private String s3SecretKey;

	private String s3Endpoint;

	/** Date/time-partitioned path segment (yyyy/MM/dd/HH) used to spread files across folders/keys. */
	public String getDateTimePath() {
		LocalDate today = LocalDate.now();
		int hour = java.time.LocalTime.now().getHour();
		return today.getYear() + "/" + today.getMonthValue() + "/" + today.getDayOfMonth() + "/" + hour;
	}

}
