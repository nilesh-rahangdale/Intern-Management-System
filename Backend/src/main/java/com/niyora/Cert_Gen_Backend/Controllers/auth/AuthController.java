package com.niyora.Cert_Gen_Backend.Controllers.auth;

import com.niyora.Cert_Gen_Backend.DTOs.auth.LoginReqDto;
import com.niyora.Cert_Gen_Backend.DTOs.auth.LoginRespDto;
import com.niyora.Cert_Gen_Backend.DTOs.auth.MailConfirmationDTO;
import com.niyora.Cert_Gen_Backend.DTOs.user.UserDto;
import com.niyora.Cert_Gen_Backend.Services.auth.AuthenticationService;
import com.niyora.Cert_Gen_Backend.Services.auth.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService authService;
    private final UserService userService;


    @PostMapping("/loginUser")
    public ResponseEntity<UserDto> loginUser(@RequestBody LoginReqDto loginReqDto){
        LoginRespDto loginRespDto= authService.loginUser(loginReqDto);

        ResponseCookie responseCookie=ResponseCookie.from("JwtToken", loginRespDto.getJwtToken())
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(60*60*10) // 10 hour
                .sameSite("Strict")
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, responseCookie.toString())
                .body(loginRespDto.getUserDto());
    }

    @PostMapping("/logoutUser")
    public ResponseEntity<String> logoutUser(){
        return authService.logOutUser();
    }

    @GetMapping("/getCurrentUser")
    public ResponseEntity<?> getCurrentUser(Authentication authentication){
        if(authentication ==null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not Authorized");
        }

        String email=authentication.getName();
        UserDto userDto=userService.findByEmail(email);
        return ResponseEntity.ok(userDto);
    }

    @PostMapping("/confirmMail")
    public ResponseEntity<?> confirmMail(@RequestBody MailConfirmationDTO mailConfirmationDTO, Authentication authentication){
        try {

            if(authentication==null){
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not Authorized");
            }

            authService.confirmMail(mailConfirmationDTO.getEmail(),mailConfirmationDTO.getOtp());
            return ResponseEntity.ok().body("Email is Verified");
        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


}
