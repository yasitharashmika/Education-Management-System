package com.example.emsbackend.repository;

import com.example.emsbackend.entity.SystemUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SystemUserRepository extends JpaRepository<SystemUser, Integer> {

    // Custom query to find a user by their email
    Optional<SystemUser> findByEmail(String email);

    // Call the SQL Server Stored Procedure to generate the custom ID and insert the user
    @Query(value = "EXEC sp_CreateSystemUser :fullName, :email, :password, :role, :department", nativeQuery = true)
    List<SystemUser> executeCreateUserSp(
            @Param("fullName") String fullName,
            @Param("email") String email,
            @Param("password") String password,
            @Param("role") String role,
            @Param("department") String department
    );
}