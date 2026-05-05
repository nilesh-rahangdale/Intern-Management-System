package com.niyora.Cert_Gen_Backend.DTOs.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MailConfirmationDTO {
    private String email;
    private String otp;
}
