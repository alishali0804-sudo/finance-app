package com.alisha.financebackend.controller;

import com.alisha.financebackend.dto.AiCoachRequest;
import com.alisha.financebackend.dto.AiCoachResponse;
import com.alisha.financebackend.service.AiCoachService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:3000")
public class AiCoachController {

    private final AiCoachService aiCoachService;

    public AiCoachController(
            AiCoachService aiCoachService
    ) {
        this.aiCoachService = aiCoachService;
    }

    @PostMapping("/coach")
    public AiCoachResponse askCoach(
            @Valid @RequestBody AiCoachRequest request
    ) {

        String answer = aiCoachService.askCoach(
                request.getQuestion()
        );

        return new AiCoachResponse(answer);
    }
}