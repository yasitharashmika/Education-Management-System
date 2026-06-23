package com.example.emsbackend.service.impl;

import com.example.emsbackend.dto.CourseDTO;
import com.example.emsbackend.dto.CourseAllocationViewDTO;
import com.example.emsbackend.dto.LecturerDropdownDTO;
import com.example.emsbackend.dto.AssignLecturerRequestDTO;
import com.example.emsbackend.entity.Course;
import com.example.emsbackend.repository.CourseRepository;
import com.example.emsbackend.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class CourseServiceImpl implements CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // ==========================================
    // EXISTING LOGIC (Preserved completely)
    // ==========================================

    @Override
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @Override
    @Transactional
    public Course createCourse(CourseDTO dto) {
        if (courseRepository.findByCourseCode(dto.getCourseCode()).isPresent()) {
            throw new RuntimeException("Course Code already exists!");
        }

        Course courseEntity = new Course();
        courseEntity.setCourseCode(dto.getCourseCode());
        courseEntity.setCourseName(dto.getCourseName());
        courseEntity.setCredits(dto.getCredits());
        courseEntity.setAcademicYear(dto.getAcademicYear());
        courseEntity.setSemester(dto.getSemester());
        courseEntity.setDepartment(dto.getDepartment());

        return courseRepository.save(courseEntity);
    }

    @Override
    @Transactional
    public Course updateCourse(Integer id, CourseDTO dto) {
        Course existingCourse = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (!existingCourse.getCourseCode().equals(dto.getCourseCode()) &&
                courseRepository.findByCourseCode(dto.getCourseCode()).isPresent()) {
            throw new RuntimeException("This Course Code is already in use.");
        }

        existingCourse.setCourseCode(dto.getCourseCode());
        existingCourse.setCourseName(dto.getCourseName());
        existingCourse.setCredits(dto.getCredits());
        existingCourse.setAcademicYear(dto.getAcademicYear());
        existingCourse.setSemester(dto.getSemester());
        existingCourse.setDepartment(dto.getDepartment());

        return courseRepository.save(existingCourse);
    }

    @Override
    @Transactional
    public void deleteCourse(Integer id) {
        if (!courseRepository.existsById(id)) {
            throw new RuntimeException("Course not found");
        }

        try {
            courseRepository.deleteById(id);
            courseRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Cannot delete this module because students are currently enrolled in it. Please remove the enrollments first.");
        }
    }

    @Override
    public List<Map<String, Object>> getEnrolledStudents(Integer courseId) {
        return jdbcTemplate.queryForList("EXEC sp_GetEnrolledStudents ?", courseId);
    }

    @Override
    @Transactional
    public void removeStudentFromCourse(Integer courseId, Integer userId) {
        try {
            int rowsAffected = jdbcTemplate.update("EXEC sp_RemoveStudentFromCourse ?, ?", courseId, userId);
            if (rowsAffected == 0) {
                throw new RuntimeException("Enrollment record not found or already removed.");
            }
        } catch (DataIntegrityViolationException e) {
            // Catches the FK constraint from the Grade table!
            throw new RuntimeException("Cannot remove this student because they already have graded assignments recorded for this module.");
        }
    }

    @Override
    @Transactional
    public void removeAllStudentsFromCourse(Integer courseId) {
        try {
            jdbcTemplate.update("EXEC sp_RemoveAllStudentsFromCourse ?", courseId);
        } catch (DataIntegrityViolationException e) {
            // Catches the FK constraint from the Grade table if ANY student has grades
            throw new RuntimeException("Cannot clear all students. One or more students already have graded assignments recorded for this module.");
        }
    }

    // ==========================================
    // NEW: LECTURER ASSIGNMENT LOGIC
    // ==========================================

    @Override
    public List<CourseAllocationViewDTO> getAllCourseAllocations() {
        String sql = "EXEC sp_GetAllAdminCourses";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            CourseAllocationViewDTO dto = new CourseAllocationViewDTO();
            dto.setCourseId(rs.getInt("CourseID"));
            dto.setCourseCode(rs.getString("CourseCode"));
            dto.setCourseName(rs.getString("CourseName"));

            // --- NEW: Added properties for frontend filtering ---
            dto.setAcademicYear(rs.getString("AcademicYear"));
            dto.setSemester(rs.getString("Semester"));
            dto.setDepartment(rs.getString("Department"));

            // Gracefully handle nullable FacultyID
            Object facultyIdObj = rs.getObject("FacultyID");
            dto.setFacultyId(facultyIdObj != null ? ((Number) facultyIdObj).intValue() : null);

            dto.setCurrentLecturer(rs.getString("CurrentLecturer"));
            return dto;
        });
    }

    @Override
    public List<LecturerDropdownDTO> getAvailableLecturers() {
        String sql = "EXEC sp_GetAllLecturers";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            LecturerDropdownDTO dto = new LecturerDropdownDTO();
            dto.setFacultyId(rs.getInt("FacultyID"));
            dto.setLecturerName(rs.getString("LecturerName"));
            dto.setDepartmentName(rs.getString("DepartmentName"));
            return dto;
        });
    }

    @Override
    @Transactional
    public void assignLecturer(AssignLecturerRequestDTO requestDTO) {
        String sql = "EXEC sp_AssignLecturerToCourse ?, ?";
        jdbcTemplate.update(sql, requestDTO.getCourseId(), requestDTO.getFacultyId());
    }
}