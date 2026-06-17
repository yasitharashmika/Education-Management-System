package com.example.emsbackend.service;

import com.example.emsbackend.dto.DepartmentRequestDTO;
import com.example.emsbackend.entity.Department;
import java.util.List;

public interface DepartmentService {
    // Fetch all departments
    List<Department> getAllDepartments();

    // Save a new department using the DTO
    Department saveDepartment(DepartmentRequestDTO departmentDTO);
}