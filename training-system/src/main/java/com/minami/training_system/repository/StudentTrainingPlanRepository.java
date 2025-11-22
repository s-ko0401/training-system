package com.minami.training_system.repository;

import com.minami.training_system.entity.StudentTrainingPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentTrainingPlanRepository extends JpaRepository<StudentTrainingPlan, Long> {
    List<StudentTrainingPlan> findByStudentId(Long studentId);
    Optional<StudentTrainingPlan> findByStudentIdAndPlanId(Long studentId, Long planId);
}
