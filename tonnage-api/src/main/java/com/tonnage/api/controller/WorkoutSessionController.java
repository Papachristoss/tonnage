package com.tonnage.api.controller;

import com.tonnage.api.dto.CreateWorkoutSessionRequest;
import com.tonnage.api.dto.WorkoutSessionDto;
import com.tonnage.api.model.User;
import com.tonnage.api.service.WorkoutSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workouts")
@RequiredArgsConstructor
public class WorkoutSessionController {

    private final WorkoutSessionService workoutSessionService;

    @PostMapping
    public ResponseEntity<WorkoutSessionDto> createSession(
            @Valid @RequestBody CreateWorkoutSessionRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        WorkoutSessionDto response = workoutSessionService.createSession(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<WorkoutSessionDto>> getAllSessions(
            @AuthenticationPrincipal User currentUser
    ) {
        List<WorkoutSessionDto> sessions = workoutSessionService.getAllSessions(currentUser);
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutSessionDto> getSessionById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        WorkoutSessionDto session = workoutSessionService.getSessionById(id, currentUser);
        return ResponseEntity.ok(session);
    }
}