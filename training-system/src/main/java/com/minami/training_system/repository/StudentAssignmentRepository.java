package com.minami.training_system.repository;

import com.minami.training_system.entity.StudentAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentAssignmentRepository extends JpaRepository<StudentAssignment, Long> {
    Optional<StudentAssignment> findByStudentUserId(Long studentUserId);

    List<StudentAssignment> findByTeacherUserId(Long teacherUserId);

    List<StudentAssignment> findByStudentUserIdIn(List<Long> studentUserIds);

    long countByTeacherUserId(Long teacherUserId);
}
