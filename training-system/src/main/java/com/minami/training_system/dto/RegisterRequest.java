package com.minami.training_system.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @Size(max = 50, message = "ユーザーIDは50文字以内にしてください。")
    private String userId;

    @NotBlank(message = "氏名は必須です。")
    @Size(max = 100, message = "氏名は100文字以内にしてください。")
    private String userName;

    @NotBlank(message = "メールアドレスは必須です。")
    @Email(message = "メールアドレスの形式が正しくありません。")
    @Size(max = 255, message = "メールアドレスは255文字以内にしてください。")
    private String userEmail;

    @NotBlank(message = "パスワードは必須です。")
    @Size(min = 8, message = "パスワードは8文字以上で入力してください。")
    private String password;

    @NotNull(message = "権限は必ず選択してください。")
    private Integer role; // 1:管理者, 2:教師, 3:学生

    private Long teacherUserId; // 学生のみ指定

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Integer getRole() {
        return role;
    }

    public void setRole(Integer role) {
        this.role = role;
    }

    public Long getTeacherUserId() {
        return teacherUserId;
    }

    public void setTeacherUserId(Long teacherUserId) {
        this.teacherUserId = teacherUserId;
    }
}
