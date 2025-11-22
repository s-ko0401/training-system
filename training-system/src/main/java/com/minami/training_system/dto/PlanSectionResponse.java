package com.minami.training_system.dto;

import java.util.List;

public class PlanSectionResponse {

    private Long id;
    private Long planId;
    private String sectionName;
    private Double expectedDays;
    private Integer sortOrder;
    private List<PlanTopicResponse> topics;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public List<PlanTopicResponse> getTopics() {
        return topics;
    }

    public void setTopics(List<PlanTopicResponse> topics) {
        this.topics = topics;
    }
}
