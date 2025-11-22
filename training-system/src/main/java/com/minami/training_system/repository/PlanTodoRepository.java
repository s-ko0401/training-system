package com.minami.training_system.repository;

import com.minami.training_system.entity.PlanTodo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlanTodoRepository extends JpaRepository<PlanTodo, Long> {
    List<PlanTodo> findByTopicIdOrderByDayIndexAscSortOrderAsc(Long topicId);
    List<PlanTodo> findByTopicIdIn(List<Long> topicIds);
}
