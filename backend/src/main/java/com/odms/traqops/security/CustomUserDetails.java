package com.odms.traqops.security;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.odms.traqops.entity.User;

import lombok.Getter;

@Getter
public class CustomUserDetails implements UserDetails {

	private static final long serialVersionUID = 1L;

	private final Long id;
	private final String fullName;
	private final String email;
	private final String password;
	private final String roleCode;
	private final boolean active;

	public CustomUserDetails(User user) {
		this.id = user.getId();
		this.fullName = user.getFullName();
		this.email = user.getEmail();
		this.password = user.getPassword();
		this.roleCode = user.getRole().getRoleCode();
		this.active = Boolean.TRUE.equals(user.getIsActive());
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return List.of(new SimpleGrantedAuthority("ROLE_" + roleCode));
	}

	@Override
	public String getUsername() {
		return email;
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return active;
	}

}
