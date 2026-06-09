package com.lifexp.demo.controller;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {
    private final UserAccountRepository userRepository;
    private final SaveService saveService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);
    private final Map<String, Long> sessions = new ConcurrentHashMap<>();

    public AuthService(UserAccountRepository userRepository, SaveService saveService) {
        this.userRepository = userRepository;
        this.saveService = saveService;
    }

    public AuthResponse register(AuthRequest request) {
        String username = normalizeUsername(request.username);
        String password = requirePassword(request.password);

        if (userRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Username is already taken.");
        }

        UserAccount account = new UserAccount();
        account.username = username;
        account.passwordHash = passwordEncoder.encode(password);
        account.gameState = saveService.serialize(new PlayerState());
        account.createdAt = Instant.now();
        account.updatedAt = Instant.now();
        account = userRepository.save(account);

        return createSession(account);
    }

    public AuthResponse login(AuthRequest request) {
        String username = normalizeUsername(request.username);
        String password = requirePassword(request.password);
        UserAccount account = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password."));

        if (!passwordEncoder.matches(password, account.passwordHash)) {
            throw new IllegalArgumentException("Invalid username or password.");
        }

        return createSession(account);
    }

    public UserAccount requireAccount(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Missing login token.");
        }

        String token = authorizationHeader.substring("Bearer ".length()).trim();
        Long userId = sessions.get(token);

        if (userId == null) {
            throw new IllegalArgumentException("Invalid or expired login token.");
        }

        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User account no longer exists."));
    }

    private AuthResponse createSession(UserAccount account) {
        String token = UUID.randomUUID().toString();
        sessions.put(token, account.id);
        return new AuthResponse(token, account.username, saveService.loadOrCreateNew(account));
    }

    private String normalizeUsername(String username) {
        String value = username == null ? "" : username.trim().toLowerCase();

        if (!value.matches("[a-z0-9_]{3,32}")) {
            throw new IllegalArgumentException("Use 3-32 lowercase letters, numbers, or underscores.");
        }

        return value;
    }

    private String requirePassword(String password) {
        String value = password == null ? "" : password;

        if (value.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters.");
        }

        return value;
    }
}
