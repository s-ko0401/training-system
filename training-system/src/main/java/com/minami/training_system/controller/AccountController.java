package com.minami.training_system.controller;

import com.minami.training_system.dto.AccountResponse;
import com.minami.training_system.dto.AccountSummaryResponse;
import com.minami.training_system.dto.RegisterRequest;
import com.minami.training_system.entity.User;
import com.minami.training_system.security.CustomUserDetails;
import com.minami.training_system.service.AccountService;
import com.minami.training_system.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "http://localhost:5173")
public class AccountController {

    private final AccountService accountService;
    private final UserService userService;

    public AccountController(AccountService accountService, UserService userService) {
        this.accountService = accountService;
        this.userService = userService;
    }

    @GetMapping("/summary")
    public ResponseEntity<?> summary() {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != 1 && currentUser.getRole() != 2) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "この操作を行う権限がありません。"));
        }
        AccountSummaryResponse summary = accountService.buildSummary(currentUser);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/list")
    public ResponseEntity<?> list() {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != 1 && currentUser.getRole() != 2) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "この操作を行う権限がありません。"));
        }
        List<AccountResponse> accounts = accountService.listAccounts(currentUser);
        return ResponseEntity.ok(accounts);
    }

    @PostMapping
    public ResponseEntity<?> createAccount(@Valid @RequestBody RegisterRequest request) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != 1 && currentUser.getRole() != 2) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "この操作を行う権限がありません。"));
        }

        if (currentUser.getRole() == 2) {
            if (request.getRole() != 3) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "教師は研修生のみ追加できます。"));
            }
            request.setTeacherUserId(currentUser.getId());
        }

        try {
            User created = userService.register(request);
            return ResponseEntity.ok(Map.of(
                    "message", "アカウントを作成しました。",
                    "id", created.getId()));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "アカウント作成中にエラーが発生しました。"));
        }
    }

    @PutMapping("/{userId}/training-status")
    public ResponseEntity<?> updateTrainingStatus(@PathVariable Long userId, @RequestBody Map<String, String> body) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != 1 && currentUser.getRole() != 2) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "この操作を行う権限がありません。"));
        }

        String trainingStatus = body.get("trainingStatus");
        if (trainingStatus == null || trainingStatus.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "trainingStatusが必要です。"));
        }

        try {
            User user = userService.findById(userId);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "ユーザーが見つかりません。"));
            }

            user.setTrainingStatus(trainingStatus);
            userService.save(user);

            return ResponseEntity.ok(Map.of("message", "研修ステータスを更新しました。"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "ステータス更新中にエラーが発生しました。"));
        }
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
            Long id = userDetails.getUser().getId();
            return userService.findById(id);
        }
        throw new IllegalStateException("ユーザー情報を取得できません。");
    }
}
