package com.tonnage.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "exercises")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Exercise name is required")
    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String muscleGroup; // e.g., "Chest", "Legs", "Back", "Shoulders"

    @Column(length = 500)
    private String notes;
}