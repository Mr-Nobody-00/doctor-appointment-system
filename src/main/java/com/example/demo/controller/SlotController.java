package com.example.demo.controller;

import com.example.demo.model.Doctor;
import com.example.demo.model.Slot;
import com.example.demo.repository.DoctorRepository;
import com.example.demo.repository.SlotRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/slots")
public class SlotController {

    private final SlotRepository slotRepository;
    private final DoctorRepository doctorRepository;

    public SlotController(SlotRepository slotRepository, DoctorRepository doctorRepository) {
        this.slotRepository = slotRepository;
        this.doctorRepository = doctorRepository;
    }

    @GetMapping
    public List<Slot> getAvailableSlots(@RequestParam Long doctorId, @RequestParam String date) {
        return slotRepository.findByDoctorIdAndDateAndIsBooked(doctorId, date, false);
    }

    @PostMapping
    public Slot create(@RequestBody Map<String, String> body) {
        Slot slot = new Slot();
        slot.setDate(body.get("date"));
        slot.setStartTime(body.get("startTime"));
        slot.setEndTime(body.get("endTime"));
        slot.setIsBooked(false);

        Doctor doctor = doctorRepository.findById(Long.parseLong(body.get("doctorId"))).orElseThrow();
        slot.setDoctor(doctor);

        return slotRepository.save(slot);
    }
}