package com.example.emsbackend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Enrollment")
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "EnrollmentID")
    private Integer enrollmentId;

    @Column(name = "StudentID")
    private Integer studentId;

    @Column(name = "CourseID")
    private Integer courseId;

    @Column(name = "FacultyID")
    private Integer facultyId;

    @Column(name = "AcademicYear")
    private String academicYear;

    @Column(name = "Semester")
    private String semester;

    @Column(name = "Status")
    private String status;
}