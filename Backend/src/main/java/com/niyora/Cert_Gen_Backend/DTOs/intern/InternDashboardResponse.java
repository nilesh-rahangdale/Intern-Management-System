package com.niyora.Cert_Gen_Backend.DTOs.intern;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternDashboardResponse {
    
    // Overall Statistics
    private Integer totalInterns;
    private Integer totalCertificates;
    
    // Intern Statistics by Status
    private InternStatusStats internStatusStats;
    
    // Certificate Statistics by Status
    private CertificateStatusStats certificateStatusStats;
    
    // Internship Type Distribution
    private InternshipTypeStats internshipTypeStats;
    
    // Recent Interns (last 5)
    private List<RecentInternInfo> recentInterns;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InternStatusStats {
        private Integer ongoing;
        private Integer completed;
        private Integer cancelled;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CertificateStatusStats {
        private Integer generated;
        private Integer signed;
        private Integer revoked;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InternshipTypeStats {
        private Integer paid;
        private Integer unpaid;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentInternInfo {
        private String internId;
        private String fullName;
        private String email;
        private String status;
        private String course;
        private String domain;
    }
}
