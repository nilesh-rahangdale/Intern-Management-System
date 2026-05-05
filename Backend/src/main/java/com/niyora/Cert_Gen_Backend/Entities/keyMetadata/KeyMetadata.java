package com.niyora.Cert_Gen_Backend.Entities.keyMetadata;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "key_metadata")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KeyMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String keyAlias;

    private String algorithm;
    private int keySize;

    private LocalDate validFrom;
    private LocalDate validTo;

    private boolean active;
}
