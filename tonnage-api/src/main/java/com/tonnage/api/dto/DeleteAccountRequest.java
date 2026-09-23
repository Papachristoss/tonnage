package com.tonnage.api.dto;

public class DeleteAccountRequest {

    private String currentPassword;

    public DeleteAccountRequest() {}

    public String getCurrentPassword() { return currentPassword; }
    public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
}
