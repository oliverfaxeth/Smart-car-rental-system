package com.nextcar.carrental.dto;

public class LoginResponseDTO {

    private String token;
    private String role;

    public LoginResponseDTO() {
    }

    public LoginResponseDTO(String token, String role) {
        this.token = token;
        this.role = role;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
