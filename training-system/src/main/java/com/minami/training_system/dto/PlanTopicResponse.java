package com.minami.training_system.dto;

import java.util.List;

public class PlanTopicResponse {

    private Long id;
    private Long sectionId;
    private String topicName;
    private Integer sortOrder;
    private List<PlanTodoResponse> todos;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSectionId() {
        return sectionId;
    }

    public void setSectionId(Long sectionId) {
        this.sectionId = sectionId;
    }

    public String getTopicName() {
        return topicName;
    }

    public void setTopicName(String topicName) {
        this.topicName = topicName;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public List<PlanTodoResponse> getTodos() {
        return todos;
    }

    public void setTodos(List<PlanTodoResponse> todos) {
        this.todos = todos;
    }
}
