package com.niyora.Cert_Gen_Backend.DTOs.intern;


import com.niyora.Cert_Gen_Backend.Entities.intern.Intern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InternDto {

    private String internId;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String state;
    private String district;
    private String aadhaarHash;
    private Intern.Status status;

    // academic info
    private String course;
    private String domain;
    private String instituteName;
    private String rollNumber;
    private double cgpa;
    private double hscPercentage;
    private double sscPercentage;

    //Internship  info
    private String department;
    private String projectTitle;
    private String mentorName;
    private Intern.InternshipType internshipType;
    private LocalDate startDate;
    private LocalDate endDate;



}
