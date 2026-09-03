package com.tonnage.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreateWorkoutSessionRequest {

    @NotBlank(message = "Session title is required")
    private String title;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    @NotEmpty(message = "Session must contain at least one set")
    @Valid
    private List<CreateWorkoutSetRequest> sets;
}