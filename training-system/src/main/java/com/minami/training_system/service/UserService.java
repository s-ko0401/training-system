package com.minami.training_system.service;

import com.minami.training_system.dto.LoginRequest;
import com.minami.training_system.dto.RegisterRequest;
import com.minami.training_system.entity.StudentAssignment;
import com.minami.training_system.entity.User;
import com.minami.training_system.repository.StudentAssignmentRepository;
import com.minami.training_system.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final StudentAssignmentRepository studentAssignmentRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
            StudentAssignmentRepository studentAssignmentRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.studentAssignmentRepository = studentAssignmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User register(RegisterRequest request) {
        if (userRepository.existsByUserEmail(request.getUserEmail())) {
            throw new IllegalArgumentException("このメールアドレスは既に登録されています。");
        }

        if (request.getRole() == 3) {
            if (request.getTeacherUserId() == null) {
                throw new IllegalArgumentException("学生の担当教師を選択してください。");
            }
            userRepository.findById(request.getTeacherUserId())
                    .filter(t -> t.getRole() == 2)
                    .orElseThrow(() -> new IllegalArgumentException("選択した担当教師が存在しません。"));
        }

        User user = new User();
        user.setUserId(request.getUserId());
        user.setUserName(request.getUserName());
        user.setUserEmail(request.getUserEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setFlag(0);

        User saved = userRepository.save(user);

        if (request.getRole() == 3) {
            StudentAssignment assignment = new StudentAssignment();
            assignment.setStudentUserId(saved.getId());
            assignment.setTeacherUserId(request.getTeacherUserId());
            studentAssignmentRepository.save(assignment);
        }

        return saved;
    }

    public User login(LoginRequest request) {
        User user = userRepository.findByUserEmail(request.getUserEmail())
                .orElseThrow(() -> new IllegalArgumentException("メールアドレスまたはパスワードが正しくありません。"));

        if (user.getFlag() != 0) {
            throw new IllegalStateException("このアカウントは利用できません。管理者にお問い合わせください。");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("メールアドレスまたはパスワードが正しくありません。");
        }

        return user;
    }

    public List<User> findTeachers() {
        return userRepository.findByRole(2);
    }

    public Long findTeacherIdForStudent(Long studentUserId) {
        return studentAssignmentRepository.findByStudentUserId(studentUserId)
                .map(StudentAssignment::getTeacherUserId)
                .orElse(null);
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("指定されたユーザーが見つかりません。"));
    }

    @Transactional
    public User save(User user) {
        return userRepository.save(user);
    }
}
