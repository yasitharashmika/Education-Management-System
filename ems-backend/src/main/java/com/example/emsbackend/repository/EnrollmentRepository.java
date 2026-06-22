package com.example.emsbackend.repository;

import com.example.emsbackend.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Integer> {

    @Modifying
    @Transactional
    @Query(value = "EXEC sp_EnrollStudent :studentId, :courseId, :facultyId, :academicYear, :semester", nativeQuery = true)
    void enrollStudentProc(
            @Param("studentId") Integer studentId,
            @Param("courseId") Integer courseId,
            @Param("facultyId") Integer facultyId,
            @Param("academicYear") String academicYear,
            @Param("semester") String semester
    );
}