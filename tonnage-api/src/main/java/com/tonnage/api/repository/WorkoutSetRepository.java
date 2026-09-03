package com.tonnage.api.repository;

import com.tonnage.api.model.User;
import com.tonnage.api.model.WorkoutSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkoutSetRepository extends JpaRepository<WorkoutSet, Long> {

    List<WorkoutSet> findByExerciseIdAndWorkoutSessionUserOrderByWorkoutSessionStartedAtAsc(Long exerciseId, User user);

    // Fallback if user is null or not authenticated
    List<WorkoutSet> findByExerciseIdOrderByWorkoutSessionStartedAtAsc(Long exerciseId);
}