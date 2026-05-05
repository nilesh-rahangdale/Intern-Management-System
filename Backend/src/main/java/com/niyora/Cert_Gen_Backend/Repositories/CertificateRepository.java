package com.niyora.Cert_Gen_Backend.Repositories;

import com.niyora.Cert_Gen_Backend.Controllers.certificate.access.CertificateController;
import com.niyora.Cert_Gen_Backend.Entities.certificate.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, String> {

    Optional<Certificate> findByCertificateId(String certificateId);

    List<Certificate> findByIntern_InternId(String internId);

    List<Certificate> findByIntern_InternIdAndStatus(String intern_internId, Certificate.Status status);


    boolean existsByCertificateId(String certificateId);

    boolean existsByIntern_InternId(String internId);


    List<Certificate> findByStatus(Certificate.Status status);
}

