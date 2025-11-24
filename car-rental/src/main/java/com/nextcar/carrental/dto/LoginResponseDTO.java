package com.nextcar.carrental.dto;

public class LoginResponseDTO {
    private Long id;
    private String firstName;
    private String token;
    private String role;

    public LoginResponseDTO() {}

    public LoginResponseDTO(Long id, String token, String firstName, String role) {
        this.id = id;
        this.token = token;
        this.firstName = firstName;
        this.role = role;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
