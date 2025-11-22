package com.minami.training_system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PlanRequest {

    @NotBlank(message = "plan name is required")
    @Size(max = 200, message = "plan name must be within 200 characters")
    private String planName;

    private Double expectedDays;

    @Size(max = 2000, message = "description must be within 2000 characters")
    private String description;

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
}
