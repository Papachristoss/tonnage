package com.tonnage.api.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ExerciseProgressDto {
    private Long exerciseId;
    private String exerciseName;
    private Double currentEstimatedOneRepMax;
    private Double allTimeRecordWeight;
    private Double totalVolumeHistoricalKg;
    private String progressionAdvice;
    private List<SetHistoryPoint> history;

    @Data
    @Builder
    public static class SetHistoryPoint {
        private String sessionDate;
        private Double weightKg;
        private Integer reps;
        private Double rpe;
        private Double estimatedOneRepMaxKg;
    }
}