package com.nextcar.carrental.dto;

public class AdminResponseDTO {
    private String token;
    private String role;

    public AdminResponseDTO(String token, String role) {
        this.token = token;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public String getRole() {
        return role;
    }
}
