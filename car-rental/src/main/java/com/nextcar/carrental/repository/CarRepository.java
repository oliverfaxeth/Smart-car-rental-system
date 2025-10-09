package com.nextcar.carrental.repository;

import com.nextcar.carrental.entity.Car;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


// Varför är interfacet tomt?
//
//Spring Data JPA genererar implementationen automatiskt vid runtime
//Vi behöver inte skriva någon SQL!

@Repository
public interface CarRepository extends JpaRepository<Car, Integer> {
    // Spring Data JPA skapar automatiskt alla grundläggande metoder!
    // findAll(), findById(), save(), delete(), etc.
}