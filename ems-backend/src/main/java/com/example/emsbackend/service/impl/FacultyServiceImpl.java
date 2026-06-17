package com.example.emsbackend.service.impl;

import com.example.emsbackend.dto.FacultyRequestDTO;
import com.example.emsbackend.entity.Faculty;
import com.example.emsbackend.repository.FacultyRepository;
import com.example.emsbackend.service.FacultyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FacultyServiceImpl implements FacultyService {

    @Autowired
    private FacultyRepository facultyRepository;

    @Override
    public List<Faculty> getAllFaculties() {
        return facultyRepository.findAll();
    }

    @Override
    public Faculty saveFaculty(FacultyRequestDTO dto) {
        Faculty facultyEntity = new Faculty();

        facultyEntity.setDepartmentId(dto.getDepartmentId());
        facultyEntity.setFirstName(dto.getFirstName());
        facultyEntity.setLastName(dto.getLastName());
        facultyEntity.setEmail(dto.getEmail());
        facultyEntity.setDesignation(dto.getDesignation());

        return facultyRepository.save(facultyEntity);
    }
}