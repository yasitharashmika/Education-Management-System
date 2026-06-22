package com.example.emsbackend.repository;

import com.example.emsbackend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {

    // EXECUTING THE T-SQL STORED PROCEDURE FOR A SPECIFIC STUDENT
    @Query(value = "EXEC sp_GetStudentReportCard :studentId", nativeQuery = true)
    List<Object[]> getStudentReportCard(@Param("studentId") Integer studentId);
}