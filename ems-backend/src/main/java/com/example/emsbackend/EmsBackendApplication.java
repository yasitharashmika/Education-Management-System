package com.example.emsbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling; // NEW IMPORT

@SpringBootApplication
@EnableScheduling // NEW: Tells Spring Boot to run background tasks!
public class EmsBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(EmsBackendApplication.class, args);
    }

}