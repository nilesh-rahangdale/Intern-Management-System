package com.niyora.Cert_Gen_Backend.Entities.intern;

import com.niyora.Cert_Gen_Backend.Entities.certificate.Certificate;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "interns")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Intern {

    @Id
    @Column(length = 20)
    private String internId; // DRDO2026INT00045

    @Column(nullable = false)
    private String fullName;

    private String email;
    private String phone;
    private String address;
    private String state;
    private String district;
    private String aadhaarHash;

    // academic info
    private String course;
    private String domain;
    private String instituteName;
    private String rollNumber;
    private double cgpa;
    private double hscPercentage;
    private double sscPercentage;

    // internship info
    private String department;
    private String projectTitle;
    private String mentorName;

    @Enumerated(EnumType.STRING)
    private InternshipType internshipType;

    private LocalDate startDate;
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private Status status;

    @OneToMany(mappedBy = "intern", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Certificate> certificates;

    public enum Status {
        ONGOING, COMPLETED, CANCELLED
    }


    public enum InternshipType {
        PAID, UNPAID
    }

}
