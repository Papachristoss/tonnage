package com.tonnage.api.service;

import com.tonnage.api.dto.CreateWorkoutSessionRequest;
import com.tonnage.api.dto.CreateWorkoutSetRequest;
import com.tonnage.api.dto.WorkoutSessionDto;
import com.tonnage.api.model.Exercise;
import com.tonnage.api.model.User;
import com.tonnage.api.model.WorkoutSession;
import com.tonnage.api.model.WorkoutSet;
import com.tonnage.api.repository.ExerciseRepository;
import com.tonnage.api.repository.WorkoutSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkoutSessionService {

    private final WorkoutSessionRepository sessionRepository;
    private final ExerciseRepository exerciseRepository;
    private final AnalyticsService analyticsService;

    @Transactional
    public WorkoutSessionDto createSession(CreateWorkoutSessionRequest request, User user) {
        WorkoutSession session = WorkoutSession.builder()
                .title(request.getTitle())
                .startedAt(request.getStartedAt() != null ? request.getStartedAt() : LocalDateTime.now())
                .completedAt(request.getCompletedAt() != null ? request.getCompletedAt() : LocalDateTime.now())
                .user(user)
                .build();

        if (request.getSets() != null) {
            for (CreateWorkoutSetRequest setReq : request.getSets()) {
                Exercise exercise = exerciseRepository.findById(setReq.getExerciseId())
                        .orElseThrow(() -> new IllegalArgumentException("Exercise not found with ID: " + setReq.getExerciseId()));

                WorkoutSet set = WorkoutSet.builder()
                        .exercise(exercise)
                        .setNumber(setReq.getSetNumber())
                        .weightKg(setReq.getWeightKg())
                        .reps(setReq.getReps())
                        .rpe(setReq.getRpe())
                        .build();

                session.addSet(set);
            }
        }

        WorkoutSession saved = sessionRepository.save(session);
        return analyticsService.mapToSessionDto(saved);
    }

    @Transactional(readOnly = true)
    public List<WorkoutSessionDto> getAllSessions(User user) {
        return sessionRepository.findAllByUserOrderByStartedAtDesc(user)
                .stream()
                .map(analyticsService::mapToSessionDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public WorkoutSessionDto getSessionById(Long id, User user) {
        WorkoutSession session = sessionRepository.findById(id)
                .filter(s -> s.getUser() != null && s.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Session not found with ID: " + id));
        return analyticsService.mapToSessionDto(session);
    }
}