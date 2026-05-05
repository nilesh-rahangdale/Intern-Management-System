package com.niyora.Cert_Gen_Backend.Repositories;

import com.niyora.Cert_Gen_Backend.Entities.idSequence.IdSequence;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IdSequenceRepository extends JpaRepository<IdSequence, String> {


    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM IdSequence s WHERE s.sequenceKey = :key")
    Optional<IdSequence> findByKeyWithLock(@Param("key") String key);


}
