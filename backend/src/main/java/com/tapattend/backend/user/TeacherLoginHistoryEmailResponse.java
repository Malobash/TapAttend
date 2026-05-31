package com.tapattend.backend.user;

import java.time.LocalDate;

public record TeacherLoginHistoryEmailResponse(
        String message,
        String recipientEmail,
        int loginCount,
        LocalDate reportDate
) {
}