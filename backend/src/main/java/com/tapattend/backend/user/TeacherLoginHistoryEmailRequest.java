package com.tapattend.backend.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record TeacherLoginHistoryEmailRequest(
        @NotBlank @Email String recipientEmail
) {
}