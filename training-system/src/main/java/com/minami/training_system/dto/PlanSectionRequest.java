package com.minami.training_system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class PlanSectionRequest {

    @NotNull(message = "planId is required")
    private Long planId;

    @NotBlank(message = "section name is required")
    @Size(max = 200, message = "section name must be within 200 characters")
    private String sectionName;

    private Double expectedDays;

    private Integer sortOrder;

    public Long getPlanId() {
        return planId;
    }

    public void setPlanId(Long planId) {
        this.planId = planId;
    }

    public String getSectionName() {
        return sectionName;
    }

    public void setSectionName(String sectionName) {
        this.sectionName = sectionName;
    }

    public Double getExpectedDays() {
        return expectedDays;
    }

    public void setExpectedDays(Double expectedDays) {
        this.expectedDays = expectedDays;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}
