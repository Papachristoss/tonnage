package com.tonnage.api.config;

import com.tonnage.api.model.Exercise;
import com.tonnage.api.model.User;
import com.tonnage.api.model.WorkoutSession;
import com.tonnage.api.model.WorkoutSet;
import com.tonnage.api.repository.ExerciseRepository;
import com.tonnage.api.repository.UserRepository;
import com.tonnage.api.repository.WorkoutSessionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initDefaultExercises(ExerciseRepository exerciseRepository) {
        return args -> {
            if (exerciseRepository.count() == 0) {
                List<Exercise> defaultExercises = List.of(
                    Exercise.builder().name("Barbell Bench Press").muscleGroup("Chest").notes("Primary horizontal push").build(),
                    Exercise.builder().name("Incline Dumbbell Press").muscleGroup("Chest").notes("Upper chest focus").build(),
                    Exercise.builder().name("Barbell Back Squat").muscleGroup("Legs").notes("Primary quad and glute compound").build(),
                    Exercise.builder().name("Romanian Deadlift").muscleGroup("Legs").notes("Hamstring and posterior chain focus").build(),
                    Exercise.builder().name("Conventional Deadlift").muscleGroup("Back").notes("Full body posterior compound").build(),
                    Exercise.builder().name("Barbell Bent-Over Row").muscleGroup("Back").notes("Upper and mid-back horizontal pull").build(),
                    Exercise.builder().name("Pull-Up").muscleGroup("Back").notes("Vertical pull for lat development").build(),
                    Exercise.builder().name("Overhead Press").muscleGroup("Shoulders").notes("Vertical shoulder compound").build(),
                    Exercise.builder().name("Dumbbell Lateral Raise").muscleGroup("Shoulders").notes("Side delt hypertrophy").build(),
                    Exercise.builder().name("Barbell Bicep Curl").muscleGroup("Arms").notes("Bicep isolation").build(),
                    Exercise.builder().name("Tricep Rope Pushdown").muscleGroup("Arms").notes("Tricep lateral head focus").build()
                );

                exerciseRepository.saveAll(defaultExercises);
                System.out.println(">>> Seeded " + defaultExercises.size() + " default exercises into Neon PostgreSQL!");
            }
        };
    }

    @Bean
    public CommandLineRunner initDemoUser(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            ExerciseRepository exerciseRepository,
            WorkoutSessionRepository sessionRepository
    ) {
        return args -> {
            String demoEmail = "demo@tonnage.app";

            if (userRepository.existsByEmail(demoEmail)) {
                return; // already seeded, don't duplicate on every restart
            }

            User demoUser = new User(demoEmail, passwordEncoder.encode("demo1234"));
            userRepository.save(demoUser);

            Exercise bench = exerciseRepository.findByNameIgnoreCase("Barbell Bench Press").orElse(null);
            Exercise squat = exerciseRepository.findByNameIgnoreCase("Barbell Back Squat").orElse(null);

            if (bench != null) {
                WorkoutSession session1 = WorkoutSession.builder()
                        .title("Push Day A")
                        .startedAt(LocalDateTime.now().minusDays(14))
                        .completedAt(LocalDateTime.now().minusDays(14))
                        .user(demoUser)
                        .build();
                session1.addSet(WorkoutSet.builder().exercise(bench).setNumber(1).weightKg(60.0).reps(8).rpe(7.0).build());
                session1.addSet(WorkoutSet.builder().exercise(bench).setNumber(2).weightKg(62.5).reps(6).rpe(8.0).build());
                sessionRepository.save(session1);

                WorkoutSession session2 = WorkoutSession.builder()
                        .title("Push Day B")
                        .startedAt(LocalDateTime.now().minusDays(7))
                        .completedAt(LocalDateTime.now().minusDays(7))
                        .user(demoUser)
                        .build();
                session2.addSet(WorkoutSet.builder().exercise(bench).setNumber(1).weightKg(65.0).reps(6).rpe(8.5).build());
                sessionRepository.save(session2);
            }

            if (squat != null) {
                WorkoutSession session3 = WorkoutSession.builder()
                        .title("Leg Day")
                        .startedAt(LocalDateTime.now().minusDays(3))
                        .completedAt(LocalDateTime.now().minusDays(3))
                        .user(demoUser)
                        .build();
                session3.addSet(WorkoutSet.builder().exercise(squat).setNumber(1).weightKg(100.0).reps(5).rpe(9.0).build());
                sessionRepository.save(session3);
            }

            System.out.println(">>> Seeded demo user (" + demoEmail + ") with sample workout history!");
        };
    }
}