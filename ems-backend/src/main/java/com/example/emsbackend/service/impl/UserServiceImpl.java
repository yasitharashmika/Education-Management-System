package com.example.emsbackend.service.impl;

import com.example.emsbackend.dto.CreateUserDTO;
import com.example.emsbackend.dto.UpdateUserDTO;
import com.example.emsbackend.entity.SystemUser;
import com.example.emsbackend.repository.SystemUserRepository;
import com.example.emsbackend.service.EmailService;
import com.example.emsbackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.dao.DataAccessException;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private SystemUserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public List<SystemUser> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    @Transactional
    public SystemUser createUser(CreateUserDTO dto) {
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists in the system.");
        }

        List<SystemUser> result = userRepository.executeCreateUserSp(
                dto.getFullName(),
                dto.getEmail(),
                dto.getPassword(),
                dto.getRole(),
                dto.getDepartment()
        );

        if (result != null && !result.isEmpty()) {
            SystemUser createdUser = result.get(0);

            // UPDATED: Pass the degree program down to the sync method
            syncRoleSpecificTables(dto.getFullName(), dto.getEmail(), dto.getRole(), dto.getDepartment(), dto.getDegreeProgram());

            try {
                emailService.sendAccountCreationEmail(
                        createdUser.getEmail(),
                        createdUser.getFullName(),
                        createdUser.getCustomUserId(),
                        dto.getPassword(),
                        createdUser.getRole()
                );
                System.out.println("Email sent successfully to: " + createdUser.getEmail());
            } catch (Exception e) {
                System.err.println("Database save succeeded, but email failed to send: " + e.getMessage());
            }

            return createdUser;
        } else {
            throw new RuntimeException("Stored procedure executed, but returned no data.");
        }
    }

    @Override
    @Transactional
    public SystemUser updateUser(Integer id, UpdateUserDTO dto) {
        SystemUser existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        String oldEmail = existingUser.getEmail();

        existingUser.setFullName(dto.getFullName());
        existingUser.setEmail(dto.getEmail());
        existingUser.setRole(dto.getRole());

        // UPDATED: Pass the degree program down to the update method
        updateRoleSpecificTables(oldEmail, dto.getFullName(), dto.getEmail(), dto.getRole(), dto.getDegreeProgram());

        if (dto.getNewPassword() != null && !dto.getNewPassword().isEmpty()) {
            existingUser.setPassword(dto.getNewPassword());

            try {
                emailService.sendPasswordResetEmail(
                        existingUser.getEmail(),
                        existingUser.getFullName(),
                        dto.getNewPassword()
                );
                System.out.println("Password reset email sent to: " + existingUser.getEmail());
            } catch (Exception e) {
                System.err.println("Database updated, but reset email failed to send: " + e.getMessage());
            }
        }

        return userRepository.save(existingUser);
    }

    @Override
    @Transactional
    public void deleteUser(Integer id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with ID: " + id);
        }

        SystemUser user = userRepository.findById(id).get();
        userRepository.deleteById(id);

        if ("Student".equalsIgnoreCase(user.getRole())) {
            jdbcTemplate.update("DELETE FROM Student WHERE Email = ?", user.getEmail());
        } else if ("Lecturer".equalsIgnoreCase(user.getRole())) {
            jdbcTemplate.update("DELETE FROM Faculty WHERE Email = ?", user.getEmail());
        }
    }

    @Override
    @Transactional
    public void changePassword(Integer userId, String newPassword) {
        SystemUser user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(newPassword);
        userRepository.save(user);
    }

    // ==========================================
    // PRIVATE HELPER METHODS FOR TABLE SYNC
    // ==========================================

    private void syncRoleSpecificTables(String fullName, String email, String role, String departmentName, String degreeProgram) {
        String[] nameParts = fullName.trim().split("\\s+", 2);
        String firstName = nameParts[0];
        String lastName = nameParts.length > 1 ? nameParts[1] : "";

        Integer matchingUserId = jdbcTemplate.queryForObject(
                "SELECT userId FROM SystemUser WHERE email = ?",
                Integer.class,
                email
        );

        Integer deptId = getDepartmentIdSafe(departmentName);

        if ("Student".equalsIgnoreCase(role)) {
            int count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM Student WHERE Email = ?", Integer.class, email);
            if (count == 0) {
                // UPDATED: Insert DegreeProgram into the database
                String sql = "SET IDENTITY_INSERT Student ON; " +
                        "INSERT INTO Student (StudentID, FirstName, LastName, Email, DepartmentID, EnrollmentYear, DegreeProgram) " +
                        "VALUES (?, ?, ?, ?, ?, YEAR(GETDATE()), ?); " +
                        "SET IDENTITY_INSERT Student OFF;";
                jdbcTemplate.update(sql, matchingUserId, firstName, lastName, email, deptId, degreeProgram);
            }
        } else if ("Lecturer".equalsIgnoreCase(role)) {
            int count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM Faculty WHERE Email = ?", Integer.class, email);
            if (count == 0) {
                String sql = "SET IDENTITY_INSERT Faculty ON; " +
                        "INSERT INTO Faculty (FacultyID, DepartmentID, FirstName, LastName, Email, Designation) " +
                        "VALUES (?, ?, ?, ?, ?, 'Lecturer'); " +
                        "SET IDENTITY_INSERT Faculty OFF;";
                jdbcTemplate.update(sql, matchingUserId, deptId, firstName, lastName, email);
            }
        }
    }

    private void updateRoleSpecificTables(String oldEmail, String newFullName, String newEmail, String role, String degreeProgram) {
        String[] nameParts = newFullName.trim().split("\\s+", 2);
        String firstName = nameParts[0];
        String lastName = nameParts.length > 1 ? nameParts[1] : "";

        if ("Student".equalsIgnoreCase(role)) {
            // UPDATED: Only update the degree program if they provided one in the UI
            if (degreeProgram != null && !degreeProgram.isEmpty()) {
                jdbcTemplate.update("UPDATE Student SET FirstName = ?, LastName = ?, Email = ?, DegreeProgram = ? WHERE Email = ?",
                        firstName, lastName, newEmail, degreeProgram, oldEmail);
            } else {
                jdbcTemplate.update("UPDATE Student SET FirstName = ?, LastName = ?, Email = ? WHERE Email = ?",
                        firstName, lastName, newEmail, oldEmail);
            }
        } else if ("Lecturer".equalsIgnoreCase(role)) {
            jdbcTemplate.update("UPDATE Faculty SET FirstName = ?, LastName = ?, Email = ? WHERE Email = ?",
                    firstName, lastName, newEmail, oldEmail);
        }
    }

    private Integer getDepartmentIdSafe(String departmentName) {
        try {
            return jdbcTemplate.queryForObject(
                    "SELECT DepartmentID FROM Department WHERE DeptName = ?",
                    Integer.class,
                    departmentName
            );
        } catch (DataAccessException e) {
            System.err.println("WARNING: Could not perfectly match '" + departmentName + "'. Defaulting to DepartmentID 1.");
            return 1;
        }
    }
}