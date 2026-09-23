package com.tonnage.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreateWorkoutSessionRequest {

    // Optional - the app no longer asks for a name; blank titles get a default in WorkoutSessionService
    private String title;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    @NotEmpty(message = "Session must contain at least one set")
    @Valid
    private List<CreateWorkoutSetRequest> sets;
}