package com.example.emsbackend.controller;

import com.example.emsbackend.dto.LoginRequestDTO;
import com.example.emsbackend.dto.LoginResponseDTO;
import com.example.emsbackend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map; // Import Map for the clean error response

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginRequest) {
        try {
            // The Controller blindly passes the DTO to the Service layer
            LoginResponseDTO response = authService.loginUser(loginRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // If the Service throws an error (wrong password)