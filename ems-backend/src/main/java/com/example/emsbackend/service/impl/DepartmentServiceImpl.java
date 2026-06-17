package com.example.emsbackend.service.impl;

import com.example.emsbackend.dto.DepartmentRequestDTO;
import com.example.emsbackend.entity.Department;
import com.example.emsbackend.repository.DepartmentRepository;
import com.example.emsbackend.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentServiceImpl implements DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Override
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    @Override
    public Department saveDepartment(DepartmentRequestDTO dto) {
        // 1. Create a blank Entity
        Department departmentEntity = new Department();

        // 2. Transfer data from DTO to Entity
        departmentEntity.setDeptName(dto.getDeptName());
        departmentEntity.setHod(dto.getHod());
        departmentEntity.setBuilding(dto.getBuilding());
        departmentEntity.setEstablishedYear(dto.getEstablishedYear());

        // 3. Save to database
        return departmentRepository.save(departmentEntity);
    }
}