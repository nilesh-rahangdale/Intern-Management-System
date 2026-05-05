package com.niyora.Cert_Gen_Backend.Mappers.user;

import com.niyora.Cert_Gen_Backend.DTOs.user.UserDto;
import com.niyora.Cert_Gen_Backend.Entities.users.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface UserMapper {

    /**
     * Maps User entity to UserDto including createdBy information
     * MapStruct will handle basic field mapping automatically
     * Custom default method provides mapping for nested createdBy fields
     */
    @Mapping(target = "createdById", expression = "java(user.getCreatedBy() != null ? user.getCreatedBy().getId() : null)")
    @Mapping(target = "createdByName", expression = "java(user.getCreatedBy() != null ? user.getCreatedBy().getFullName() : null)")
    UserDto toUserDto(User user);
}