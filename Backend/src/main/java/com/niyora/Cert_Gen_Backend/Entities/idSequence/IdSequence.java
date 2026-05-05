package com.niyora.Cert_Gen_Backend.Entities.idSequence;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "id_sequences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IdSequence {

    @Id
    @Column(length = 50)
    private String sequenceKey; // e.g., "INTERN_2026", "CERT_2026"

    @Column(nullable = false)
    private Long nextValue;

    public IdSequence(String sequenceKey, long nextValue) {
        this.sequenceKey = sequenceKey;
        this.nextValue = nextValue;
    }
}
