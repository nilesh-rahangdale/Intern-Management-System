package com.niyora.Cert_Gen_Backend.Repositories;

import com.niyora.Cert_Gen_Backend.Entities.qrMetadata.QRMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QRMetadataRepository extends JpaRepository<QRMetadata, Long> {
    Optional<QRMetadata> findByCertificate_CertificateId(String certificateId);
    boolean existsByCertificate_CertificateId(String certificateId);
}

