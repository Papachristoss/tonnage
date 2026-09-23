package com.tonnage.api.service;

import com.tonnage.api.dto.*;
import com.tonnage.api.model.User;
import com.tonnage.api.repository.UserRepository;
import com.tonnage.api.repository.WorkoutSessionRepository;
import com.tonnage.api.repository.WorkoutSetRepository;
import com.tonnage.api.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ProfileService {

    // ~700KB decoded ceiling on avatar uploads, keeps the free-tier DB from bloating on big photos
    private static final int MAX_AVATAR_BYTES = 700_000;

    private static final String DEMO_EMAIL = "demo@tonnage.app";

    private final UserRepository userRepository;
    private final WorkoutSessionRepository workoutSessionRepository;
    private final WorkoutSetRepository workoutSetRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public ProfileService(
            UserRepository userRepository,
            WorkoutSessionRepository workoutSessionRepository,
            WorkoutSetRepository workoutSetRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.workoutSessionRepository = workoutSessionRepository;
        this.workoutSetRepository = workoutSetRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    private void rejectIfDemoAccount(User user) {
        if (user.getEmail().equalsIgnoreCase(DEMO_EMAIL)) {
            throw new IllegalArgumentException("This is a shared demo account - profile changes are disabled.");
        }
    }

    public UserProfileDto getProfile(User user) {
        UserProfileDto dto = new UserProfileDto();
        dto.setEmail(user.getEmail());
        dto.setUsername(user.getUsername());
        dto.setProfilePicture(user.getProfilePicture());
        dto.setAge(user.getAge());
        dto.setWeightKg(user.getWeightKg());
        dto.setWeeklyWorkoutGoal(user.getWeeklyWorkoutGoal());
        dto.setWeeklyVolumeGoalKg(user.getWeeklyVolumeGoalKg());
        dto.setDemo(user.getEmail().equalsIgnoreCase(DEMO_EMAIL));

        long memberDays = ChronoUnit.DAYS.between(user.getCreatedAt().toLocalDate(), LocalDate.now());
        dto.setMemberDays(Math.max(memberDays, 0));

        double totalTonnage = workoutSetRepository.sumTotalTonnageForUser(user);
        dto.setTotalTonnageKg(totalTonnage);

        dto.setTotalWorkouts(workoutSessionRepository.countByUser(user));

        List<Object[]> muscleGroupCounts = workoutSetRepository.countSetsByMuscleGroupForUser(user);
        if (!muscleGroupCounts.isEmpty()) {
            dto.setMostTrainedMuscleGroup((String) muscleGroupCounts.get(0)[0]);
        }

        if (user.getWeightKg() != null && user.getWeightKg() > 0) {
            dto.setBodyweightMultiple(totalTonnage / user.getWeightKg());
        }

        return dto;
    }

    public UserProfileDto updateProfile(User user, UpdateProfileRequest request) {
        rejectIfDemoAccount(user);

        String newUsername = request.getUsername();
        if (newUsername != null) {
            newUsername = newUsername.trim();
            if (newUsername.isEmpty()) {
                newUsername = null; // treat blank as "clear the username"
            }
        }

        if (newUsername != null && !newUsername.equalsIgnoreCase(user.getUsername())) {
            if (userRepository.existsByUsername(newUsername)) {
                throw new IllegalArgumentException("That username is already taken.");
            }
        }

        user.setUsername(newUsername);
        user.setAge(request.getAge());
        user.setWeightKg(request.getWeightKg());
        userRepository.save(user);

        return getProfile(user);
    }

    public UserProfileDto updateAvatar(User user, UpdateAvatarRequest request) {
        rejectIfDemoAccount(user);

        String picture = request.getProfilePicture();

        if (picture == null || picture.isBlank()) {
            user.setProfilePicture(null);
        } else {
            // Rough size guard on the base64 payload itself (base64 is ~4/3 the size of the raw bytes)
            int approxDecodedBytes = (int) (picture.length() * 0.75);
            if (approxDecodedBytes > MAX_AVATAR_BYTES) {
                throw new IllegalArgumentException("Image is too large. Please choose a smaller picture.");
            }
            user.setProfilePicture(picture);
        }

        userRepository.save(user);
        return getProfile(user);
    }

    public AuthResponse changeEmail(User user, ChangeEmailRequest request) {
        rejectIfDemoAccount(user);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }

        String newEmail = request.getNewEmail() == null ? "" : request.getNewEmail().trim();
        if (newEmail.isEmpty()) {
            throw new IllegalArgumentException("Email cannot be empty.");
        }

        if (!newEmail.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
            throw new IllegalArgumentException("That email is already registered.");
        }

        user.setEmail(newEmail);
        userRepository.save(user);

        // The JWT subject is the email, so issue a fresh token immediately -
        // otherwise the user's existing token would stop matching their account.
        String newToken = jwtService.generateToken(user.getEmail());
        return new AuthResponse(newToken, user.getEmail());
    }

    public void changePassword(User user, ChangePasswordRequest request) {
        rejectIfDemoAccount(user);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }

        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public UserProfileDto updateGoals(User user, UpdateGoalsRequest request) {
        rejectIfDemoAccount(user);

        Integer workoutGoal = request.getWeeklyWorkoutGoal();
        if (workoutGoal != null && (workoutGoal < 1 || workoutGoal > 14)) {
            throw new IllegalArgumentException("Workouts per week must be between 1 and 14.");
        }

        Double volumeGoal = request.getWeeklyVolumeGoalKg();
        if (volumeGoal != null && (volumeGoal <= 0 || volumeGoal > 1_000_000)) {
            throw new IllegalArgumentException("Weekly volume goal must be a positive number.");
        }

        user.setWeeklyWorkoutGoal(workoutGoal);
        user.setWeeklyVolumeGoalKg(volumeGoal);
        userRepository.save(user);
        return getProfile(user);
    }

    // Permanently removes the user and all their workout sessions (sets are removed with
    // their session via cascade). Exercises are shared between users, so they stay.
    @Transactional
    public void deleteAccount(User user, DeleteAccountRequest request) {
        rejectIfDemoAccount(user);

        if (request.getCurrentPassword() == null || !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }

        workoutSessionRepository.deleteAll(workoutSessionRepository.findAllByUser(user));
        userRepository.delete(user);
    }
}