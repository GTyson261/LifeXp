package com.lifexp.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class LifeXpDemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(LifeXpDemoApplication.class, args);
    }
}
