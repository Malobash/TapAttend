package com.tapattend.backend.user;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.lang.Nullable;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserLoginHistoryRepository userLoginHistoryRepository;
    private final StudentAttendanceRepository studentAttendanceRepository;
    private final PasswordEncoder passwordEncoder;

    @Nullable
    @Autowired(required = false)
    private JavaMailSender mailSender;

    public UserService(
            UserRepository userRepository,
            UserLoginHistoryRepository userLoginHistoryRepository,
            StudentAttendanceRepository studentAttendanceRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.userLoginHistoryRepository = userLoginHistoryRepository;
        this.studentAttendanceRepository = studentAttendanceRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserResponse> findAll() {
        return userRepository.findAll().stream()
                .map(UserResponse::fromEntity)
                .toList();
    }

    public UserResponse findById(Long id) {
        return UserResponse.fromEntity(getUser(id));
    }

    public UserResponse create(UserRequest request) {
        if (userRepository.existsByStudentId(request.studentId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Student ID already exists");
        }

        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        UserEntity user = new UserEntity();
        applyRequest(user, request);
        return UserResponse.fromEntity(userRepository.save(user));
    }

    public UserResponse update(Long id, UserRequest request) {
        UserEntity existing = getUser(id);

        userRepository.findByStudentId(request.studentId())
                .filter(user -> !user.getId().equals(id))
                .ifPresent(user -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Student ID already exists");
                });

        boolean emailExistsOnOtherUser = userRepository.findAll().stream()
                .filter(user -> user.getEmail().equalsIgnoreCase(request.email()))
                .anyMatch(user -> !user.getId().equals(id));

        if (emailExistsOnOtherUser) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        applyRequest(existing, request);
        return UserResponse.fromEntity(userRepository.save(existing));
    }

    public void delete(Long id) {
        UserEntity existing = getUser(id);
        userLoginHistoryRepository.deleteByUserId(existing.getId());
        studentAttendanceRepository.deleteByStudentId(existing.getStudentId());
        userRepository.delete(existing);
    }

    @Transactional
    public void deleteByStudentId(String studentId) {
        userRepository.findByStudentId(studentId).ifPresent(user -> {
            userLoginHistoryRepository.deleteByUserId(user.getId());
            studentAttendanceRepository.deleteByStudentId(user.getStudentId());
            userRepository.delete(user);
        });
    }

    public LoginResponse login(LoginRequest request) {
        UserEntity user = userRepository.findByStudentId(request.studentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        boolean passwordMatches = passwordEncoder.matches(request.password(), user.getPassword());
        boolean legacyPasswordMatches = user.getPassword().equals(request.password());

        if (!passwordMatches && !legacyPasswordMatches) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        if (legacyPasswordMatches) {
            user.setPassword(passwordEncoder.encode(request.password()));
            userRepository.save(user);
        }

        UserLoginHistoryEntity history = new UserLoginHistoryEntity();
        history.setUser(user);
        userLoginHistoryRepository.save(history);

        StudentAttendanceEntity attendance = new StudentAttendanceEntity();
        attendance.setStudentId(user.getStudentId());
        studentAttendanceRepository.save(attendance);

        return new LoginResponse(
                "Login successful",
                user.getId(),
                user.getStudentId(),
                user.getFullName(),
                user.getRole()
        );
    }

    @Transactional(readOnly = true)
    public TeacherLoginHistoryEmailResponse sendTodayLoginHistoryEmail(TeacherLoginHistoryEmailRequest request) {
        String recipientEmail = request.recipientEmail().trim();
        LocalDate reportDate = LocalDate.now();
        LocalDateTime startOfDay = reportDate.atStartOfDay();
        LocalDateTime startOfNextDay = reportDate.plusDays(1).atStartOfDay();

        List<UserLoginHistoryEntity> loginHistory = userLoginHistoryRepository.findAllForPeriod(startOfDay, startOfNextDay);
        String emailBody = buildLoginHistoryEmailBody(reportDate, loginHistory);

        if (mailSender == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Email service is not configured. Set spring.mail.* properties in application.properties.");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(recipientEmail);
        message.setSubject("TapAttend login history for " + reportDate);
        message.setText(emailBody);
        mailSender.send(message);

        return new TeacherLoginHistoryEmailResponse(
                "Email sent successfully",
                recipientEmail,
                loginHistory.size(),
                reportDate
        );
    }

    private UserEntity getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private void applyRequest(UserEntity user, UserRequest request) {
        user.setStudentId(request.studentId());
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
    }

    private String buildLoginHistoryEmailBody(LocalDate reportDate, List<UserLoginHistoryEntity> loginHistory) {
        StringBuilder body = new StringBuilder();
        body.append("TapAttend login history for ").append(reportDate).append(System.lineSeparator())
                .append(System.lineSeparator())
                .append("ID | Student Name | Time").append(System.lineSeparator())
                .append("--- | --- | ---").append(System.lineSeparator());

        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm:ss");

        if (loginHistory.isEmpty()) {
            body.append("No login history found for today.");
            return body.toString();
        }

        for (UserLoginHistoryEntity history : loginHistory) {
            body.append(history.getUser().getId())
                    .append(" | ")
                    .append(history.getUser().getFullName())
                    .append(" | ")
                    .append(history.getLoginAt().toLocalTime().format(timeFormatter))
                    .append(System.lineSeparator());
        }

        return body.toString();
    }
}