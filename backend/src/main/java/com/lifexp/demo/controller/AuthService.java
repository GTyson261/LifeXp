package com.lifexp.demo.controller;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.Instant;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {
    private static final long SESSION_TTL_MILLIS = 30L * 24 * 60 * 60 * 1000;

    private final UserAccountRepository userRepository;
    private final SaveService saveService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);
    private final Map<String, Session> sessions = new ConcurrentHashMap<>();

    public AuthService(UserAccountRepository userRepository, SaveService saveService) {
        this.userRepository = userRepository;
        this.saveService = saveService;
    }

    public synchronized AuthResponse register(AuthRequest request) {
        requireRequest(request);
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
        try {
            account = userRepository.save(account);
        } catch (DataIntegrityViolationException exception) {
            throw new IllegalArgumentException("Username is already taken.");
        }

        return createSession(account);
    }

    public AuthResponse login(AuthRequest request) {
        requireRequest(request);
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
        removeExpiredSessions();
        Session session = sessions.get(token);

        if (session == null || session.expiresAt < System.currentTimeMillis()) {
            sessions.remove(token);
            throw new IllegalArgumentException("Invalid or expired login token.");
        }

        return userRepository.findById(session.userId)
                .orElseThrow(() -> new IllegalArgumentException("User account no longer exists."));
    }

    public void logout(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return;
        }

        sessions.remove(authorizationHeader.substring("Bearer ".length()).trim());
    }

    private AuthResponse createSession(UserAccount account) {
        removeExpiredSessions();
        String token = UUID.randomUUID().toString();
        sessions.put(token, new Session(account.id, System.currentTimeMillis() + SESSION_TTL_MILLIS));
        return new AuthResponse(token, account.username, saveService.loadOrCreateNew(account));
    }

    private void removeExpiredSessions() {
        long now = System.currentTimeMillis();
        sessions.entrySet().removeIf(entry -> entry.getValue().expiresAt < now);
    }

    private record Session(long userId, long expiresAt) {}

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

        if (value.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new IllegalArgumentException("Password must be 72 bytes or fewer.");
        }

        return value;
    }

    private void requireRequest(AuthRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Username and password are required.");
        }
    }
}
