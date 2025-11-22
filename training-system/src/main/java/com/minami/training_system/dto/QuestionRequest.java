package com.minami.training_system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class QuestionRequest {

    @NotNull(message = "date is required")
    private LocalDate date;

    @NotBlank(message = "title is required")
    @Size(max = 200, message = "title must be 200 characters or less")
    private String title;

    @NotBlank(message = "memo is required")
    @Size(max = 4000, message = "memo must be 4000 characters or less")
    private String memo;

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMemo() {
        return memo;
    }

    public void setMemo(String memo) {
        this.memo = memo;
    }
}
