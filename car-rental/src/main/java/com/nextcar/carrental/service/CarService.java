package com.nextcar.carrental.service;

import com.nextcar.carrental.entity.Car;
import com.nextcar.carrental.repository.CarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CarService {

    @Autowired
    private CarRepository carRepository;

    // Hämta alla bilar
    public List<Car> getAllCars() {
        return carRepository.findAll();
    }

    // Hämta en bil via ID
    public Car getCarById(Integer id) {
        return carRepository.findById(id).orElse(null);
    }

    // Spara eller uppdatera en bil
    public Car saveCar(Car car) {
        return carRepository.save(car);
    }

    // Ta bort en bil
    public void deleteCar(Integer id) {
        carRepository.deleteById(id);
    }
}