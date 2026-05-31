package com.tapattend.backend.user;

public record LoginResponse(
        String message,
        Long id,
        String studentId,
        String fullName,
        String role
) {
}