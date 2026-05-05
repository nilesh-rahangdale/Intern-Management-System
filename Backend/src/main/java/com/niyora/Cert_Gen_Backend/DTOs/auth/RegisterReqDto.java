package com.niyora.Cert_Gen_Backend.DTOs.auth;

import com.niyora.Cert_Gen_Backend.Entities.users.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterReqDto {


    @NotBlank
    @Email
    private String email;
    private String fullName;
    private String phoneNumber;
    private String password;
    private Set<User.Role> roles;
    private String blockChainIdentity;


}
