package com.example.emsbackend.service.impl;

import com.example.emsbackend.dto.StudentProfileDTO;
import com.example.emsbackend.dto.StudentRequestDTO;
import com.example.emsbackend.entity.Student;
import com.example.emsbackend.repository.StudentRepository;
import com.example.emsbackend.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentServiceImpl implements StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @Override
    public Student saveStudent(StudentRequestDTO dto) {
        Student studentEntity = new Student();

        studentEntity.setDepartmentId(dto.getDepartmentId());
        studentEntity.setFirstName(dto.getFirstName());
        studentEntity.setLastName(dto.getLastName());
        studentEntity.setEmail(dto.getEmail());
        studentEntity.setEnrollmentYear(dto.getEnrollmentYear());
        studentEntity.setDegreeProgram(dto.getDegreeProgram());
        studentEntity.setCurrentGpa(0.00);

        return studentRepository.save(studentEntity);
    }

    @Override
    public StudentProfileDTO getStudentProfile(Integer studentId) {
        String sql = "EXEC sp_GetStudentProfile ?";

        try {
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                StudentProfileDTO profile = new StudentProfileDTO();
                profile.setFullName(rs.getString("FullName"));
                profile.setEmail(rs.getString("Email"));
                profile.setDegreeProgram(rs.getString("DegreeProgram"));
                profile.setCurrentAcademicYear(rs.getString("CurrentAcademicYear"));
                profile.setCurrentSemester(rs.getString("CurrentSemester"));
                return profile;
            }, studentId);

        } catch (EmptyResultDataAccessException e) {
            // SAFE FALLBACK: If 0 rows are returned, don't crash! Just send default empty data.
            StudentProfileDTO fallbackProfile = new StudentProfileDTO();
            fallbackProfile.setFullName("Unknown User");
            fallbackProfile.setEmail("N/A");
            fallbackProfile.setDegreeProgram("Degree Program Not Assigned");
            fallbackProfile.setCurrentAcademicYear("N/A");
            fallbackProfile.setCurrentSemester("Not Enrolled");
            return fallbackProfile;
        }
    }
}