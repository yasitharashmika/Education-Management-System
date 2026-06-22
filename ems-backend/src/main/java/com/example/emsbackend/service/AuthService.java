package com.example.emsbackend.service;

import com.example.emsbackend.dto.LoginRequestDTO;
import com.example.emsbackend.dto.LoginResponseDTO;

public interface AuthService {
    LoginResponseDTO loginUser(LoginRequestDTO loginRequest);
}