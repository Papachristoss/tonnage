package com.tonnage.api.dto;

public class UpdateProfileRequest {
    private String username; // nullable - user may clear it
    private Integer age;
    private Double weightKg;

    public UpdateProfileRequest() {}

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public Double getWeightKg() { return weightKg; }
    public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }
}