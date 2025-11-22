package com.minami.training_system.dto;

public class TrainingStatsResponse {

    private Integer unrepliedReportsCount;
    private Integer unrepliedQuestionsCount;
    private Integer studentsInTrainingCount;
    private Integer studentsCompletedCount;

    public Integer getUnrepliedReportsCount() {
        return unrepliedReportsCount;
    }

    public void setUnrepliedReportsCount(Integer unrepliedReportsCount) {
        this.unrepliedReportsCount = unrepliedReportsCount;
    }

    public Integer getUnrepliedQuestionsCount() {
        return unrepliedQuestionsCount;
    }

    public void setUnrepliedQuestionsCount(Integer unrepliedQuestionsCount) {
        this.unrepliedQuestionsCount = unrepliedQuestionsCount;
    }

    public Integer getStudentsInTrainingCount() {
        return studentsInTrainingCount;
    }

    public void setStudentsInTrainingCount(Integer studentsInTrainingCount) {
        this.studentsInTrainingCount = studentsInTrainingCount;
    }

    public Integer getStudentsCompletedCount() {
        return studentsCompletedCount;
    }

    public void setStudentsCompletedCount(Integer studentsCompletedCount) {
        this.studentsCompletedCount = studentsCompletedCount;
    }
}
