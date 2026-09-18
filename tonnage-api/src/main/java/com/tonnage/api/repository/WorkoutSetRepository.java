package com.tonnage.api.repository;

import com.tonnage.api.model.User;
import com.tonnage.api.model.WorkoutSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkoutSetRepository extends JpaRepository<WorkoutSet, Long> {

    List<WorkoutSet> findByExerciseIdAndWorkoutSessionUserOrderByWorkoutSessionStartedAtAsc(Long exerciseId, User user);

    @Query("SELECT COALESCE(SUM(ws.weightKg * ws.reps), 0) FROM WorkoutSet ws WHERE ws.workoutSession.user = :user")
    Double sumTotalTonnageForUser(@Param("user") User user);

    // Returns [muscleGroup, setCount] pairs, most-trained first - used to find the user's most-trained muscle group
    @Query("SELECT ex.muscleGroup, COUNT(ws) FROM WorkoutSet ws JOIN ws.exercise ex " +
           "WHERE ws.workoutSession.user = :user GROUP BY ex.muscleGroup ORDER BY COUNT(ws) DESC")
    List<Object[]> countSetsByMuscleGroupForUser(@Param("user") User user);
}