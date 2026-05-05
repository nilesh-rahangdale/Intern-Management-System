package com.niyora.Cert_Gen_Backend.Entities.certificate;

import com.niyora.Cert_Gen_Backend.Entities.digitalSignature.DigitalSignature;
import com.niyora.Cert_Gen_Backend.Entities.intern.Intern;
import com.niyora.Cert_Gen_Backend.Entities.qrMetadata.QRMetadata;
import com.niyora.Cert_Gen_Backend.Entities.users.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
@Entity
@Table(
        name = "certificates",
        indexes = @Index(name = "idx_cert_no", columnList = "certificateId", unique = true)
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Certificate {

    // Identity
    @Id
    @Column(length = 25)
    private String certificateId; // DRDO2026CERT00012

    // Core Attributes
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CertificateType certificateType;

    @Column(nullable = false)
    private LocalDate issueDate;

//    @Column(nullable = false)
    @ManyToOne(fetch = FetchType.EAGER)
    private User issuedBy;

    private String revocationReason;

//    private boolean isReIssued;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Status status;

    @Column(nullable = false)
    private boolean isUploaded=false;

    private String pdfPath;

    // Security & Integrity
    @Column(name = "metadata_hash_sha256", length = 64, nullable = false)
    private String metadataHashSha256;

    // Relationships
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "intern_id", nullable = false)
    private Intern intern;

    @OneToOne(mappedBy = "certificate", cascade = CascadeType.ALL, orphanRemoval = true)
    private DigitalSignature digitalSignature;

    @OneToOne(mappedBy = "certificate", cascade = CascadeType.ALL, orphanRemoval = true)
    private QRMetadata qrMetadata;

    // Enums
    public enum Status {
        GENERATED, SIGNED, REVOKED
    }

    public enum CertificateType {
        PARTICIPATION, COMPLETION
    }
}
