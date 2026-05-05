package com.niyora.Cert_Gen_Backend.Services.auth;

import com.niyora.Cert_Gen_Backend.Entities.users.User;
import com.niyora.Cert_Gen_Backend.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    @Autowired
    private UserRepository userRepo;

//    @Override
//    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
//        User user=userRepo.findByUsername(username)
//                .orElseThrow(()->new RuntimeException("User not found with username: " + username));
//        return user;
//    }

    @Override
    public UserDetails loadUserByUsername(String mail) throws UsernameNotFoundException {
        User user=userRepo.findByEmail((mail))
                .orElseThrow(()->new RuntimeException("User not found with mail: " + mail));
        return user;
    }
}
