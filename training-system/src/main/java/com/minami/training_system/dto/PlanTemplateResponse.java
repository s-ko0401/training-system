package com.minami.training_system.dto;

import java.util.List;

public class PlanTemplateResponse {

    private Long id;
    private String planName;
    private Double expectedDays;
    private String description;
    private List<PlanSectionResponse> sections;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public List<PlanSectionResponse> getSections() {
        return sections;
    }

    public void setSections(List<PlanSectionResponse> sections) {
        this.sections = sections;
    }
}
