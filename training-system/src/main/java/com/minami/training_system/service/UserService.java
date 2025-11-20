package com.minami.training_system.service;

import com.minami.training_system.entity.User;
import com.minami.training_system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User register(User user) {
        if (userRepository.findByUserAccount(user.getUserAccount()).isPresent()) {
            throw new RuntimeException("Account already exists");
        }
        // In a real app, hash the password here!
        return userRepository.save(user);
    }

    public User login(String account, String password) {
        Optional<User> userOpt = userRepository.findByUserAccount(account);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getUserPassword().equals(password)) {
                return user;
            }
        }
        return null;
    }
}
