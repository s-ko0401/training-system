package com.minami.training_system.repository;

import com.minami.training_system.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByStudentUserIdOrderByDateDesc(Long studentUserId);

    // Count unanswered questions for specific students
    long countByStudentUserIdInAndFeedbackIsNull(List<Long> studentIds);

    // Count all unanswered questions
    long countByFeedbackIsNull();
}
