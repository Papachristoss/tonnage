package com.tonnage.api.dto;

public class UpdateAvatarRequest {
    // Base64-encoded image data (data URL or raw base64), or null/blank to remove the avatar
    private String profilePicture;

    public UpdateAvatarRequest() {}

    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }
}