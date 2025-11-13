package com.nextcar.carrental.controller;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.nextcar.carrental.dto.AdminResponseDTO;
import com.nextcar.carrental.entity.Admin;
import com.nextcar.carrental.service.AdminService;
import com.nextcar.carrental.security.JwtTokenUtil;
import org.hibernate.mapping.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/admins")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @GetMapping("/me")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getMyProfile(@RequestHeader("Authorization") String authHeader) {
        try {
            // 1. Hämta JWT-token från Authorization-headern ("Bearer <token>")
            String token = authHeader.substring(7);

            // 2. Hämta role från token
            String role = jwtTokenUtil.getRoleFromToken(token);

            // 3. Hämta id för att validera i Service
            Long adminId = jwtTokenUtil.getUserIdFromToken(token);

            // 4. Hämta admin från service
            Admin admin = adminService.getAdminById(adminId)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));

            // 5. Bygg DTO
            AdminResponseDTO response = new AdminResponseDTO(token, role);

            // 6. Returnera DTO
            return ResponseEntity.ok(response);

        } catch (Exception error) {
            // Om ingen token skickas eller token är ogiltig så 401 Unauthorized
            return ResponseEntity.status(401).body("Token är ogiltig eller saknas");
        }
    }
}
