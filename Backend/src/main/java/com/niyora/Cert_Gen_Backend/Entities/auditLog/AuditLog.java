package com.niyora.Cert_Gen_Backend.Entities.auditLog;

import com.niyora.Cert_Gen_Backend.Entities.users.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String action;
    private String entityType;
    private String entityId;

    private String ipAddress;
    
    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();
}
