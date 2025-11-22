package com.minami.training_system.dto;

import java.time.LocalDateTime;

public class StudentTrainingTaskResponse {

    private Long id;
    private Long todoId;
    private String todoName;
    private String topicName;
    private String sectionName;
    private Integer dayIndex;
    private Integer sortOrder;
    private String status;
    private String progressNote;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

    private Integer sectionSortOrder;
    private Integer topicSortOrder;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTodoId() {
        return todoId;
    }

    public void setTodoId(Long todoId) {
        this.todoId = todoId;
    }

    public String getTodoName() {
        return todoName;
    }

    public void setTodoName(String todoName) {
        this.todoName = todoName;
    }

    public String getTopicName() {
        return topicName;
    }

    public void setTopicName(String topicName) {
        this.topicName = topicName;
    }

    public String getSectionName() {
        return sectionName;
    }

    public void setSectionName(String sectionName) {
        this.sectionName = sectionName;
    }

    public Integer getDayIndex() {
        return dayIndex;
    }

    public void setDayIndex(Integer dayIndex) {
        this.dayIndex = dayIndex;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public Integer getSectionSortOrder() {
        return sectionSortOrder;
    }

    public void setSectionSortOrder(Integer sectionSortOrder) {
        this.sectionSortOrder = sectionSortOrder;
    }

    public Integer getTopicSortOrder() {
        return topicSortOrder;
    }

    public void setTopicSortOrder(Integer topicSortOrder) {
        this.topicSortOrder = topicSortOrder;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getProgressNote() {
        return progressNote;
    }

    public void setProgressNote(String progressNote) {
        this.progressNote = progressNote;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
