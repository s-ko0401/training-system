package com.minami.training_system.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "app_user") // 'user' is a reserved keyword in Postgres
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userName;

    @Column(nullable = false, unique = true)
    private String userAccount;

    @Column(nullable = false)
    private String userPassword;

    @Column(nullable = false)
    private String userRole; // ADMIN, USER

    public User() {
    }

    public User(String userName, String userAccount, String userPassword, String userRole) {
        this.userName = userName;
        this.userAccount = userAccount;
        this.userPassword = userPassword;
        this.userRole = userRole;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserAccount() {
        return userAccount;
    }

    public void setUserAccount(String userAccount) {
        this.userAccount = userAccount;
    }

    public String getUserPassword() {
        return userPassword;
    }

    public void setUserPassword(String userPassword) {
        this.userPassword = userPassword;
    }

    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }
}
