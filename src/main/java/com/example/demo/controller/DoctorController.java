package com.example.demo.controller;
import java.util.Map;
import com.example.demo.model.Doctor;
import com.example.demo.model.Specialty;
import com.example.demo.repository.DoctorRepository;
import com.example.demo.repository.SpecialtyRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorRepository doctorRepository;
    private final SpecialtyRepository specialtyRepository;

    public DoctorController(DoctorRepository doctorRepository, SpecialtyRepository specialtyRepository) {
        this.doctorRepository = doctorRepository;
        this.specialtyRepository = specialtyRepository;
    }

    @GetMapping
    public List<Doctor> getBySpecialtyAndMode(@RequestParam Long specialtyId, @RequestParam String mode) {
        return doctorRepository.findBySpecialtyIdAndMode(specialtyId, mode);
    }

    @GetMapping("/all")
    public List<Doctor> getAll() {
        return doctorRepository.findAll();
    }

    @PostMapping
    public Doctor create(@RequestBody Map<String, String> body) {
        Doctor doctor = new Doctor();
        doctor.setName(body.get("name"));
        doctor.setMode(body.get("mode"));
        doctor.setVideoLink(body.get("videoLink"));
        doctor.setClinicAddress(body.get("clinicAddress"));

        Specialty specialty = specialtyRepository.findById(Long.parseLong(body.get("specialtyId"))).orElseThrow();
        doctor.setSpecialty(specialty);

        return doctorRepository.save(doctor);
    }
}
