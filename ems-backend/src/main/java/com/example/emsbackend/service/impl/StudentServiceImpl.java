package com.example.emsbackend.service.impl;

import com.example.emsbackend.dto.StudentRequestDTO;
import com.example.emsbackend.entity.Student;
import com.example.emsbackend.repository.StudentRepository;
import com.example.emsbackend.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentServiceImpl implements StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Override
    public List<Student> getAllStudents() {
        return studentRepository.findAll(); // Fetches data from SQL
    }

    @Override
    public Student saveStudent(StudentRequestDTO dto) {
        // 1. Create a blank Entity
        Student studentEntity = new Student();

        // 2. Transfer data from the DTO to the Entity securely
        studentEntity.setDepartmentId(dto.getDepartmentId());
        studentEntity.setFirstName(dto.getFirstName());
        studentEntity.setLastName(dto.getLastName());
        studentEntity.setEmail(dto.getEmail());
        studentEntity.setEnrollmentYear(dto.getEnrollmentYear());

        // 3. Set the default GPA for a brand new student
        studentEntity.setCurrentGpa(0.00);

        // 4. Save the populated entity to the database
        return studentRepository.save(studentEntity);
    }
}