package com.tonnage.api.controller;

import com.tonnage.api.dto.ExerciseProgressDto;
import com.tonnage.api.model.Exercise;
import com.tonnage.api.model.User;
import com.tonnage.api.repository.ExerciseRepository;
import com.tonnage.api.service.AnalyticsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exercises")
@RequiredArgsConstructor
public class ExerciseController {

    private final ExerciseRepository exerciseRepository;
    private final AnalyticsService analyticsService;

    @GetMapping
    public ResponseEntity<List<Exercise>> getAllExercises() {
        return ResponseEntity.ok(exerciseRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Exercise> createExercise(@Valid @RequestBody Exercise exercise) {
        if (exerciseRepository.existsByNameIgnoreCase(exercise.getName())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        Exercise saved = exerciseRepository.save(exercise);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}/progress")
    public ResponseEntity<ExerciseProgressDto> getExerciseProgress(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Exercise not found with ID: " + id));

        ExerciseProgressDto progress = analyticsService.getExerciseProgress(exercise.getId(), exercise.getName(), currentUser);
        return ResponseEntity.ok(progress);
    }
}