package com.minami.training_system.controller;

import com.minami.training_system.dto.AuthResponse;
import com.minami.training_system.dto.LoginRequest;
import com.minami.training_system.dto.RegisterRequest;
import com.minami.training_system.entity.User;
import com.minami.training_system.security.CustomUserDetails;
import com.minami.training_system.security.JwtService;
import com.minami.training_system.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;

    public AuthController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            User user = userService.register(request);
            String token = buildToken(user);
            AuthResponse response = toAuthResponse("登録が完了しました。", token, user);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "登録処理でエラーが発生しました。"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            User user = userService.login(request);
            String token = buildToken(user);
            AuthResponse response = toAuthResponse("ログインに成功しました。", token, user);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "ログイン処理でエラーが発生しました。"));
        }
    }

    private String buildToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole());
        claims.put("userId", user.getUserId());
        claims.put("id", user.getId());
        return jwtService.generateToken(new CustomUserDetails(user), claims);
    }

    private AuthResponse toAuthResponse(String message, String token, User user) {
        Long teacherId = null;
        if (user.getRole() == 3) {
            teacherId = userService.findTeacherIdForStudent(user.getId());
        }
        return new AuthResponse(
                message,
                token,
                user.getId(),
                user.getUserId(),
                user.getUserName(),
                user.getUserEmail(),
                user.getRole(),
                teacherId
        );
    }
}
