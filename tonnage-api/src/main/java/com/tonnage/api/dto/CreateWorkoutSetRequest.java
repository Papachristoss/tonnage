package com.tonnage.api.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateWorkoutSetRequest {

    @NotNull(message = "Exercise ID is required")
    private Long exerciseId;

    @NotNull(message = "Set number is required")
    @Min(value = 1, message = "Set number must be at least 1")
    private Integer setNumber;

    @NotNull(message = "Weight is required")
    @DecimalMin(value = "0.0", message = "Weight cannot be negative")
    private Double weightKg;

    @NotNull(message = "Reps are required")
    @Min(value = 1, message = "Reps must be at least 1")
    private Integer reps;

    @DecimalMin(value = "1.0", message = "RPE must be between 1.0 and 10.0")
    @DecimalMax(value = "10.0", message = "RPE must be between 1.0 and 10.0")
    private Double rpe;
}