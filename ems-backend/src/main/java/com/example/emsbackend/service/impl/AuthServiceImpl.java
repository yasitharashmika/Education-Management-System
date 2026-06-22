package com.example.emsbackend.service.impl;

import com.example.emsbackend.dto.LoginRequestDTO;
import com.example.emsbackend.dto.LoginResponseDTO;
import com.example.emsbackend.entity.SystemUser;
import com.example.emsbackend.repository.SystemUserRepository;
import com.example.emsbackend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private SystemUserRepository userRepository;

    @Override
    public LoginResponseDTO loginUser(LoginRequestDTO loginRequest) {
        Optional<SystemUser> userOptional = userRepository.findByEmail(loginRequest.getEmail());

        if (userOptional.isPresent()) {
            SystemUser user = userOptional.get();

            if (user.getPassword().equals(loginRequest.getPassword())) {
                // Check if the password is a temporary one!
                boolean requiresReset = user.getPassword().startsWith("NEXUS-temp-");

                return new LoginResponseDTO(
                        "Login successful",
                        user.getFullName(),
                        user.getRole(),
                        user.getUserId(),
                        user.getCustomUserId(), // <-- NEW: Pass the Custom ID here!
                        requiresReset
                );
            }
        }
        throw new RuntimeException("Invalid email or password");
    }
}