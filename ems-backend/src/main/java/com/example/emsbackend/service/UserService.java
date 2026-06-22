package com.example.emsbackend.service;

import com.example.emsbackend.dto.CreateUserDTO;
import com.example.emsbackend.dto.UpdateUserDTO;
import com.example.emsbackend.entity.SystemUser;
import java.util.List;

public interface UserService {
    List<SystemUser> getAllUsers();
    SystemUser createUser(CreateUserDTO createUserDTO);
    SystemUser updateUser(Integer id, UpdateUserDTO updateUserDTO);
    void deleteUser(Integer id);
    void changePassword(Integer userId, String newPassword);
}