package com.minami.training_system.controller;

import com.minami.training_system.dto.PlanRequest;
import com.minami.training_system.dto.PlanSectionRequest;
import com.minami.training_system.dto.PlanTemplateResponse;
import com.minami.training_system.dto.PlanTodoRequest;
import com.minami.training_system.dto.PlanTodoResponse;
import com.minami.training_system.dto.PlanTopicRequest;
import com.minami.training_system.service.PlanTemplateService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
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
@RequestMapping("/api/training/templates")
@CrossOrigin(origins = "http://localhost:5173")
public class PlanTemplateController {

    private final PlanTemplateService planTemplateService;

    public PlanTemplateController(PlanTemplateService planTemplateService) {
        this.planTemplateService = planTemplateService;
    }

    @GetMapping
    public ResponseEntity<List<PlanTemplateResponse>> listTemplates() {
        return ResponseEntity.ok(planTemplateService.listTemplates());
    }

    @PostMapping
    public ResponseEntity<PlanTemplateResponse> createPlan(@Valid @RequestBody PlanRequest request) {
        return ResponseEntity.ok(planTemplateService.createPlan(request));
    }

    @PutMapping("/{planId}")
    public ResponseEntity<PlanTemplateResponse> updatePlan(@PathVariable Long planId,
                                                           @Valid @RequestBody PlanRequest request) {
        return ResponseEntity.ok(planTemplateService.updatePlan(planId, request));
    }

    @DeleteMapping("/{planId}")
    public ResponseEntity<?> deletePlan(@PathVariable Long planId) {
        planTemplateService.deletePlan(planId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/sections")
    public ResponseEntity<?> addSection(@Valid @RequestBody PlanSectionRequest request) {
        return ResponseEntity.ok(planTemplateService.addSection(request));
    }

    @PutMapping("/sections/{sectionId}")
    public ResponseEntity<?> updateSection(@PathVariable Long sectionId,
                                           @Valid @RequestBody PlanSectionRequest request) {
        return ResponseEntity.ok(planTemplateService.updateSection(sectionId, request));
    }

    @DeleteMapping("/sections/{sectionId}")
    public ResponseEntity<?> deleteSection(@PathVariable Long sectionId) {
        planTemplateService.deleteSection(sectionId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/topics")
    public ResponseEntity<?> addTopic(@Valid @RequestBody PlanTopicRequest request) {
        return ResponseEntity.ok(planTemplateService.addTopic(request));
    }

    @PutMapping("/topics/{topicId}")
    public ResponseEntity<?> updateTopic(@PathVariable Long topicId,
                                         @Valid @RequestBody PlanTopicRequest request) {
        return ResponseEntity.ok(planTemplateService.updateTopic(topicId, request));
    }

    @DeleteMapping("/topics/{topicId}")
    public ResponseEntity<?> deleteTopic(@PathVariable Long topicId) {
        planTemplateService.deleteTopic(topicId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/todos")
    public ResponseEntity<PlanTodoResponse> addTodo(@Valid @RequestBody PlanTodoRequest request) {
        return ResponseEntity.ok(planTemplateService.addTodo(request));
    }

    @PutMapping("/todos/{todoId}")
    public ResponseEntity<PlanTodoResponse> updateTodo(@PathVariable Long todoId,
                                                       @Valid @RequestBody PlanTodoRequest request) {
        return ResponseEntity.ok(planTemplateService.updateTodo(todoId, request));
    }

    @DeleteMapping("/todos/{todoId}")
    public ResponseEntity<?> deleteTodo(@PathVariable Long todoId) {
        planTemplateService.deleteTodo(todoId);
        return ResponseEntity.noContent().build();
    }
}
