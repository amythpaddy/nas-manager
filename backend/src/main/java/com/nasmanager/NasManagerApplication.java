package com.nasmanager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class NasManagerApplication {
    public static void main(String[] args) {
        SpringApplication.run(NasManagerApplication.class, args);
    }
}
