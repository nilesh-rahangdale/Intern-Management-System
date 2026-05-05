package com.niyora.Cert_Gen_Backend.Configs;

import com.niyora.Cert_Gen_Backend.Entities.users.User;
import com.niyora.Cert_Gen_Backend.Repositories.UserRepository;
import com.niyora.Cert_Gen_Backend.Services.auth.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepo;


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String header=request.getHeader("Authorization");
        Long userId=null;
        String token=null;

        if(header!=null && header.startsWith("Bearer ") ){
            token=header.substring(7);
        }

        if (token == null && request.getCookies()!=null) {
            Cookie [] cookies=request.getCookies();
            for(Cookie cookie:cookies){
                if("JwtToken".equals(cookie.getName())){
                    token=cookie.getValue();
                    break;
                }
            }
        }

        if(token==null){
            filterChain.doFilter(request, response);
            return;
        }
        if(jwtService.extractUserId(token)==null){
            throw new RuntimeException("Error from JwtFilter"+jwtService.extractUserId(token)+token);
        }
        userId=Long.parseLong(jwtService.extractUserId(token));
        if(userId !=null && SecurityContextHolder.getContext().getAuthentication()==null){
            Long finalUserId = userId;
            var userDetails=userRepo.findById(userId)
                    .orElseThrow(()->new RuntimeException("User not found with id: " + finalUserId));

            if(jwtService.isTokenValid(token, userDetails) && userDetails.getStatus()== User.Status.ACTIVE){
                UsernamePasswordAuthenticationToken authenticationToken=
                        new UsernamePasswordAuthenticationToken(userDetails,null,userDetails.getAuthorities());
                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            }
    }
        filterChain.doFilter(request,response);
    }
}
