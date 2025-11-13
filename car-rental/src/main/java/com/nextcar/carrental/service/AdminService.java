package com.nextcar.carrental.service;

import com.nextcar.carrental.entity.Admin;
import com.nextcar.carrental.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    public Optional<Admin> getAdminById(Long id) {
        return adminRepository.getAdminById(id);
    }
}
