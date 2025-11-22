package com.minami.training_system.repository;

import com.minami.training_system.entity.StudentTrainingTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentTrainingTaskRepository extends JpaRepository<StudentTrainingTask, Long> {
    List<StudentTrainingTask> findByStudentTrainingPlanId(Long studentTrainingPlanId);
}
