package com.tapattend.backend.user;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "student_attendance")
public class StudentAttendanceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String studentId;

    @Column(name = "attendance_date", nullable = false, updatable = false)
    private LocalDate attendanceDate;

    @Column(name = "attendance_time", nullable = false, updatable = false)
    private LocalTime attendanceTime;

    @Column(nullable = false, updatable = false)
    private Integer minute;

    @Column(nullable = false, updatable = false)
    private Integer second;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        attendanceDate = now.toLocalDate();
        attendanceTime = now.toLocalTime().withNano(0);
        minute = now.getMinute();
        second = now.getSecond();
    }

    public Long getId() {
        return id;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public LocalTime getAttendanceTime() {
        return attendanceTime;
    }

    public Integer getMinute() {
        return minute;
    }

    public Integer getSecond() {
        return second;
    }
}