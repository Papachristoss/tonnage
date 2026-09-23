package com.tonnage.api.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(unique = true)
    private String username;

    @Column(columnDefinition = "TEXT")
    private String profilePicture; // base64-encoded image data, or null if not set

    private Integer age;

    private Double weightKg;

    // Weekly goals shown on the home page; null = no goal set
    private Integer weeklyWorkoutGoal;

    private Double weeklyVolumeGoalKg;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {}

    public User(String email, String password) {
        this.email = email;
        this.password = password;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public Double getWeightKg() {
        return weightKg;
    }

    public void setWeightKg(Double weightKg) {
        this.weightKg = weightKg;
    }

    public Integer getWeeklyWorkoutGoal() {
        return weeklyWorkoutGoal;
    }

    public void setWeeklyWorkoutGoal(Integer weeklyWorkoutGoal) {
        this.weeklyWorkoutGoal = weeklyWorkoutGoal;
    }

    public Double getWeeklyVolumeGoalKg() {
        return weeklyVolumeGoalKg;
    }

    public void setWeeklyVolumeGoalKg(Double weeklyVolumeGoalKg) {
        this.weeklyVolumeGoalKg = weeklyVolumeGoalKg;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}