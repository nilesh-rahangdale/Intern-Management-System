package com.niyora.Cert_Gen_Backend.Entities.digitalSignature;

import com.niyora.Cert_Gen_Backend.Entities.certificate.Certificate;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "digital_signatures",
        uniqueConstraints = @UniqueConstraint(columnNames = "certificate_id")
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DigitalSignature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "certificate_id")
    private Certificate certificate;

    @Column(nullable = false)
    private String signerName;

    @Column(nullable = false)
    private String signerRole;

    @Column(nullable = false)
    private String signatureAlgorithm;

    @Column(nullable = false, length = 255)
    private String certificateChainPath;

    @Column(nullable = false)
    private LocalDateTime signedAt;
}
