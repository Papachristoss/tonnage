package com.tonnage.api.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class WorkoutSessionDto {
    private Long id;
    private String title;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Double totalTonnageKg;
    private Integer totalReps;
    private Integer totalSets;
    private List<WorkoutSetDto> sets;
}