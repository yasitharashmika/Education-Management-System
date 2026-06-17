package com.example.emsbackend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;

@Entity
@Data
@Table(name = "Grade")
public class Grade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "GradeID")
    private Integer gradeId;

    @Column(name = "EnrollmentID")
    private Integer enrollmentId;

    @Column(name = "MidtermMarks")
    private Double midtermMarks;

    @Column(name = "FinalMarks")
    private Double finalMarks;

    @Column(name = "LetterGrade")
    private String letterGrade;

    @Column(name = "GPAPoints")
    private Double gpaPoints;

    @Column(name = "GradeDate", insertable = false, updatable = false)
    private Date gradeDate; // Automatically handled by SQL Server GETDATE()
}