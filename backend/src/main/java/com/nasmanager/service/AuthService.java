package com.nasmanager.service;

import com.nasmanager.dto.AuthRequests.*;
import com.nasmanager.model.Role;
import com.nasmanager.model.User;
import com.nasmanager.repository.UserRepository;
import com.nasmanager.security.JwtTokenProvider;
import com.nasmanager.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already taken!");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered!");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ROLE_USER)
                .build();

        userRepository.save(user);

        return login(new LoginRequest(request.getUsername(), request.getPassword()));
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsernameOrEmail(), request.getPassword())
        );

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(user.getId());

        UserDto userDto = UserDto.builder()
                .id(user.getId().toString())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .storageQuotaBytes(user.getStorageQuotaBytes())
                .storageUsedBytes(user.getStorageUsedBytes())
                .build();

        return new AuthResponse(accessToken, refreshToken, userDto);
    }

    public AuthResponse refreshToken(String refreshTokenStr) {
        if (!tokenProvider.validateToken(refreshTokenStr)) {
            throw new IllegalArgumentException("Invalid or expired refresh token");
        }

        UUID userId = tokenProvider.getUserIdFromToken(refreshTokenStr);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String newAccessToken = tokenProvider.generateTokenFromUserId(user.getId(), 86400000);
        String newRefreshToken = tokenProvider.generateRefreshToken(user.getId());

        UserDto userDto = UserDto.builder()
                .id(user.getId().toString())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .storageQuotaBytes(user.getStorageQuotaBytes())
                .storageUsedBytes(user.getStorageUsedBytes())
                .build();

        return new AuthResponse(newAccessToken, newRefreshToken, userDto);
    }
}
