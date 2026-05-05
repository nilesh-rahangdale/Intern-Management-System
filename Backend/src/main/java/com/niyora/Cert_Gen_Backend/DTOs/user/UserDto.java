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
public class UserDto {

    private Long id;
    private String fullName;
    private Set<User.Role> roles;
    private String email;
    private String phoneNumber;
    private String blockChainIdentity;
    private User.Status status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLogin;
    private Long createdById;
    private String createdByName;

}
