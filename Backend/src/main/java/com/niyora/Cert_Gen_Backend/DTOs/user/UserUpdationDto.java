package com.niyora.Cert_Gen_Backend.DTOs.user;


import com.niyora.Cert_Gen_Backend.Entities.users.User;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Getter
@Setter
public class UserUpdationDto {


    private String fullName;
    private Set<User.Role> roles;
    private String email;
    private String phoneNumber;
    private User.Status status;
    private String blockChainIdentity;

}
