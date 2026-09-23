package com.tonnage.api.dto;

public class UpdateGoalsRequest {

    private Integer weeklyWorkoutGoal;   // nullable - user may clear it
    private Double weeklyVolumeGoalKg;   // nullable - user may clear it

    public UpdateGoalsRequest() {}

    public Integer getWeeklyWorkoutGoal() { return weeklyWorkoutGoal; }
    public void setWeeklyWorkoutGoal(Integer weeklyWorkoutGoal) { this.weeklyWorkoutGoal = weeklyWorkoutGoal; }

    public Double getWeeklyVolumeGoalKg() { return weeklyVolumeGoalKg; }
    public void setWeeklyVolumeGoalKg(Double weeklyVolumeGoalKg) { this.weeklyVolumeGoalKg = weeklyVolumeGoalKg; }
}
