package com.nextcar.carrental.controller;

import com.nextcar.carrental.entity.CarsCategory;
import com.nextcar.carrental.service.CarsCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
public class CarsCategoryController {

    @Autowired
    private CarsCategoryService carsCategoryService;

    @GetMapping
    public List<CarsCategory> getAllCategories() {
        return carsCategoryService.getAllCategories();
    }
}
