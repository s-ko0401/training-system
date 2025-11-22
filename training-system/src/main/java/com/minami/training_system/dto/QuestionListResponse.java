package com.minami.training_system.dto;

import java.util.List;

public class QuestionListResponse {

    private List<QuestionResponse> pendingFeedback;
    private List<QuestionResponse> replied;

    public QuestionListResponse(List<QuestionResponse> pendingFeedback, List<QuestionResponse> replied) {
        this.pendingFeedback = pendingFeedback;
        this.replied = replied;
    }

    public List<QuestionResponse> getPendingFeedback() {
        return pendingFeedback;
    }

    public void setPendingFeedback(List<QuestionResponse> pendingFeedback) {
        this.pendingFeedback = pendingFeedback;
    }

    public List<QuestionResponse> getReplied() {
        return replied;
    }

    public void setReplied(List<QuestionResponse> replied) {
        this.replied = replied;
    }
}
