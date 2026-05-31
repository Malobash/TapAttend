package com.tapattend.backend.user;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank String studentId,
        @NotBlank String password
) {
}