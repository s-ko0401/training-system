package com.minami.training_system.controller;

import com.minami.training_system.dto.TeacherResponse;
import com.minami.training_system.entity.User;
import com.minami.training_system.security.CustomUserDetails;
import com.minami.training_system.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/teachers")
    public ResponseEntity<List<TeacherResponse>> listTeachers() {
        List<TeacherResponse> teachers = userService.findTeachers().stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(teachers);
    }

    private TeacherResponse toResponse(User user) {
        return new TeacherResponse(user.getId(), user.getUserId(), user.getUserName(), user.getUserEmail());
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userService.findById(userDetails.getUser().getId());

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "userId", user.getUserId() != null ? user.getUserId() : "",
                "userName", user.getUserName(),
                "userEmail", user.getUserEmail(),
                "role", user.getRole(),
                "trainingStatus", user.getTrainingStatus() != null ? user.getTrainingStatus() : "未開始"));
    }
}
