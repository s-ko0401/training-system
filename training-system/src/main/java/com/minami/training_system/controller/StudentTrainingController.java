package com.minami.training_system.controller;

import com.minami.training_system.dto.AssignPlanRequest;
import com.minami.training_system.dto.StudentTrainingPlanResponse;
import com.minami.training_system.dto.StudentTrainingTaskResponse;
import com.minami.training_system.dto.TrainingStatsResponse;
import com.minami.training_system.dto.UpdateTrainingTaskRequest;
import com.minami.training_system.entity.User;
import com.minami.training_system.security.CustomUserDetails;
import com.minami.training_system.service.StudentTrainingService;
import com.minami.training_system.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/training")
@CrossOrigin(origins = "http://localhost:5173")
public class StudentTrainingController {

    private final StudentTrainingService studentTrainingService;
    private final UserService userService;

    public StudentTrainingController(StudentTrainingService studentTrainingService, UserService userService) {
        this.studentTrainingService = studentTrainingService;
        this.userService = userService;
    }

    @PostMapping("/assign")
    public ResponseEntity<StudentTrainingPlanResponse> assignPlan(@Valid @RequestBody AssignPlanRequest request) {
        User currentUser = getCurrentUser();
        StudentTrainingPlanResponse response = studentTrainingService.assignPlan(currentUser, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<StudentTrainingPlanResponse>> listStudentPlans(@PathVariable Long studentId) {
        User currentUser = getCurrentUser();
        List<StudentTrainingPlanResponse> responses = studentTrainingService.listForStudent(currentUser, studentId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/my")
    public ResponseEntity<List<StudentTrainingPlanResponse>> listMyPlans() {
        User currentUser = getCurrentUser();
        List<StudentTrainingPlanResponse> responses = studentTrainingService.listMine(currentUser);
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/tasks/{taskId}")
    public ResponseEntity<StudentTrainingTaskResponse> updateTask(@PathVariable Long taskId,
            @Valid @RequestBody UpdateTrainingTaskRequest request) {
        User currentUser = getCurrentUser();
        StudentTrainingTaskResponse response = studentTrainingService.updateTask(currentUser, taskId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/student/plan/{planId}")
    public ResponseEntity<Void> deletePlan(@PathVariable Long planId) {
        User currentUser = getCurrentUser();
        studentTrainingService.deletePlan(currentUser, planId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<TrainingStatsResponse> getTrainingStats() {
        User currentUser = getCurrentUser();
        TrainingStatsResponse stats = studentTrainingService.getTrainingStats(currentUser);
        return ResponseEntity.ok(stats);
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
