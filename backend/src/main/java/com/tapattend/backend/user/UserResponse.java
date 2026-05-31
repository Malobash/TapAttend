package com.tapattend.backend.user;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String studentId,
        String fullName,
        String email,
        String role,
        LocalDateTime createdAt
) {

    public static UserResponse fromEntity(UserEntity user) {
        return new UserResponse(
                user.getId(),
                user.getStudentId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}