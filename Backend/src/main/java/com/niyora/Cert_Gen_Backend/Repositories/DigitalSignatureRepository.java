package com.niyora.Cert_Gen_Backend.Repositories;

import com.niyora.Cert_Gen_Backend.Entities.digitalSignature.DigitalSignature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DigitalSignatureRepository extends JpaRepository<DigitalSignature, Long> {
    Optional<DigitalSignature> findByCertificate_CertificateId(String certificateId);
    boolean existsByCertificate_CertificateId(String certificateId);
}

