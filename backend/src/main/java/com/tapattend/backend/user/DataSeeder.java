package com.tapattend.backend.user;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() > 0) {
                return;
            }

            UserEntity user = new UserEntity();
            user.setStudentId("2026-STD-0142");
            user.setFullName("Amina Bello");
            user.setEmail("amina.bello@campus.edu");
            user.setPassword(passwordEncoder.encode("student123"));
            user.setRole("STUDENT");
            userRepository.save(user);
        };
    }
}