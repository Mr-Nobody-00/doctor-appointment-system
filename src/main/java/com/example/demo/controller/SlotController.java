package com.example.demo.controller;

import com.example.demo.model.Doctor;
import com.example.demo.model.Slot;
import com.example.demo.repository.DoctorRepository;
import com.example.demo.repository.SlotRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
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

    @PostMapping("/upload")
    public Map<String, Object> uploadSlots(@RequestParam("file") MultipartFile file) {
        List<Slot> created = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        int line = 0;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String row;
            while ((row = reader.readLine()) != null) {
                line++;
                if (line == 1) continue; // skip header row

                try {
                    String[] parts = row.split(",");
                    Long doctorId = Long.parseLong(parts[0].trim());
                    String date = parts[1].trim();
                    String startTime = parts[2].trim();
                    String endTime = parts[3].trim();

                    if (slotRepository.existsByDoctorIdAndDateAndStartTime(doctorId, date, startTime)) {
                        errors.add("Line " + line + ": Duplicate slot — Doctor " + doctorId + " already has a slot at " + startTime + " on " + date);
                        continue;
                    }

                    Doctor doctor = doctorRepository.findById(doctorId).orElseThrow();

                    Slot slot = new Slot();
                    slot.setDoctor(doctor);
                    slot.setDate(date);
                    slot.setStartTime(startTime);
                    slot.setEndTime(endTime);
                    slot.setIsBooked(false);

                    created.add(slotRepository.save(slot));
                } catch (Exception e) {
                    errors.add("Line " + line + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            errors.add("Failed to read file: " + e.getMessage());
        }

        return Map.of("created", created.size(), "errors", errors);
    }
}