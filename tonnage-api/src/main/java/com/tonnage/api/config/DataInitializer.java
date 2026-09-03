package com.tonnage.api.config;

import com.tonnage.api.model.Exercise;
import com.tonnage.api.repository.ExerciseRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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
}