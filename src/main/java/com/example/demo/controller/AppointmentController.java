package com.example.demo.controller;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final SlotRepository slotRepository;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    public AppointmentController(AppointmentRepository appointmentRepository,
                                 SlotRepository slotRepository,
                                 DoctorRepository doctorRepository,
                                 UserRepository userRepository) {
        this.appointmentRepository = appointmentRepository;
        this.slotRepository = slotRepository;
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public Appointment book(@RequestBody Map<String, String> body) {
        Slot slot = slotRepository.findById(Long.parseLong(body.get("slotId"))).orElseThrow();

        if (slot.getIsBooked()) {
            throw new RuntimeException("Slot already booked");
        }

        slot.setIsBooked(true);
        slotRepository.save(slot);

        User patient = userRepository.findByEmail(body.get("patientEmail"));
        Doctor doctor = slot.getDoctor();

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setSlot(slot);
        appointment.setStatus("CONFIRMED");
        appointment.setBookingDate(LocalDate.now().toString());

        return appointmentRepository.save(appointment);
    }

    @GetMapping("/all")
    public List<Appointment> allAppointments(@RequestParam String date) {
        return appointmentRepository.findByBookingDate(date);
    }

    @GetMapping("/my")
    public List<Appointment> myAppointments(@RequestParam String email) {
        User patient = userRepository.findByEmail(email);
        return appointmentRepository.findByPatientId(patient.getId());
    }

    @PutMapping("/{id}/cancel")
    public Appointment cancel(@PathVariable Long id) {
        Appointment appointment = appointmentRepository.findById(id).orElseThrow();
        appointment.setStatus("CANCELLED");

        Slot slot = appointment.getSlot();
        slot.setIsBooked(false);
        slotRepository.save(slot);

        return appointmentRepository.save(appointment);
    }

    @PutMapping("/{id}/status")
    public Appointment updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Appointment appointment = appointmentRepository.findById(id).orElseThrow();
        appointment.setStatus(body.get("status"));
        return appointmentRepository.save(appointment);
    }

    @GetMapping("/summary")
    public Map<String, Object> getSummary(@RequestParam String date) {
        List<Appointment> all = appointmentRepository.findByBookingDate(date);

        Map<String, Long> byMode = all.stream()
                .collect(Collectors.groupingBy(a -> a.getDoctor().getMode(), Collectors.counting()));

        Map<String, Long> bySpecialty = all.stream()
                .collect(Collectors.groupingBy(a -> a.getDoctor().getSpecialty().getName(), Collectors.counting()));

        Map<String, Long> byStatus = all.stream()
                .collect(Collectors.groupingBy(Appointment::getStatus, Collectors.counting()));

        Map<String, Object> summary = new HashMap<>();
        summary.put("total", all.size());
        summary.put("byMode", byMode);
        summary.put("bySpecialty", bySpecialty);
        summary.put("byStatus", byStatus);

        return summary;
    }
}
