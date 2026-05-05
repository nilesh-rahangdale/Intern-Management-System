package com.niyora.Cert_Gen_Backend.Services.intern;


import com.niyora.Cert_Gen_Backend.DTOs.intern.CsvRowError;
import com.niyora.Cert_Gen_Backend.DTOs.intern.InternCsvUploadResponse;
import com.niyora.Cert_Gen_Backend.DTOs.intern.InternDashboardResponse;
import com.niyora.Cert_Gen_Backend.DTOs.intern.InternDto;
import com.niyora.Cert_Gen_Backend.Entities.certificate.Certificate;
import com.niyora.Cert_Gen_Backend.Entities.intern.Intern;
import com.niyora.Cert_Gen_Backend.Exception.InternNotFoundException;
import com.niyora.Cert_Gen_Backend.Mappers.intern.InternMapper;
import com.niyora.Cert_Gen_Backend.Repositories.CertificateRepository;
import com.niyora.Cert_Gen_Backend.Repositories.InternRepo;
import com.niyora.Cert_Gen_Backend.Services.utils.idGenerator.IdGeneratorService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.Year;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InternService {

    private final InternRepo internRepo;
    private final InternMapper internMapper;
    private final IdGeneratorService idGeneratorService;
    private final CertificateRepository certificateRepository;



    @Transactional
    public InternDto addIntern(InternDto internDto) {
        if (internDto == null) {
            throw new IllegalArgumentException("internDto must not be null");
        }
        if ( internRepo.existsByEmail( internDto.getEmail() ) ){
            throw new IllegalStateException("Duplicate email");
        }
        int currentYear = java.time.Year.now().getValue();
        Intern intern = internMapper.toIntern(internDto);
        intern.setInternId(idGeneratorService.generateInternId(currentYear));
        intern.setStatus(Intern.Status.ONGOING);
        Intern saved = internRepo.save(intern);
        return internMapper.toInternDto(saved);
    }

    @Transactional
    public InternDto updateIntern(InternDto internDto) {
        if (internDto == null) {
            throw new IllegalArgumentException("internDto must not be null");
        }
        if (internDto.getInternId() == null) {
            throw new IllegalArgumentException("internDto.internId must not be null");
        }

        Intern existing = internRepo.findByInternId(internDto.getInternId()).orElseThrow(
                ()-> new InternNotFoundException("Intern not found for internId: " + internDto.getInternId()
                ));


        existing.setFullName(internDto.getFullName());
        existing.setEmail(internDto.getEmail());
        existing.setPhone(internDto.getPhone());
        existing.setAddress(internDto.getAddress());
        existing.setState(internDto.getState());
        existing.setDistrict(internDto.getDistrict());
        existing.setState(internDto.getState());
        existing.setAadhaarHash(internDto.getAadhaarHash());
        existing.setStatus(internDto.getStatus());

        existing.setCourse(internDto.getCourse());
        existing.setDomain(internDto.getDomain());
        existing.setInstituteName(internDto.getInstituteName());
        existing.setRollNumber(internDto.getRollNumber());
        existing.setCgpa(internDto.getCgpa());
        existing.setHscPercentage(internDto.getHscPercentage());
        existing.setSscPercentage(internDto.getSscPercentage());
        existing.setStartDate(internDto.getStartDate());
        existing.setEndDate(internDto.getEndDate());

        Intern saved = internRepo.save(existing);
        return internMapper.toInternDto(saved);
    }


    public List<InternDto> getAllInterns() {
        List<Intern> interns = internRepo.findAll();
        return internMapper.toInternDtoList(interns);
    }

    public @Nullable InternDto getInternById(String internId) {
        Intern interns = internRepo.findByInternId(internId).orElseThrow(
                ()-> new InternNotFoundException("Intern not found for internId: " + internId
        ));
        return internMapper.toInternDto(interns);
    }

    /**
     * Search interns by name with relevance-based ordering
     * Supports partial matches and case-insensitive search
     * @param searchTerm The name or partial name to search for
     * @return List of matching interns ordered by relevance
     */
    public List<InternDto> searchInternsByName(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            throw new IllegalArgumentException("Intern name must not be null or empty");
        }
        
        List<Intern> interns = internRepo.searchByName(searchTerm.trim());
        return internMapper.toInternDtoList(interns);
    }


    public InternDto updateInternStatus(String status, String internId) {
        if (internId == null) {
            throw new IllegalArgumentException("internDto.internId must not be null");
        }

        Intern existing = internRepo.findByInternId(internId).orElseThrow(
                ()-> new InternNotFoundException("Intern not found for internId: " + internId
                ));
        existing.setStatus(Intern.Status.valueOf(status));
        Intern saved = internRepo.save(existing);
        return internMapper.toInternDto(saved);

    }

    /**
     * Update internship type (PAID, UNPAID)
     * @param internId Intern ID
     * @param internshipType New internship type
     * @return Updated intern DTO
     */
    public InternDto updateInternshipType(String internId, Intern.InternshipType internshipType) {
        if (internId == null) {
            throw new IllegalArgumentException("internId must not be null");
        }
        if (internshipType == null) {
            throw new IllegalArgumentException("internshipType must not be null");
        }

        Intern existing = internRepo.findByInternId(internId)
                .orElseThrow(() -> new InternNotFoundException("Intern not found for internId: " + internId));
        
        existing.setInternshipType(internshipType);
        Intern saved = internRepo.save(existing);
        return internMapper.toInternDto(saved);
    }


    @Transactional
    public InternCsvUploadResponse addInternsFromCsv(MultipartFile file) {

        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (!Objects.requireNonNull(file.getOriginalFilename()).endsWith(".csv")) {
            throw new IllegalArgumentException("Only CSV files are allowed");
        }

        List<InternDto> successful = new ArrayList<>();
        List<CsvRowError> failed = new ArrayList<>();

        try (
                BufferedReader reader = new BufferedReader(
                        new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)
                );
                CSVParser csvParser = new CSVParser(reader,
                        CSVFormat.DEFAULT.builder()
                                .setHeader()
                                .setSkipHeaderRecord(true)
                                .setTrim(true)
                                .build()
                )
        ) {

            for (CSVRecord record : csvParser) {
                try {

                    // Optional duplicate checks
                    if ( internRepo.existsByEmail( record.get("email") ) ){
                        throw new IllegalStateException("Duplicate email");
                    }

                    Intern intern = Intern.builder()
                            .internId(idGeneratorService.generateInternId(Year.now().getValue()))
                            .fullName(record.get("fullName"))
                            .email(record.get("email"))
                            .phone(record.get("phone"))
                            .address(record.get("address"))
                            .state(record.get("state"))
                            .district(record.get("district"))
                            .aadhaarHash(record.get("aadhaarHash"))
                            .status(Intern.Status.ONGOING)
                            .course(record.get("course"))
                            .domain(record.get("domain"))
                            .instituteName(record.get("instituteName"))
                            .rollNumber(record.get("rollNumber"))
                            .cgpa(Double.parseDouble(record.get("cgpa")))
                            .hscPercentage(Double.parseDouble(record.get("hscPercentage")))
                            .sscPercentage(Double.parseDouble(record.get("sscPercentage")))
                            .department(record.get("department"))
                            .projectTitle(record.get("projectTitle"))
                            .mentorName(record.get("mentorName"))
                            .internshipType(
                                    Intern.InternshipType.valueOf(
                                            record.get("internshipType").toUpperCase()
                                    )
                            )
                            .startDate(
                                    LocalDate.parse(
                                            record.get("startDate"),
                                            DateTimeFormatter.ISO_DATE
                                    )
                            )
                            .endDate(
                                    LocalDate.parse(
                                            record.get("endDate"),
                                            DateTimeFormatter.ISO_DATE
                                    )
                            )
                            .build();

                    Intern saved = internRepo.save(intern);
                    successful.add(internMapper.toInternDto(saved));

                } catch (Exception ex) {

//                    log.error("Row {} failed: {}", record.getRecordNumber(), ex.getMessage());
                    System.out.println("Row " + record.getRecordNumber() + " failed: " + ex.getMessage());
                    failed.add(
                            new CsvRowError(
                                    record.getRecordNumber(),
                                    ex.getMessage()
                            )
                    );
                }
            }

        } catch (IOException ex) {
            throw new RuntimeException("Failed to read CSV file", ex);
        }

        return new InternCsvUploadResponse(
                successful.size(),
                failed.size(),
                successful,
                failed
        );
    }

    /**
     * Get dashboard statistics for interns and certificates
     * Provides key insights for HR and Director landing page
     * @return Dashboard response with statistics
     */
    public InternDashboardResponse getDashboardStats() {
        // Get all interns and certificates
        List<Intern> allInterns = internRepo.findAll();
        List<Certificate> allCertificates = certificateRepository.findAll();
        
        // Calculate intern status statistics
        long ongoingCount = allInterns.stream()
                .filter(i -> i.getStatus() == Intern.Status.ONGOING)
                .count();
        long completedCount = allInterns.stream()
                .filter(i -> i.getStatus() == Intern.Status.COMPLETED)
                .count();
        long cancelledCount = allInterns.stream()
                .filter(i -> i.getStatus() == Intern.Status.CANCELLED)
                .count();
        
        InternDashboardResponse.InternStatusStats internStatusStats = 
                InternDashboardResponse.InternStatusStats.builder()
                        .ongoing((int) ongoingCount)
                        .completed((int) completedCount)
                        .cancelled((int) cancelledCount)
                        .build();
        
        // Calculate certificate status statistics
        long generatedCount = allCertificates.stream()
                .filter(c -> c.getStatus() == Certificate.Status.GENERATED)
                .count();
        long signedCount = allCertificates.stream()
                .filter(c -> c.getStatus() == Certificate.Status.SIGNED)
                .count();
        long revokedCount = allCertificates.stream()
                .filter(c -> c.getStatus() == Certificate.Status.REVOKED)
                .count();
        
        InternDashboardResponse.CertificateStatusStats certificateStatusStats = 
                InternDashboardResponse.CertificateStatusStats.builder()
                        .generated((int) generatedCount)
                        .signed((int) signedCount)
                        .revoked((int) revokedCount)
                        .build();
        
        // Calculate internship type statistics
        long paidCount = allInterns.stream()
                .filter(i -> i.getInternshipType() == Intern.InternshipType.PAID)
                .count();
        long unpaidCount = allInterns.stream()
                .filter(i -> i.getInternshipType() == Intern.InternshipType.UNPAID)
                .count();
        
        InternDashboardResponse.InternshipTypeStats internshipTypeStats = 
                InternDashboardResponse.InternshipTypeStats.builder()
                        .paid((int) paidCount)
                        .unpaid((int) unpaidCount)
                        .build();
        
        // Get recent 5 interns (sorted by startDate descending)
        List<InternDashboardResponse.RecentInternInfo> recentInterns = allInterns.stream()
                .sorted((i1, i2) -> {
                    if (i1.getStartDate() == null) return 1;
                    if (i2.getStartDate() == null) return -1;
                    return i2.getStartDate().compareTo(i1.getStartDate());
                })
                .limit(5)
                .map(intern -> InternDashboardResponse.RecentInternInfo.builder()
                        .internId(intern.getInternId())
                        .fullName(intern.getFullName())
                        .email(intern.getEmail())
                        .status(intern.getStatus().name())
                        .course(intern.getCourse())
                        .domain(intern.getDomain())
                        .build())
                .collect(Collectors.toList());
        
        // Build and return dashboard response
        return InternDashboardResponse.builder()
                .totalInterns(allInterns.size())
                .totalCertificates(allCertificates.size())
                .internStatusStats(internStatusStats)
                .certificateStatusStats(certificateStatusStats)
                .internshipTypeStats(internshipTypeStats)
                .recentInterns(recentInterns)
                .build();
    }


} // class end




