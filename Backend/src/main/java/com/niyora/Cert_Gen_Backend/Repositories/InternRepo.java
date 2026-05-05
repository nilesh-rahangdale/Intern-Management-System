package com.niyora.Cert_Gen_Backend.Repositories;


import com.niyora.Cert_Gen_Backend.Entities.intern.Intern;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InternRepo extends JpaRepository<Intern, String> {
    Optional<Intern> findByInternId(String internId);

    boolean existsByEmail(String email);

    /**
     * Search interns by name with relevance-based ordering
     * Ordering logic:
     * 1. Exact match (case-insensitive) - highest priority
     * 2. Starts with search term - high priority
     * 3. Contains search term - medium priority
     * 4. Word boundary matches - lower priority
     */
    @Query("""
        SELECT i FROM Intern i 
        WHERE LOWER(i.fullName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        ORDER BY 
            CASE 
                WHEN LOWER(i.fullName) = LOWER(:searchTerm) THEN 1
                WHEN LOWER(i.fullName) LIKE LOWER(CONCAT(:searchTerm, '%')) THEN 2
                WHEN LOWER(i.fullName) LIKE LOWER(CONCAT('% ', :searchTerm, '%')) THEN 3
                ELSE 4
            END,
            i.fullName
        """)
    List<Intern> searchByName(@Param("searchTerm") String searchTerm);

}
