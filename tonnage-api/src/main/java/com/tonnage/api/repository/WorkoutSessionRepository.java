package com.tonnage.api.repository;

import com.tonnage.api.model.User;
import com.tonnage.api.model.WorkoutSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {
    List<WorkoutSession> findAllByUserOrderByStartedAtDesc(User user);
    List<WorkoutSession> findAllByUser(User user);
}