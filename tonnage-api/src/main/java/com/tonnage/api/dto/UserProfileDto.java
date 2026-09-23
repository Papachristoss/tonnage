package com.tonnage.api.dto;

public class UserProfileDto {
    private String email;
    private String username;
    private String profilePicture;
    private Integer age;
    private Double weightKg;
    private long memberDays;
    private double totalTonnageKg;
    private long totalWorkouts;
    private String mostTrainedMuscleGroup; // null if no workouts logged yet
    private Double bodyweightMultiple; // null if weightKg not set
    private Integer weeklyWorkoutGoal; // null = no goal set
    private Double weeklyVolumeGoalKg; // null = no goal set
    private boolean demo;

    public UserProfileDto() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public Double getWeightKg() { return weightKg; }
    public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }

    public long getMemberDays() { return memberDays; }
    public void setMemberDays(long memberDays) { this.memberDays = memberDays; }

    public double getTotalTonnageKg() { return totalTonnageKg; }
    public void setTotalTonnageKg(double totalTonnageKg) { this.totalTonnageKg = totalTonnageKg; }

    public long getTotalWorkouts() { return totalWorkouts; }
    public void setTotalWorkouts(long totalWorkouts) { this.totalWorkouts = totalWorkouts; }

    public String getMostTrainedMuscleGroup() { return mostTrainedMuscleGroup; }
    public void setMostTrainedMuscleGroup(String mostTrainedMuscleGroup) { this.mostTrainedMuscleGroup = mostTrainedMuscleGroup; }

    public Double getBodyweightMultiple() { return bodyweightMultiple; }
    public void setBodyweightMultiple(Double bodyweightMultiple) { this.bodyweightMultiple = bodyweightMultiple; }

    public Integer getWeeklyWorkoutGoal() { return weeklyWorkoutGoal; }
    public void setWeeklyWorkoutGoal(Integer weeklyWorkoutGoal) { this.weeklyWorkoutGoal = weeklyWorkoutGoal; }

    public Double getWeeklyVolumeGoalKg() { return weeklyVolumeGoalKg; }
    public void setWeeklyVolumeGoalKg(Double weeklyVolumeGoalKg) { this.weeklyVolumeGoalKg = weeklyVolumeGoalKg; }

    public boolean isDemo() { return demo; }
    public void setDemo(boolean demo) { this.demo = demo; }
}