package com.niyora.Cert_Gen_Backend.Services.auth;

import com.niyora.Cert_Gen_Backend.DTOs.auth.LoginReqDto;
import com.niyora.Cert_Gen_Backend.DTOs.auth.LoginRespDto;
import com.niyora.Cert_Gen_Backend.DTOs.auth.RegisterReqDto;
import com.niyora.Cert_Gen_Backend.DTOs.user.UserDto;
import com.niyora.Cert_Gen_Backend.Entities.users.User;
import com.niyora.Cert_Gen_Backend.Mappers.user.UserMapper;
import com.niyora.Cert_Gen_Backend.Repositories.UserRepository;
import com.niyora.Cert_Gen_Backend.Services.mail.MailService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepo;

    private final UserMapper userMapper;

    private final AuthenticationManager authenticationManager;

    private final JwtService jwtService;

    private final PasswordEncoder passwordEncoder;

    private final MailService mailService;



    public LoginRespDto loginUser(LoginReqDto loginReqDto) {
    User user = userRepo.findByEmail(loginReqDto.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found with username: " + loginReqDto.getEmail()));
    authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginReqDto.getEmail(),loginReqDto.getPassword()));
    String jwt=jwtService.generateToken(user);
    user.setLastLogin(LocalDateTime.now());
    userRepo.save(user);
        return LoginRespDto.builder()
                .jwtToken(jwt)
                .userDto(userMapper.toUserDto(user))
                .build();
    }

    public ResponseEntity<String> logOutUser() {
        ResponseCookie cookie=ResponseCookie.from("JwtToken","")
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(0) // Set max age to 0 to delete the cookie
                .build();

        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE,cookie.toString())
                .body("User logged out successfully");
    }


    @Transactional
    public UserDto registerUser(RegisterReqDto registerReqDto, User createdBy) {
        if(userRepo.existsByEmail(registerReqDto.getEmail())){
            throw new RuntimeException("User has been already registered with username"+registerReqDto.getEmail());
        }
        User user= new User();
        user.setEmail(registerReqDto.getEmail());
        user.setPassword(passwordEncoder.encode(registerReqDto.getPassword()));
        user.setFullName(registerReqDto.getFullName());
        user.setPhoneNumber(registerReqDto.getPhoneNumber());
        user.setRoles(registerReqDto.getRoles());
        user.setCreatedBy(createdBy);
        user.setMailOtp(generateConfirmationCode());
        user.setPhoneOtp(generateConfirmationCode());
        user.setStatus(User.Status.ACTIVE);
        user.setBlockChainIdentity(registerReqDto.getBlockChainIdentity());
        User savedUser=userRepo.save(user);

        mailService.sendMailConfirmation(savedUser);
        return userMapper.toUserDto(savedUser);
//        return savedUser;
    }


    private String generateConfirmationCode(){
        Random random = new Random();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }

    public Boolean confirmMail(String email, String otp) {
        User user=userRepo.findByEmail(email).orElseThrow(()->new RuntimeException("User not found with mail"+email));
        if(user.getIsEmailVerified()){
            throw new RuntimeException("User already verified with mail :-"+email);
        }
        else if(user.getMailOtp().equals(otp)){
            user.setMailOtp(null);
            user.setIsEmailVerified(true);
            User savedUser=userRepo.save(user);
            return savedUser.getIsEmailVerified();
        }else{
            throw new RuntimeException("Invalid OTP for user "+otp);
        }
    }


}
