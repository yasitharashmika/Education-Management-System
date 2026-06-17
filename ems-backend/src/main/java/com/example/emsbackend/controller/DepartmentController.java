package com.example.emsbackend.controller;

import com.example.emsbackend.dto.DepartmentRequestDTO;
import com.example.emsbackend.entity.Department;
import com.example.emsbackend.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@CrossOrigin(origins = "*") // Allows React frontend to connect
public class DepartmentController {

    @Autowired
    private DepartmentService departmentService;

    // GET Endpoint: http://localhost:8080/api/departments
    @GetMapping
    public List<Department> getAllDepartments() {
        return departmentService.getAllDepartments();
    }

    // POST Endpoint: http://localhost:8080/api/departments
    @PostMapping
    public Department createDepartment(@RequestBody DepartmentRequestDTO departmentDTO) {
        return departmentService.saveDepartment(departmentDTO);
    }
}