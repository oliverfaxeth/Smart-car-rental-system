package com.nextcar.carrental.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration; // Lägg till denna import
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration // <--- VIKTIGT: Markerar klassen som en konfigurationskälla
public class PasswordEncoderConfig { // <--- Bättre namn (t.ex. PasswordEncoderConfig)

    @Bean
    public BCryptPasswordEncoder passwordEncoder(){ // Gör metoden public
        return new BCryptPasswordEncoder(); // <--- Rätta felet: returnera en NY instans
    }
}