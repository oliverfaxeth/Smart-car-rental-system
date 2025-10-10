package com.nextcar.carrental.service;

import com.nextcar.carrental.entity.CarsCategory;
import com.nextcar.carrental.repository.CarsCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CarsCategoryService {

    @Autowired
    private CarsCategoryRepository carsCategoryRepository;

    public List<CarsCategory> getAllCategories() {
        return carsCategoryRepository.findAll();
    }
}
