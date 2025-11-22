package com.minami.training_system.repository;

import com.minami.training_system.entity.DailyReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DailyReportRepository extends JpaRepository<DailyReport, Long> {
    List<DailyReport> findByStudentUserIdOrderByDateDesc(Long studentUserId);

    // Count unreplied reports for specific students
    long countByStudentUserIdInAndFeedbackIsNull(List<Long> studentIds);

    // Count all unreplied reports
    long countByFeedbackIsNull();
}
