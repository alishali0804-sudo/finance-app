package com.alisha.financebackend.service;

import com.alisha.financebackend.model.AppUser;
import com.alisha.financebackend.model.SavingsGoal;
import com.alisha.financebackend.repository.SavingsGoalRepository;
import com.openai.client.OpenAIClient;
import com.openai.models.ChatModel;
import com.openai.models.chat.completions.ChatCompletion;
import com.openai.models.chat.completions.ChatCompletionCreateParams;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
public class AiCoachService {

    private final OpenAIClient openAIClient;
    private final AnalyticsService analyticsService;
    private final SavingsGoalRepository savingsGoalRepository;
    private final CurrentUserService currentUserService;

    public AiCoachService(
            OpenAIClient openAIClient,
            AnalyticsService analyticsService,
            SavingsGoalRepository savingsGoalRepository,
            CurrentUserService currentUserService
    ) {
        this.openAIClient = openAIClient;
        this.analyticsService = analyticsService;
        this.savingsGoalRepository = savingsGoalRepository;
        this.currentUserService = currentUserService;
    }

    public String askCoach(String question) {

        AppUser currentUser =
                currentUserService.getCurrentUser();

        Map<String, BigDecimal> summary =
                analyticsService.getSummary();

        Map<String, BigDecimal> categories =
                analyticsService.getSpendingByCategory();

        Map<String, BigDecimal> monthly =
                analyticsService.getMonthlySpending();

        Map<String, Object> comparison =
                analyticsService.getMonthlyComparison();

        List<Map<String, Object>> unusualSpending =
                analyticsService.getUnusualSpending();

        List<SavingsGoal> goals =
                savingsGoalRepository
                        .findByUserOrderByTargetDateAsc(
                                currentUser
                        );

        String financialContext = """
                You are an AI personal finance coach.

                Use only the financial data provided below when discussing
                the user's finances.

                Do not invent transactions, totals, categories, trends,
                unusual spending or savings goals.

                Your role is to explain and interpret the verified financial
                information calculated by the application.

                Give clear, concise and practical responses.

                RESPONSE FORMAT RULES:
                - Use plain text only.
                - Do not use Markdown.
                - Do not use asterisks for bold text.
                - Do not use double asterisks.
                - Do not use underscores for formatting.
                - Do not use em dashes.
                - Do not use en dashes.
                - Use normal hyphens instead.
                - Keep formatting simple and easy to read.
                - If listing items, use simple hyphen bullet points.
                - Do not use headings with Markdown symbols.

                You may:
                - explain spending patterns
                - identify important categories
                - explain changes between months
                - discuss unusual spending
                - explain savings goal progress
                - provide general budgeting suggestions

                Do not:
                - invent financial data
                - recommend specific investments or securities
                - claim to provide professional financial advice

                FINANCIAL SUMMARY:
                %s

                SPENDING BY CATEGORY:
                %s

                MONTHLY SPENDING:
                %s

                MONTHLY COMPARISON:
                %s

                UNUSUAL SPENDING:
                %s

                SAVINGS GOALS:
                %s

                USER QUESTION:
                %s
                """.formatted(
                summary,
                categories,
                monthly,
                comparison,
                unusualSpending,
                goals,
                question
        );

        ChatCompletionCreateParams params =
                ChatCompletionCreateParams.builder()
                        .addUserMessage(financialContext)
                        .model(ChatModel.GPT_5_2)
                        .build();

        ChatCompletion completion =
                openAIClient
                        .chat()
                        .completions()
                        .create(params);

        String answer =
                completion
                        .choices()
                        .stream()
                        .flatMap(choice ->
                                choice.message()
                                        .content()
                                        .stream()
                        )
                        .findFirst()
                        .orElse(
                                "I could not generate a response."
                        );

        return cleanResponse(answer);
    }

    private String cleanResponse(String response) {

        return response
                .replace("**", "")
                .replace("__", "")
                .replace("—", "-")
                .replace("–", "-");
    }
}