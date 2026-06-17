package com.example.emsbackend.service;

import com.example.emsbackend.dto.FacultyRequestDTO;
import com.example.emsbackend.entity.Faculty;
import java.util.List;

public interface FacultyService {
    List<Faculty> getAllFaculties();
    Faculty saveFaculty(FacultyRequestDTO facultyDTO);
}