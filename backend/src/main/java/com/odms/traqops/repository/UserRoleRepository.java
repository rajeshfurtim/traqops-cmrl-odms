package com.odms.traqops.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.odms.traqops.entity.UserRole;

public interface UserRoleRepository extends JpaRepository<UserRole, Long>, JpaSpecificationExecutor<UserRole> {

	Optional<UserRole> findByRoleCode(String roleCode);

	boolean existsByRoleCode(String roleCode);

	List<UserRole> findByIsActiveTrue();

}
