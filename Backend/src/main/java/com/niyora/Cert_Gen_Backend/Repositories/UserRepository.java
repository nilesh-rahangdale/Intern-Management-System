package com.niyora.Cert_Gen_Backend.Repositories;

import com.niyora.Cert_Gen_Backend.Entities.users.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {


    Optional<User> findByEmail(String email);

    boolean existsByEmail(@NotBlank @Email String email);

    /**
     * Search users by full name with relevance-based ordering
     * Ordering logic:
     * 1. Exact match (case-insensitive) - highest priority
     * 2. Starts with search term - high priority
     * 3. Contains search term at word boundary - medium priority
     * 4. Contains search term anywhere - lower priority
     */
    @Query("""
        SELECT u FROM User u 
        WHERE LOWER(u.fullName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        ORDER BY 
            CASE 
                WHEN LOWER(u.fullName) = LOWER(:searchTerm) THEN 1
                WHEN LOWER(u.fullName) LIKE LOWER(CONCAT(:searchTerm, '%')) THEN 2
                WHEN LOWER(u.fullName) LIKE LOWER(CONCAT('% ', :searchTerm, '%')) THEN 3
                ELSE 4
            END,
            u.fullName
        """)
    List<User> searchByName(@Param("searchTerm") String searchTerm);
}

