package com.tonnage.api.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "workout_sets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkoutSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    @JsonBackReference
    private WorkoutSession workoutSession;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @NotNull
    @Min(value = 1, message = "Set number must be at least 1")
    private Integer setNumber;

    @NotNull
    @DecimalMin(value = "0.0", message = "Weight cannot be negative")
    private Double weightKg;

    @NotNull
    @Min(value = 1, message = "Reps must be at least 1")
    private Integer reps;

    // RPE: Rate of Perceived Exertion (1.0 to 10.0 scale)
    @DecimalMin(value = "1.0", message = "RPE must be between 1.0 and 10.0")
    @DecimalMax(value = "10.0", message = "RPE must be between 1.0 and 10.0")
    private Double rpe;
}