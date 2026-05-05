package com.niyora.Cert_Gen_Backend.Controllers.zesting;


import com.niyora.Cert_Gen_Backend.Services.utils.idGenerator.IdGeneratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class TestController {

    private final IdGeneratorService idGeneratorService;

    @GetMapping("/greet")
    public String testEndpoint(){
        return "Test endpoint is working!";
    }



    @GetMapping("/genIntId")
    public String generateIntId(){
    return idGeneratorService.generateInternId(2025);
    }

    @GetMapping("/genCertId")
    public String genCertId(){
    return idGeneratorService.generateCertificateId(2025);
    }


}
