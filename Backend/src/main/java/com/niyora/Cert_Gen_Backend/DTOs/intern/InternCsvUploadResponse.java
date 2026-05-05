package com.niyora.Cert_Gen_Backend.DTOs.intern;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class InternCsvUploadResponse {

    private int successCount;
    private int failureCount;
    private List<InternDto> successfulInterns;
    private List<CsvRowError> failedRows;
}
