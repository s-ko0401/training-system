package com.minami.training_system.controller;

import com.minami.training_system.dto.DailyReportFeedbackRequest;
import com.minami.training_system.dto.DailyReportListResponse;
import com.minami.training_system.dto.DailyReportRequest;
import com.minami.training_system.dto.DailyReportResponse;
import com.minami.training_system.entity.User;
import com.minami.training_system.security.CustomUserDetails;
import com.minami.training_system.service.DailyReportService;
import com.minami.training_system.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/daily-reports")
@CrossOrigin(origins = "http://localhost:5173")
public class DailyReportController {

    private final DailyReportService dailyReportService;
    private final UserService userService;

    public DailyReportController(DailyReportService dailyReportService, UserService userService) {
        this.dailyReportService = dailyReportService;
        this.userService = userService;
    }

    @GetMapping("/my")
    public ResponseEntity<?> myReports() {
        User currentUser = getCurrentUser();
        try {
            List<DailyReportResponse> reports = dailyReportService.listMyReports(currentUser);
            return ResponseEntity.ok(reports);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createReport(@Valid @RequestBody DailyReportRequest request) {
        User currentUser = getCurrentUser();
        try {
            DailyReportResponse response = dailyReportService.createReport(currentUser, request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateReport(@PathVariable Long id, @Valid @RequestBody DailyReportRequest request) {
        User currentUser = getCurrentUser();
        try {
            DailyReportResponse response = dailyReportService.updateReport(currentUser, id, request);
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> listStudentReports(@PathVariable Long studentId) {
        User currentUser = getCurrentUser();
        try {
            DailyReportListResponse response = dailyReportService.listReportsForStudent(currentUser, studentId);
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/feedback")
    public ResponseEntity<?> replyFeedback(@PathVariable Long id, @Valid @RequestBody DailyReportFeedbackRequest request) {
        User currentUser = getCurrentUser();
        try {
            DailyReportResponse response = dailyReportService.replyFeedback(currentUser, id, request);
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        }
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
            Long id = userDetails.getUser().getId();
            return userService.findById(id);
        }
        throw new IllegalStateException("user not authenticated");
    }
}
