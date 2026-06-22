package com.example.emsbackend.controller;

import com.example.emsbackend.dto.CreateUserDTO;
import com.example.emsbackend.dto.UpdateUserDTO;
import com.example.emsbackend.entity.SystemUser;
import com.example.emsbackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<SystemUser>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/create")
    public ResponseEntity<?> createUser(@RequestBody CreateUserDTO dto) {
        try {
            SystemUser newUser = userService.createUser(dto);
            return ResponseEntity.ok(newUser);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Database error: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @RequestBody UpdateUserDTO dto) {
        try {
            return ResponseEntity.ok(userService.updateUser(id, dto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody com.example.emsbackend.dto.ChangePasswordDTO dto) {
        try {
            userService.changePassword(dto.getUserId(), dto.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(Map.of("message", e.getMessage()));
        }
    }
}
