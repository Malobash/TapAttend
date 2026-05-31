package com.tapattend.backend.user;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentAttendanceRepository extends JpaRepository<StudentAttendanceEntity, Long> {

    void deleteByStudentId(String studentId);
}