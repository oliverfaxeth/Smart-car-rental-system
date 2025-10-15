package com.nextcar.carrental.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfiguration;
import java.util.Arrays;
import org.springframework.security.config.Customizer;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // .cors ser till att frontend kan göra förfrågningar
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())  // Inaktivera CSRF för API
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()  // Tillåt alla requests utan inloggning
                );

        return http.build();
    }

    // Konfigurerar CORS för att tillåta frontend-anslutningar.
    // Säkerställer säker kommunikation mellan frontend och backend.
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
                "http://localhost:5500",   // Live Server
                "http://127.0.0.1:5500"   // Lägg till båda varianterna

        )); // Anpassa efter frontend-port
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}