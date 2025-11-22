package com.minami.training_system.dto;

import java.util.List;

public class DailyReportListResponse {

    private List<DailyReportResponse> pendingFeedback;
    private List<DailyReportResponse> replied;

    public DailyReportListResponse(List<DailyReportResponse> pendingFeedback, List<DailyReportResponse> replied) {
        this.pendingFeedback = pendingFeedback;
        this.replied = replied;
    }

    public List<DailyReportResponse> getPendingFeedback() {
        return pendingFeedback;
    }

    public void setPendingFeedback(List<DailyReportResponse> pendingFeedback) {
        this.pendingFeedback = pendingFeedback;
    }

    public List<DailyReportResponse> getReplied() {
        return replied;
    }

    public void setReplied(List<DailyReportResponse> replied) {
        this.replied = replied;
    }
}
