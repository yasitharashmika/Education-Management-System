package com.example.emsbackend.service;

import com.example.emsbackend.dto.StudentRequestDTO;
import com.example.emsbackend.entity.Student;
import java.util.List;

public interface StudentService {
    // GET Request: Fetch all students
    List<Student> getAllStudents();

    // POST Request: Save a new student using the DTO
    Student saveStudent(StudentRequestDTO studentDTO);
}