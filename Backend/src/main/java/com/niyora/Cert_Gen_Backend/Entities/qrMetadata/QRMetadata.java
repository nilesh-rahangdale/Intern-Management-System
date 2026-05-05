package com.niyora.Cert_Gen_Backend.Entities.qrMetadata;

import com.niyora.Cert_Gen_Backend.Entities.certificate.Certificate;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "qr_metadata")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QRMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "certificate_id", nullable = false)
    private Certificate certificate;


    @Column(nullable = false, length = 255)
    private String verificationUrl;

    @Column(length = 64, nullable = false)
    private String qrPayloadHash;

}
