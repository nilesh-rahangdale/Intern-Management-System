package com.niyora.Cert_Gen_Backend.DTOs.user;

import com.niyora.Cert_Gen_Backend.Entities.users.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

/**
 * DTO for User Dashboard Statistics
 * Provides comprehensive analytics for Admin landing page
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDashboardResponse {

    /**
     * Total number of users in the system
     */
    private Long totalUsers;

    /**
     * Breakdown of users by status
     */
    private UserStatusStats userStatusStats;

    /**
     * Breakdown of users by role
     */
    private UserRoleStats userRoleStats;

    /**
     * List of 5 most recently registered users
     */
    private List<RecentUserInfo> recentUsers;

    /**
     * Statistics for user status distribution
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserStatusStats {
        private Long active;
        private Long inactive;
        private Long blocked;
    }

    /**
     * Statistics for user role distribution
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserRoleStats {
        private Long admin;
        private Long hr;
        private Long director;
    }

    /**
     * Simplified user information for recent users list
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentUserInfo {
        private Long userId;
        private String fullName;
        private String email;
        private Set<User.Role> role;
        private User.Status status;
    }
}
