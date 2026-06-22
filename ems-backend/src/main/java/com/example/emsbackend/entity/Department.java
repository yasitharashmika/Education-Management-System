package com.example.emsbackend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Department")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "DepartmentID")
    private Integer departmentId;

    @Column(name = "DeptName")
    private String deptName;

    @Column(name = "HOD")
    private String hod;

    @Column(name = "Building")
    private String building;

    @Column(name = "EstablishedYear")
    private Integer establishedYear;
}