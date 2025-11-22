package com.minami.training_system.repository;

import com.minami.training_system.entity.PlanTopic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlanTopicRepository extends JpaRepository<PlanTopic, Long> {
    List<PlanTopic> findBySectionIdOrderBySortOrderAsc(Long sectionId);
    List<PlanTopic> findBySectionIdIn(List<Long> sectionIds);
}
