package com.minami.training_system.dto;

import java.time.LocalDateTime;
import java.util.List;

public class StudentTrainingPlanResponse {

    private Long id;
    private Long studentId;
    private Long planId;
    private String planName;
    private Double expectedDays;
    private String description;
    private String status;
    private LocalDateTime assignedAt;
    private Long assignedBy;
    private List<StudentTrainingTaskResponse> tasks;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Long getPlanId() {
        return planId;
    }

    public void setPlanId(Long planId) {
        this.planId = planId;
    }

    public String getPlanName() {
        return planName;
    }

    public void setPlanName(String planName) {
        this.planName = planName;
    }

    public Double getExpectedDays() {
        return expectedDays;
    }

    public void setExpectedDays(Double expectedDays) {
        this.expectedDays = expectedDays;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    public Long getAssignedBy() {
        return assignedBy;
    }

    public void setAssignedBy(Long assignedBy) {
        this.assignedBy = assignedBy;
    }

    public List<StudentTrainingTaskResponse> getTasks() {
        return tasks;
    }

    public void setTasks(List<StudentTrainingTaskResponse> tasks) {
        this.tasks = tasks;
    }
}
