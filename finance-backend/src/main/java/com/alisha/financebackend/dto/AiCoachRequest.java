package com.alisha.financebackend.dto;

import jakarta.validation.constraints.NotBlank;

public class AiCoachRequest {

    @NotBlank(message = "Question is required")
    private String question;

    public AiCoachRequest() {
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }
}