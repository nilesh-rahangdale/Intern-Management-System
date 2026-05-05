package com.niyora.Cert_Gen_Backend.Configs;

import com.niyora.Cert_Gen_Backend.Entities.users.User;
import com.niyora.Cert_Gen_Backend.Repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class StartupUserSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.users.enabled:true}")
    private boolean seedEnabled;

    @Value("${app.seed.users.admin.email:admin@certportal.com}")
    private String adminEmail;

    @Value("${app.seed.users.admin.password:Admin@123}")
    private String adminPassword;

    @Value("${app.seed.users.admin.name:System Admin}")
    private String adminName;

    @Value("${app.seed.users.hr.email:hr@certportal.com}")
    private String hrEmail;

    @Value("${app.seed.users.hr.password:Hr@123}")
    private String hrPassword;

    @Value("${app.seed.users.hr.name:Default HR}")
    private String hrName;

    @Value("${app.seed.users.director.email:director@certportal.com}")
    private String directorEmail;

    @Value("${app.seed.users.director.password:Director@123}")
    private String directorPassword;

    @Value("${app.seed.users.director.name:Default Director}")
    private String directorName;

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled) {
            log.info("Startup user seeding is disabled (app.seed.users.enabled=false)");
            return;
        }

        User admin = createIfMissing(
            adminEmail,
            adminPassword,
            adminName,
            User.Role.ROLE_ADMIN,
            "ADMIN",
            null
        );

        createIfMissing(
            hrEmail,
            hrPassword,
            hrName,
            User.Role.ROLE_HR,
            "hr",
            admin
        );

        createIfMissing(
            directorEmail,
            directorPassword,
            directorName,
            User.Role.ROLE_DIRECTOR,
            "director",
            admin
        );
    }

    private User createIfMissing(
        String email,
        String rawPassword,
        String name,
        User.Role role,
        String blockchainIdentity,
        User createdBy
    ) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setFullName(name);
            user.setRoles(Set.of(role));
            user.setStatus(User.Status.ACTIVE);
            user.setIsEmailVerified(true);
            user.setIsPhoneNumberVerified(true);
            user.setBlockChainIdentity(blockchainIdentity);
            user.setCreatedBy(createdBy);

            User saved = userRepository.save(user);
            log.info("Seeded startup user with role {} and email {}", role, email);
            return saved;
        });
    }
}
