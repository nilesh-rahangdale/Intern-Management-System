package com.niyora.Cert_Gen_Backend.Services.utils.idGenerator;

import com.niyora.Cert_Gen_Backend.Entities.idSequence.IdSequence;
import com.niyora.Cert_Gen_Backend.Repositories.IdSequenceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;

@Service
@RequiredArgsConstructor
public class IdGeneratorService {


    private  final IdSequenceRepository repo;

    @Transactional()
    public String generateInternId(int year) {
        return generate("INTERN_" + year, "DRDO" + year + "INT");
    }

    @Transactional()
    public String generateCertificateId(int year) {
        return generate("CERT_" + year, "DRDO" + year + "CERT");
    }

    /**
     * Core ID generation logic with pessimistic write lock.
     */
    @Transactional
    public String generate(String key, String prefix) {
        // Acquire pessimistic write lock on the sequence row
        IdSequence seq = repo.findByKeyWithLock(key)
                .orElseGet(() -> {
                    System.out.println("Creating new sequence for key: " + key);
                    IdSequence newSeq = new IdSequence(key, 1L);
                    return repo.saveAndFlush(newSeq); // Immediate persistence
                });

        long currentValue = seq.getNextValue();
        seq.setNextValue(currentValue + 1);
        repo.saveAndFlush(seq); // Force immediate write

        String generatedId = prefix + String.format("%05d", currentValue);
//        log.debug("Generated ID: {} for key: {}", generatedId, key);
        System.out.println("Generated ID: " + generatedId);

        return generatedId;
    }




}
