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
    // EXISTING LOGIC (Preser