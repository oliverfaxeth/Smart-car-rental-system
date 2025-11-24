package com.nextcar.carrental.controller;

import com.nextcar.carrental.dto.LoginRequestDTO;
import com.nextcar.carrental.dto.LoginResponseDTO;
import com.nextcar.carrental.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO loginRequest) {
        LoginResponseDTO response = authService.authenticate(loginRequest);
        return ResponseEntity.ok(response);
    }
}
