package com.niyora.Cert_Gen_Backend.DTOs.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginReqDto {
    @NotBlank
    private String email;
    @NotBlank
    private String password;
}
