package com.niyora.Cert_Gen_Backend.Services.auth;

import com.niyora.Cert_Gen_Backend.DTOs.auth.ChangePassDto;
import com.niyora.Cert_Gen_Backend.DTOs.user.UserDashboardResponse;
import com.niyora.Cert_Gen_Backend.DTOs.user.UserDto;
import com.niyora.Cert_Gen_Backend.DTOs.user.UserUpdationDto;
import com.niyora.Cert_Gen_Backend.Entities.users.User;
import com.niyora.Cert_Gen_Backend.Mappers.user.UserMapper;
import com.niyora.Cert_Gen_Backend.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserMapper userMapper;

    public UserDto getUserById(Long id) {
        User user= userRepo.findById(id).orElseThrow(()-> new RuntimeException("User not found with id: " + id));
        UserDto userDto=userMapper.toUserDto(user);
        return userDto;
    }

    public UserDto findByEmail(String mail) {
        User user= userRepo.findByEmail(mail).orElseThrow(()->new RuntimeException("User not found with mail: " + mail));
        UserDto userDto=userMapper.toUserDto(user);
        return userDto;
    }

    public List<UserDto> findAll() {
        List<User> users = userRepo.findAll();
        return users.stream()
                .map(userMapper::toUserDto)
                .toList();
    }

    /**
     * Search users by name with relevance-based ordering
     * Supports partial matches and case-insensitive search
     * @param searchTerm The name or partial name to search for
     * @return List of matching users ordered by relevance
     */
    public List<UserDto> searchUsersByName(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            throw new IllegalArgumentException("Search term must not be null or empty");
        }
        
        List<User> users = userRepo.searchByName(searchTerm.trim());
        return users.stream()
                .map(userMapper::toUserDto)
                .toList();
    }

    public UserDto changePassword(Long id, ChangePassDto changePassDto) {
        User user= userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        if(! passwordEncoder.matches(changePassDto.getOldPassword(),user.getPassword())){
            throw new RuntimeException("Old password does not match  "+changePassDto.getOldPassword());
        }
        if(! changePassDto.getNewPassword().equals(changePassDto.getConfirmNewPassword())){
            throw new RuntimeException("New password and confirm password do not match");
        }
        user.setPassword(passwordEncoder.encode(changePassDto.getNewPassword()));
        User savedUser=userRepo.save(user);
        return userMapper.toUserDto(savedUser);
    }

    public UserDto updateUser(Long id, UserUpdationDto userDto) {
        User user=userRepo.findById(id).orElseThrow(()->new RuntimeException("User not found with id: " + id));
        user.setFullName(userDto.getFullName() !=null ? userDto.getFullName() : user.getFullName());
        user.setStatus(userDto.getStatus() != null ? userDto.getStatus() : user.getStatus());
        user.setPhoneNumber(userDto.getPhoneNumber() != null ? userDto.getPhoneNumber() : user.getPhoneNumber());
        user.setEmail(userDto.getEmail() != null ? userDto.getEmail() : user.getEmail());
        user.setRoles(userDto.getRoles() != null ? userDto.getRoles() : user.getRoles());
        user.setBlockChainIdentity(userDto.getBlockChainIdentity() != null ? userDto.getBlockChainIdentity() : user.getBlockChainIdentity());
//        if(userDto.getRoles() != null) {
//            user.getRoles().addAll(userDto.getRoles());
//        }

        User SavedUser=userRepo.save(user);
        return userMapper.toUserDto(SavedUser);
    }

    public void deleteUser(Long id) {
        User user=userRepo.findById(id).orElseThrow(()-> new RuntimeException("User not found with id: " + id));
        userRepo.deleteById(id);
    }

    /**
     * Update user status (ACTIVE, INACTIVE, BLOCKED)
     * @param id User ID
     * @param status New status
     * @return Updated user DTO
     */
    public UserDto updateUserStatus(Long id, User.Status status) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        user.setStatus(status);
        User savedUser = userRepo.save(user);
        return userMapper.toUserDto(savedUser);
    }

    /**
     * Get dashboard statistics for Admin
     * Provides comprehensive analytics about users in the system
     * @return UserDashboardResponse with all statistics
     */
    public UserDashboardResponse getDashboardStats() {
        List<User> allUsers = userRepo.findAll();

        // Calculate total users
        Long totalUsers = (long) allUsers.size();

        // Calculate user status statistics
        Long activeCount = allUsers.stream()
                .filter(user -> user.getStatus() == User.Status.ACTIVE)
                .count();
        Long inactiveCount = allUsers.stream()
                .filter(user -> user.getStatus() == User.Status.INACTIVE)
                .count();
        Long blockedCount = allUsers.stream()
                .filter(user -> user.getStatus() == User.Status.BLOCKED)
                .count();

        UserDashboardResponse.UserStatusStats statusStats = UserDashboardResponse.UserStatusStats.builder()
                .active(activeCount)
                .inactive(inactiveCount)
                .blocked(blockedCount)
                .build();

        // Calculate user role statistics
        Long adminCount = allUsers.stream()
                .filter(user -> user.getRoles().contains(User.Role.ROLE_ADMIN)  )
                .count();
        Long hrCount = allUsers.stream()
                .filter(user -> user.getRoles().contains(User.Role.ROLE_HR) )
                .count();
        Long directorCount = allUsers.stream()
                .filter(user -> user.getRoles().contains(User.Role.ROLE_DIRECTOR))
                .count();

        UserDashboardResponse.UserRoleStats roleStats = UserDashboardResponse.UserRoleStats.builder()
                .admin(adminCount)
                .hr(hrCount)
                .director(directorCount)
                .build();

        // Get 5 most recent users
        List<UserDashboardResponse.RecentUserInfo> recentUsers = allUsers.stream()
                .sorted(Comparator.comparing(User::getId).reversed())
                .limit(5)
                .map(user -> UserDashboardResponse.RecentUserInfo.builder()
                        .userId(user.getId())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .role(user.getRoles())
                        .status(user.getStatus())
                        .build())
                .collect(Collectors.toList());

        return UserDashboardResponse.builder()
                .totalUsers(totalUsers)
                .userStatusStats(statusStats)
                .userRoleStats(roleStats)
                .recentUsers(recentUsers)
                .build();
    }

}
