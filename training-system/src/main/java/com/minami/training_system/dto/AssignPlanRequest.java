package com.minami.training_system.dto;

import jakarta.validation.constraints.NotNull;

public class AssignPlanRequest {

    @NotNull(message = "studentId is required")
    private Long studentId;

    @NotNull(message = "planId is required")
    private Long planId;

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
}
