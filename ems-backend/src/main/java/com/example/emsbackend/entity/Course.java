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

    @Column(name = "DepartmentID")
    private Integer departmentId;

    @Column(name = "CourseCode")
    private String courseCode;

    @Column(name = "CourseName")
    private String courseName;

    @Column(name = "Credits")
    private Integer credits;

    @Column(name = "Semester")
    private String semester;
}