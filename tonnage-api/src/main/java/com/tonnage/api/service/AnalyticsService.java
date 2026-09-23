package com.tonnage.api.service;

import com.tonnage.api.dto.ExerciseProgressDto;
import com.tonnage.api.dto.WorkoutSessionDto;
import com.tonnage.api.dto.WorkoutSetDto;
import com.tonnage.api.model.User;
import com.tonnage.api.model.WorkoutSession;
import com.tonnage.api.model.WorkoutSet;
import com.tonnage.api.repository.WorkoutSetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final WorkoutSetRepository workoutSetRepository;

    public double calculateVolume(double weightKg, int reps) {
        return round(weightKg * reps);
    }

    public double estimateOneRepMax(double weightKg, int reps) {
        if (reps <= 0 || weightKg <= 0) return 0.0;
        if (reps == 1) return round(weightKg);
        if (reps > 12) {
            return round(weightKg * (1.0 + (reps / 30.0)));
        }
        double formulaDenominator = 1.0278 - (0.0278 * reps);
        return round(weightKg / formulaDenominator);
    }

    public WorkoutSessionDto mapToSessionDto(WorkoutSession session) {
        List<WorkoutSetDto> setDtos = new ArrayList<>();
        double totalVolume = 0.0;
        int totalReps = 0;

        if (session.getSets() != null) {
            for (WorkoutSet s : session.getSets()) {
                double vol = calculateVolume(s.getWeightKg(), s.getReps());
                double oneRm = estimateOneRepMax(s.getWeightKg(), s.getReps());
                totalVolume += vol;
                totalReps += s.getReps();

                setDtos.add(WorkoutSetDto.builder()
                        .id(s.getId())
                        .exerciseId(s.getExercise().getId())
                        .exerciseName(s.getExercise().getName())
                        .muscleGroup(s.getExercise().getMuscleGroup())
                        .setNumber(s.getSetNumber())
                        .weightKg(s.getWeightKg())
                        .reps(s.getReps())
                        .rpe(s.getRpe())
                        .volumeKg(vol)
                        .estimatedOneRepMaxKg(oneRm)
                        .build());
            }
        }

        return WorkoutSessionDto.builder()
                .id(session.getId())
                .title(session.getTitle())
                .startedAt(session.getStartedAt())
                .completedAt(session.getCompletedAt())
                .totalTonnageKg(round(totalVolume))
                .totalReps(totalReps)
                .totalSets(setDtos.size())
                .sets(setDtos)
                .build();
    }

    // unit ("kg" or "lb") only affects the wording of progressionAdvice - all numeric fields stay in kg
    public ExerciseProgressDto getExerciseProgress(Long exerciseId, String exerciseName, User user, String unit) {
        List<WorkoutSet> sets = workoutSetRepository.findByExerciseIdAndWorkoutSessionUserOrderByWorkoutSessionStartedAtAsc(exerciseId, user);

        if (sets.isEmpty()) {
            return ExerciseProgressDto.builder()
                    .exerciseId(exerciseId)
                    .exerciseName(exerciseName)
                    .currentEstimatedOneRepMax(0.0)
                    .allTimeRecordWeight(0.0)
                    .totalVolumeHistoricalKg(0.0)
                    .progressionAdvice("No logged sets yet. Log a session to unlock progressive overload targets.")
                    .history(List.of())
                    .build();
        }

        double maxWeight = sets.stream().mapToDouble(WorkoutSet::getWeightKg).max().orElse(0.0);
        double totalVolume = sets.stream().mapToDouble(s -> calculateVolume(s.getWeightKg(), s.getReps())).sum();
        double highest1Rm = sets.stream()
                .mapToDouble(s -> estimateOneRepMax(s.getWeightKg(), s.getReps()))
                .max()
                .orElse(0.0);

        List<ExerciseProgressDto.SetHistoryPoint> history = sets.stream()
                .map(s -> ExerciseProgressDto.SetHistoryPoint.builder()
                        .sessionDate(s.getWorkoutSession().getStartedAt().toLocalDate().toString())
                        .weightKg(s.getWeightKg())
                        .reps(s.getReps())
                        .rpe(s.getRpe())
                        .estimatedOneRepMaxKg(estimateOneRepMax(s.getWeightKg(), s.getReps()))
                        .build())
                .toList();

        WorkoutSet lastSet = sets.get(sets.size() - 1);
        String advice = generateOverloadAdvice(lastSet, "lb".equalsIgnoreCase(unit));

        return ExerciseProgressDto.builder()
                .exerciseId(exerciseId)
                .exerciseName(exerciseName)
                .currentEstimatedOneRepMax(highest1Rm)
                .allTimeRecordWeight(maxWeight)
                .totalVolumeHistoricalKg(round(totalVolume))
                .progressionAdvice(advice)
                .history(history)
                .build();
    }

    private static final double KG_PER_LB = 0.45359237;

    private String generateOverloadAdvice(WorkoutSet lastSet, boolean inPounds) {
        // Advice is worded in the user's display unit; the standard jump is 2.5 kg or 5 lb
        String unit = inPounds ? "lb" : "kg";
        double lastWeight = inPounds ? lastSet.getWeightKg() / KG_PER_LB : lastSet.getWeightKg();
        double increment = inPounds ? 5.0 : 2.5;

        if (lastSet.getRpe() != null && lastSet.getRpe() <= 7.0 && lastSet.getReps() >= 8) {
            double targetWeight = lastWeight + increment;
            return "High readiness detected (RPE " + formatNumber(lastSet.getRpe()) + "). Increase load by "
                    + formatNumber(increment) + " " + unit + " to " + formatNumber(targetWeight) + " " + unit + " next session.";
        } else if (lastSet.getRpe() != null && lastSet.getRpe() >= 9.5) {
            return "Near failure reached (RPE " + formatNumber(lastSet.getRpe()) + "). Maintain " + formatNumber(lastWeight) + " " + unit
                    + " and focus on rep completion before adding load.";
        }
        return "Steady progress. Target +1 rep at " + formatNumber(lastWeight) + " " + unit + " before incrementing weight.";
    }

    // 62.5 -> "62.5", 65.0 -> "65", 143.3009 -> "143.3"
    private String formatNumber(double value) {
        return BigDecimal.valueOf(value).setScale(1, RoundingMode.HALF_UP).stripTrailingZeros().toPlainString();
    }

    private double round(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}