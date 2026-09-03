package com.tonnage.api.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WorkoutSetDto {
    private Long id;
    private Long exerciseId;
    private String exerciseName;
    private String muscleGroup;
    private Integer setNumber;
    private Double weightKg;
    private Integer reps;
    private Double rpe;
    private Double volumeKg;
    private Double estimatedOneRepMaxKg;
}