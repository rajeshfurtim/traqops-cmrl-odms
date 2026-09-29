package com.odms.traqops.security;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class JwtUtil {

	private final Key signingKey;

	private final long expirationMs;

	public JwtUtil(@Value("${jwt.secret}") String secret, @Value("${jwt.expiration-ms}") long expirationMs) {
		this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
		this.expirationMs = expirationMs;
	}

	public String generateToken(CustomUserDetails userDetails) {
		Map<String, Object> claims = new HashMap<>();
		claims.put("id", userDetails.getId());
		claims.put("fullName", userDetails.getFullName());
		claims.put("role", userDetails.getRoleCode());

		Date now = new Date();
		Date expiry = new Date(now.getTime() + expirationMs);

		return Jwts.builder()
				.setClaims(claims)
				.setSubject(userDetails.getEmail())
				.setIssuedAt(now)
				.setExpiration(expiry)
				.signWith(signingKey, SignatureAlgorithm.HS256)
				.compact();
	}

	public Claims parseClaims(String token) throws JwtException {
		return Jwts.parserBuilder().setSigningKey(signingKey).build().parseClaimsJws(token).getBody();
	}

	public String extractEmail(String token) {
		return parseClaims(token).getSubject();
	}

	public boolean isTokenValid(String token, UserDetails userDetails) {
		try {
			Claims claims = parseClaims(token);
			return claims.getSubject().equals(userDetails.getUsername()) && claims.getExpiration().after(new Date());
		} catch (ExpiredJwtException e) {
			log.debug("JWT expired: {}", e.getMessage());
			return false;
		} catch (JwtException | IllegalArgumentException e) {
			log.debug("Invalid JWT: {}", e.getMessage());
			return false;
		}
	}

}
