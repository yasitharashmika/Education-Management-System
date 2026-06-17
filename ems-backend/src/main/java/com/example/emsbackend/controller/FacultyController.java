package com.example.emsbackend.controller;

import com.example.emsbackend.dto.FacultyRequestDTO;
import com.example.emsbackend.entity.Faculty;
import com.example.emsbackend.service.FacultyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faculties")
@CrossOrigin(origins = "*")
public class FacultyController {

    @Autowired
    private FacultyService facultyService;

    @GetMapping
    public List<Faculty> getAllFaculties() {
        return facultyService.getAllFaculties();
    }

    @PostMapping
    public Faculty createFaculty(@RequestBody FacultyRequestDTO facultyDTO) {
        return facultyService.saveFaculty(facultyDTO);
    }
}