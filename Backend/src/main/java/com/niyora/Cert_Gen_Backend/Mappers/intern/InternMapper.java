package com.niyora.Cert_Gen_Backend.Mappers.intern;


import com.niyora.Cert_Gen_Backend.DTOs.intern.InternDto;
import com.niyora.Cert_Gen_Backend.Entities.intern.Intern;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface InternMapper {

    InternDto toInternDto(Intern intern);
    Intern toIntern(InternDto internDto);

    List<InternDto> toInternDtoList(List<Intern> interns);

}
