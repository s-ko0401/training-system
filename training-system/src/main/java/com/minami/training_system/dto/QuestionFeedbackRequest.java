package com.minami.training_system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class QuestionFeedbackRequest {

    @NotBlank(message = "feedback is required")
    @Size(max = 4000, message = "feedback must be 4000 characters or less")
    private String feedback;

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
}
