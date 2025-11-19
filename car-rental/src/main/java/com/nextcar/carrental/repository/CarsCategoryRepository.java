package com.nextcar.carrental.repository;

import com.nextcar.carrental.entity.CarsCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarsCategoryRepository extends JpaRepository<CarsCategory, Long> {
}
