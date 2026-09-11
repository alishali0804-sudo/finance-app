package com.alisha.financebackend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class Testcontroller {

    @GetMapping("/hello")
    public String hello() {
        return "Backend is working!";
    }

}