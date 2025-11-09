package com.nextcar.carrental.repository;

import com.nextcar.carrental.entity.Admin;
import com.nextcar.carrental.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Integer> {

    // Hitta Admin baserat på email
    Optional<Admin> findByEmail(String email);
}
