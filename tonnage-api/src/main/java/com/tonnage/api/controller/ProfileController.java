package com.tonnage.api.controller;

import com.tonnage.api.dto.*;
import com.tonnage.api.model.User;
import com.tonnage.api.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(profileService.getProfile(currentUser));
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @RequestBody UpdateProfileRequest request
    ) {
        try {
            return ResponseEntity.ok(profileService.updateProfile(currentUser, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/avatar")
    public ResponseEntity<?> updateAvatar(
            @AuthenticationPrincipal User currentUser,
            @RequestBody UpdateAvatarRequest request
    ) {
        try {
            return ResponseEntity.ok(profileService.updateAvatar(currentUser, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/email")
    public ResponseEntity<?> changeEmail(
            @AuthenticationPrincipal User currentUser,
            @RequestBody ChangeEmailRequest request
    ) {
        try {
            return ResponseEntity.ok(profileService.changeEmail(currentUser, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal User currentUser,
            @RequestBody ChangePasswordRequest request
    ) {
        try {
            profileService.changePassword(currentUser, request);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}