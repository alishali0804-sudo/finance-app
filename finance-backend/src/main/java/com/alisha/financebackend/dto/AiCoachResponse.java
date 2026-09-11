package com.alisha.financebackend.dto;

public class AiCoachResponse {

    private String answer;

    public AiCoachResponse() {
    }

    public AiCoachResponse(String answer) {
        this.answer = answer;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }
}