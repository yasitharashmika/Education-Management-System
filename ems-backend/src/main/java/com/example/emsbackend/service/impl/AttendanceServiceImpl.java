package com.example.emsbackend.service.impl;

import com.example.emsbackend.dto.AttendanceRequestDTO;
import com.example.emsbackend.entity.Attendance;
import com.example.emsbackend.repository.AttendanceRepository;
import com.example.emsbackend.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Override
    public List<Attendance> getAllAttendances() {
        return attendanceRepository.findAll();
    }

    @Override
    public Attendance saveAttendance(AttendanceRequestDTO dto) {
        Attendance attendanceEntity = new Attendance();

        attendanceEntity.setEnrollmentId(dto.getEnrollmentId());
        attendanceEntity.setAttendanceDate(dto.getAttendanceDate());
        attendanceEntity.setStatus(dto.getStatus());

        return attendanceRepository.save(attendanceEntity);
    }
}