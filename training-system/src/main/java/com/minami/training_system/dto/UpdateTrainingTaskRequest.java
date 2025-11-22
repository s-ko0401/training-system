package com.minami.training_system.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

public class UpdateTrainingTaskRequest {

    @NotBlank(message = "status is required")
    private String status;

    private String progressNote;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

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
