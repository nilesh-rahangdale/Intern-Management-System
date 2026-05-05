package com.niyora.Cert_Gen_Backend.Controllers.intern;


import com.niyora.Cert_Gen_Backend.DTOs.common.ApiResponse;
import com.niyora.Cert_Gen_Backend.DTOs.intern.InternCsvUploadResponse;
import com.niyora.Cert_Gen_Backend.DTOs.intern.InternDashboardResponse;
import com.niyora.Cert_Gen_Backend.DTOs.intern.InternDto;
import com.niyora.Cert_Gen_Backend.Entities.intern.Intern;
import com.niyora.Cert_Gen_Backend.Services.intern.InternService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/intern")
@RequiredArgsConstructor
public class InternController {

    private final InternService internService;

    /**
     * Add a new intern to the system
     * @param internDto The intern details
     * @return ResponseEntity containing the created intern wrapped in ApiResponse
     */
    @PostMapping("/addIntern")
    public ResponseEntity<ApiResponse<InternDto>> addIntern(@RequestBody InternDto internDto) {
        log.info("Adding new intern: {}", internDto.getFullName());
        
        InternDto createdIntern = internService.addIntern(internDto);
        
        log.info("Intern added successfully with ID: {}", createdIntern.getInternId());
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Intern added successfully", createdIntern));
    }
    /**
     * Update existing intern details
     * @param internDto The updated intern details
     * @return ResponseEntity containing the updated intern wrapped in ApiResponse
     */
    @PutMapping("/updateIntern")
    public ResponseEntity<ApiResponse<InternDto>> updateIntern(@RequestBody InternDto internDto) {
        log.info("Updating intern: {}", internDto.getInternId());
        
        InternDto updatedIntern = internService.updateIntern(internDto);
        
        log.info("Intern updated successfully: {}", updatedIntern.getInternId());
        
        return ResponseEntity.ok(
                ApiResponse.success("Intern updated successfully", updatedIntern)
        );
    }
    /**
     * Update intern status (ONGOING, COMPLETED, CANCELLED)
     * @param status The new status
     * @param internId The intern ID
     * @return ResponseEntity containing the updated intern wrapped in ApiResponse
     */
    @PutMapping("/updateInternStatus")
    public ResponseEntity<ApiResponse<InternDto>> updateInternStatus(
            @RequestParam String status, 
            @RequestParam String internId) {
        
        log.info("Updating status for intern {} to {}", internId, status);
        
        InternDto updatedIntern = internService.updateInternStatus(status, internId);
        
        log.info("Intern status updated successfully: {} -> {}", internId, status);
        
        return ResponseEntity.ok(
                ApiResponse.success("Intern status updated successfully", updatedIntern)
        );
    }

    /**
     * Get all interns in the system
     * @return ResponseEntity containing list of all interns wrapped in ApiResponse
     */
    @GetMapping("/getAllInterns")
    public ResponseEntity<ApiResponse<List<InternDto>>> getAllInterns() {
        log.info("Fetching all interns");
        
        List<InternDto> interns = internService.getAllInterns();
        
        log.info("Retrieved {} interns", interns.size());
        
        return ResponseEntity.ok(
                ApiResponse.success("Interns retrieved successfully", interns)
        );
    }

    /**
     * Get intern by ID
     * @param internId The intern ID
     * @return ResponseEntity containing the intern details wrapped in ApiResponse
     */
    @GetMapping("/getInternById/{internId}")
    public ResponseEntity<ApiResponse<InternDto>> getInternById(@PathVariable String internId) {
        log.info("Fetching intern with ID: {}", internId);
        
        InternDto intern = internService.getInternById(internId);
        
        return ResponseEntity.ok(
                ApiResponse.success("Intern retrieved successfully", intern)
        );
    }

    /**
     * Search interns by name with relevance-based ordering
     * Supports partial matches and case-insensitive search
     * Example: searching "Nilesh" will match "Nilesh Yogeshwar Rahangdale", "Nilesh Yogesh Roy", "Rahul Nilesh Patle"
     * Searching "Nile" or "nilesh" will also work
     * Results are ordered by relevance (exact matches first, then starts-with, then contains)
     * 
     * @param name The name or partial name to search for
     * @return ResponseEntity containing list of matching interns ordered by relevance, wrapped in ApiResponse
     */
    @GetMapping("/searchByName")
    public ResponseEntity<ApiResponse<List<InternDto>>> searchInternsByName(
            @RequestParam("name") String name) {
        
//        log.info("Searching interns with name: '{}'", name);
        
        List<InternDto> interns = internService.searchInternsByName(name);
        
//        log.info("Found {} interns matching '{}'", interns.size(), name);
        
        String message = interns.isEmpty() 
                ? "No interns found matching the name"+name
                : String.format("%d intern(s) found", interns.size());
        
        return ResponseEntity.ok(
                ApiResponse.success(message, interns)
        );
    }

    /**
     * Upload interns via CSV file
     * @param file The CSV file containing intern data
     * @return ResponseEntity containing upload results wrapped in ApiResponse
     */
    @PostMapping("/upload-csv")
    public ResponseEntity<ApiResponse<InternCsvUploadResponse>> uploadInternCsv(
            @RequestParam("file") MultipartFile file) throws IOException {
        
        log.info("Processing CSV upload: {}", file.getOriginalFilename());
        
        InternCsvUploadResponse response = internService.addInternsFromCsv(file);
        
        log.info("CSV upload completed: {} successful, {} failed", 
                response.getSuccessCount(), response.getFailureCount());
        
        String message = String.format(
                "CSV processed: %d interns added, %d failed", 
                response.getSuccessCount(), 
                response.getFailureCount()
        );
        
        return ResponseEntity.ok(
                ApiResponse.success(message, response)
        );
    }

    /**
     * Change internship type (PAID or UNPAID)
     * Only accessible by users with HR or ADMIN role
     * @param internId The intern ID
     * @param type New internship type (PAID or UNPAID)
     * @return ResponseEntity containing updated intern wrapped in ApiResponse
     */
    @PatchMapping("/changeInternshipType/{internId}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<ApiResponse<InternDto>> changeInternshipType(
            @PathVariable String internId,
            @RequestParam("type") Intern.InternshipType type) {
        
        log.info("Changing internship type for intern {} to {}", internId, type);
        
        InternDto updatedIntern = internService.updateInternshipType(internId, type);
        
        log.info("Internship type updated successfully for intern: {}", internId);
        
        return ResponseEntity.ok(
                ApiResponse.success("Internship type updated successfully", updatedIntern)
        );
    }

    /**
     * Get dashboard statistics for interns and certificates
     * Provides key insights including:
     * - Total interns and certificates
     * - Breakdown by intern status (ONGOING, COMPLETED, CANCELLED)
     * - Breakdown by certificate status (GENERATED, SIGNED, REVOKED)
     * - Breakdown by internship type (PAID, UNPAID)
     * - Recent 5 interns
     * 
     * Accessible by HR and DIRECTOR roles
     * 
     * @return ResponseEntity containing dashboard statistics wrapped in ApiResponse
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('HR', 'DIRECTOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<InternDashboardResponse>> getDashboard() {
        log.info("Fetching dashboard statistics");
        
        InternDashboardResponse dashboardStats = internService.getDashboardStats();
        
        log.info("Dashboard statistics retrieved: {} total interns, {} total certificates", 
                dashboardStats.getTotalInterns(), dashboardStats.getTotalCertificates());
        
        return ResponseEntity.ok(
                ApiResponse.success("Dashboard statistics retrieved successfully", dashboardStats)
        );
    }


}
