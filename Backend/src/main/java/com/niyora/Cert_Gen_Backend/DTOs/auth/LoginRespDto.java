package com.niyora.Cert_Gen_Backend.DTOs.auth;

import com.niyora.Cert_Gen_Backend.DTOs.user.UserDto;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginRespDto {
    private String jwtToken;
    private UserDto userDto;
}
