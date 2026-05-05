package com.niyora.Cert_Gen_Backend.Controllers.user;

import com.niyora.Cert_Gen_Backend.DTOs.auth.ChangePassDto;
import com.niyora.Cert_Gen_Backend.DTOs.auth.RegisterReqDto;
import com.niyora.Cert_Gen_Backend.DTOs.common.ApiResponse;
import com.niyora.Cert_Gen_Backend.DTOs.user.UserDashboardResponse;
import com.niyora.Cert_Gen_Backend.DTOs.user.UserDto;
import com.niyora.Cert_Gen_Backend.DTOs.user.UserUpdationDto;
import com.niyora.Cert_Gen_Backend.Entities.users.User;
import com.niyora.Cert_Gen_Backend.Repositories.UserRepository;
import com.niyora.Cert_Gen_Backend.Services.auth.AuthenticationService;
import com.niyora.Cert_Gen_Backend.Services.auth.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AuthenticationService authenticationService;
    private final UserRepository userRepository;

    /**
     * Register a new user (ADMIN, HR, or DIRECTOR)
     * Only accessible by users with ADMIN role
     * @param registerReqDto User registration details
     * @param authentication Current authenticated user
     * @return ResponseEntity containing created user wrapped in ApiResponse
     */
    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> registerUser(
            @RequestBody RegisterReqDto registerReqDto,
            Authentication authentication) {

        log.info("Admin registering new user with email: {}", registerReqDto.getEmail());

        if (authentication == null) {
            log.error("Unauthorized attempt to register user");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required"));
        }

        String email = authentication.getName();
        User createdBy = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Admin user not found with email: " + email));

        UserDto userDto = authenticationService.registerUser(registerReqDto, createdBy);

        log.info("User registered successfully with ID: {}", userDto.getId());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", userDto));
    }

    /**
     * Get user by ID
     * @param id User ID
     * @return ResponseEntity containing user details wrapped in ApiResponse
     */
    @GetMapping("/getUserById/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Long id) {
        log.info("Fetching user with ID: {}", id);

        UserDto userDto = userService.getUserById(id);

        return ResponseEntity.ok(
                ApiResponse.success("User retrieved successfully", userDto)
        );
    }

    /**
     * Get all users
     * Only accessible by users with ADMIN role
     * @return ResponseEntity containing list of all users wrapped in ApiResponse
     */
    @GetMapping("/getAllUsers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        log.info("Fetching all users");

        List<UserDto> users = userService.findAll();

        log.info("Retrieved {} users", users.size());

        return ResponseEntity.ok(
                ApiResponse.success("Users retrieved successfully", users)
        );
    }

    /**
     * Search users by name with relevance-based ordering
     * Supports partial matches and case-insensitive search
     * Only accessible by users with ADMIN role
     * Example: searching "Nilesh" will match "Nilesh Yogeshwar Rahangdale", "Nilesh Yogesh Roy", "Rahul Nilesh Patle"
     * Searching "Nile" or "nilesh" will also work
     * Results are ordered by relevance (exact matches first, then starts-with, then contains)
     * 
     * @param name The name or partial name to search for
     * @return ResponseEntity containing list of matching users ordered by relevance, wrapped in ApiResponse
     */
    @GetMapping("/searchByName")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserDto>>> searchUsersByName(
            @RequestParam("name") String name) {
        
        log.info("Searching users with name: '{}'", name);
        
        List<UserDto> users = userService.searchUsersByName(name);
        
        log.info("Found {} users matching '{}'", users.size(), name);
        
        String message = users.isEmpty() 
                ? "No users found matching the search term" 
                : String.format("%d user(s) found", users.size());
        
        return ResponseEntity.ok(
                ApiResponse.success(message, users)
        );
    }

    /**
     * Change user password
     * Only accessible by users with ADMIN role
     * @param id User ID
     * @param changePassDto New password details
     * @return ResponseEntity containing updated user wrapped in ApiResponse
     */
    @PutMapping("/changePassword/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'DIRECTOR')")
    public ResponseEntity<ApiResponse<UserDto>> changePassword(
            @PathVariable Long id,
            @RequestBody ChangePassDto changePassDto) {

        log.info("Changing password for user ID: {}", id);

        UserDto userDto = userService.changePassword(id, changePassDto);

        return ResponseEntity.ok(
                ApiResponse.success("Password changed successfully", userDto)
        );
    }

    /**
     * Update user details
     * Only accessible by users with ADMIN role
     * @param id User ID
     * @param userUpdationDto Updated user details
     * @return ResponseEntity containing updated user wrapped in ApiResponse
     */
    @PutMapping("/updateUser/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable Long id,
            @RequestBody UserUpdationDto userUpdationDto) {

        log.info("Updating user with ID: {}", id);

        UserDto updatedUser = userService.updateUser(id, userUpdationDto);

        return ResponseEntity.ok(
                ApiResponse.success("User updated successfully", updatedUser)
        );
    }

    /**
     * Delete user
     * Only accessible by users with ADMIN role
     * @param id User ID
     * @return ResponseEntity containing success message wrapped in ApiResponse
     */
    @DeleteMapping("/deleteUser/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long id) {
        log.info("Deleting user with ID: {}", id);

        userService.deleteUser(id);

        return ResponseEntity.ok(
                ApiResponse.success("User deleted successfully", "User with ID " + id + " has been deleted")
        );
    }

    /**
     * Change user status (ACTIVE, INACTIVE, BLOCKED)
     * Only accessible by users with ADMIN role
     * @param id User ID
     * @param status New status (ACTIVE, INACTIVE, or BLOCKED)
     * @return ResponseEntity containing updated user wrapped in ApiResponse
     */
    @PatchMapping("/changeStatus/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> changeUserStatus(
            @PathVariable Long id,
            @RequestParam("status") User.Status status) {
        
        log.info("Changing status for user ID: {} to {}", id, status);

        UserDto updatedUser = userService.updateUserStatus(id, status);

        log.info("User status updated successfully for ID: {}", id);

        return ResponseEntity.ok(
                ApiResponse.success("User status updated successfully", updatedUser)
        );
    }

    /**
     * Get user dashboard statistics
     * Provides comprehensive analytics for Admin landing page
     * Only accessible by users with ADMIN role
     * 
     * Returns:
     * - Total number of users
     * - User status breakdown (active, inactive, blocked)
     * - User role breakdown (admin, hr, director)
     * - 5 most recently registered users
     * 
     * @return ResponseEntity containing dashboard statistics wrapped in ApiResponse
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDashboardResponse>> getDashboard() {
        log.info("Fetching user dashboard statistics");

        UserDashboardResponse dashboardStats = userService.getDashboardStats();

        log.info("User dashboard statistics retrieved successfully. Total users: {}",
                dashboardStats.getTotalUsers());

        return ResponseEntity.ok(
                ApiResponse.success("Dashboard statistics retrieved successfully", dashboardStats)
        );
    }

}
