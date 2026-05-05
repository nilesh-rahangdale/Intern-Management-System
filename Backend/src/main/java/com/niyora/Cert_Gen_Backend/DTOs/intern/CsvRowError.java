package com.niyora.Cert_Gen_Backend.DTOs.intern;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CsvRowError {

    private long rowNumber;
    private String errorMessage;
}