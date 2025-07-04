package com.joinmatch.backend.controller;

import com.joinmatch.backend.repositories.EventRepository;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class EventController {
    private final EventRepository eventRepository;

    public EventController(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }
    @GetMapping("/event/all")
    public List<Integer> getNamesOfEvent(){
        return eventRepository.findAllEvents();
    }
}
