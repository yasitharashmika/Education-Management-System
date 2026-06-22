package com.example.emsbackend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Course")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CourseID")
    private Integer courseId;

    @Column(name = "CourseCode", unique = true, nullable = false)
    private String courseCode;

    @Column(name = "CourseName", nullable = false)
    private String courseName;

    @Column(name = "Credits")
    private Integer credits;

    @Column(name = "AcademicYear")
    private String academicYear;

    @Column(name = "Semester")
    private String semester;

    @Column(name = "Department")
    private String department;
}