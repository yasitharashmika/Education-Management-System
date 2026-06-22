package com.example.emsbackend.service;

import com.example.emsbackend.dto.StudentProfileDTO;
import com.example.emsbackend.dto.StudentRequestDTO;
import com.example.emsbackend.entity.Student;
import java.util.List;

public interface StudentService {
    // GET Request: Fetch all students
    List<Student> getAllStudents();

    // POST Request: Save a new student using the DTO
    Student saveStudent(StudentRequestDTO studentDTO);

    // GET Request: Fetch dynamic student profile from Stored Procedure
    StudentProfileDTO getStudentProfile(Integer studentId);
}