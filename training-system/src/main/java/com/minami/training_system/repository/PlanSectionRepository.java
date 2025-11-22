package com.minami.training_system.repository;

import com.minami.training_system.entity.PlanSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlanSectionRepository extends JpaRepository<PlanSection, Long> {
    List<PlanSection> findByPlanIdOrderBySortOrderAsc(Long planId);
}
