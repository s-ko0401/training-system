package com.minami.training_system.service;

import com.minami.training_system.dto.DailyReportFeedbackRequest;
import com.minami.training_system.dto.DailyReportListResponse;
import com.minami.training_system.dto.DailyReportRequest;
import com.minami.training_system.dto.DailyReportResponse;
import com.minami.training_system.entity.DailyReport;
import com.minami.training_system.entity.StudentAssignment;
import com.minami.training_system.entity.User;
import com.minami.training_system.repository.DailyReportRepository;
import com.minami.training_system.repository.StudentAssignmentRepository;
import com.minami.training_system.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DailyReportService {

    private final DailyReportRepository dailyReportRepository;
    private final UserRepository userRepository;
    private final StudentAssignmentRepository studentAssignmentRepository;

    public DailyReportService(DailyReportRepository dailyReportRepository,
                              UserRepository userRepository,
                              StudentAssignmentRepository studentAssignmentRepository) {
        this.dailyReportRepository = dailyReportRepository;
        this.userRepository = userRepository;
        this.studentAssignmentRepository = studentAssignmentRepository;
    }

    public List<DailyReportResponse> listMyReports(User student) {
        assertStudent(student);
        List<DailyReport> reports = dailyReportRepository.findByStudentUserIdOrderByDateDesc(student.getId());
        return toResponses(reports);
    }

    @Transactional
    public DailyReportResponse createReport(User student, DailyReportRequest request) {
        assertStudent(student);

        DailyReport report = new DailyReport();
        report.setStudentUserId(student.getId());
        applyStudentFields(report, request);

        DailyReport saved = dailyReportRepository.save(report);
        return toResponse(saved, Collections.emptyMap());
    }

    @Transactional
    public DailyReportResponse updateReport(User student, Long reportId, DailyReportRequest request) {
        assertStudent(student);
        DailyReport report = dailyReportRepository.findById(reportId)
                .orElseThrow(() -> new EntityNotFoundException("daily report not found"));

        if (!report.getStudentUserId().equals(student.getId())) {
            throw new IllegalArgumentException("cannot edit other student's daily report");
        }

        applyStudentFields(report, request);
        DailyReport saved = dailyReportRepository.save(report);
        return toResponse(saved, Collections.emptyMap());
    }

    public DailyReportListResponse listReportsForStudent(User currentUser, Long studentId) {
        User student = loadStudent(studentId);
        assertCanViewStudent(currentUser, student.getId());

        List<DailyReport> reports = dailyReportRepository.findByStudentUserIdOrderByDateDesc(student.getId());
        List<DailyReportResponse> responses = toResponses(reports);

        List<DailyReportResponse> pending = responses.stream()
                .filter(r -> r.getFeedback() == null || r.getFeedback().isBlank())
                .toList();
        List<DailyReportResponse> replied = responses.stream()
                .filter(r -> r.getFeedback() != null && !r.getFeedback().isBlank())
                .toList();

        return new DailyReportListResponse(pending, replied);
    }

    @Transactional
    public DailyReportResponse replyFeedback(User teacher, Long reportId, DailyReportFeedbackRequest request) {
        assertTeacher(teacher);

        DailyReport report = dailyReportRepository.findById(reportId)
                .orElseThrow(() -> new EntityNotFoundException("daily report not found"));

        assertCanViewStudent(teacher, report.getStudentUserId());

        report.setFeedback(request.getFeedback());
        report.setTeacherUserId(teacher.getId());
        DailyReport saved = dailyReportRepository.save(report);

        Map<Long, User> teacherMap = Map.of(teacher.getId(), teacher);
        return toResponse(saved, teacherMap);
    }

    private void applyStudentFields(DailyReport report, DailyReportRequest request) {
        report.setDate(request.getDate());
        report.setTitle(request.getTitle());
        report.setMemo(request.getMemo());
        report.setFlag(normalizeFlag(request.getFlag()));
    }

    private Integer normalizeFlag(Integer flag) {
        if (flag == null) {
            return 1;
        }
        return flag == 0 ? 0 : 1;
    }

    private User loadStudent(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("student not found"));
        if (student.getRole() != 3) {
            throw new IllegalArgumentException("user is not a student");
        }
        return student;
    }

    private void assertCanViewStudent(User currentUser, Long studentId) {
        if (currentUser.getRole() == 1) {
            return;
        }
        if (currentUser.getRole() == 3 && currentUser.getId().equals(studentId)) {
            return;
        }
        if (currentUser.getRole() == 2) {
            boolean assigned = studentAssignmentRepository.findByStudentUserId(studentId)
                    .map(StudentAssignment::getTeacherUserId)
                    .filter(id -> id.equals(currentUser.getId()))
                    .isPresent();
            if (assigned) {
                return;
            }
        }
        throw new IllegalArgumentException("no permission to view this student's daily reports");
    }

    private void assertStudent(User user) {
        if (user.getRole() != 3) {
            throw new IllegalArgumentException("only students can perform this action");
        }
    }

    private void assertTeacher(User user) {
        if (user.getRole() != 2) {
            throw new IllegalArgumentException("only teachers can perform this action");
        }
    }

    private List<DailyReportResponse> toResponses(List<DailyReport> reports) {
        if (reports.isEmpty()) {
            return List.of();
        }

        Set<Long> teacherIds = reports.stream()
                .map(DailyReport::getTeacherUserId)
                .filter(id -> id != null)
                .collect(Collectors.toSet());

        Map<Long, User> teacherMap = teacherIds.isEmpty()
                ? Collections.emptyMap()
                : userRepository.findAllById(teacherIds).stream()
                .collect(Collectors.toMap(User::getId, t -> t));

        return reports.stream()
                .map(report -> toResponse(report, teacherMap))
                .collect(Collectors.toList());
    }

    private DailyReportResponse toResponse(DailyReport report, Map<Long, User> teacherMap) {
        DailyReportResponse response = new DailyReportResponse();
        response.setId(report.getId());
        response.setStudentUserId(report.getStudentUserId());
        response.setDate(report.getDate());
        response.setTitle(report.getTitle());
        response.setMemo(report.getMemo());
        response.setFeedback(report.getFeedback());
        response.setTeacherUserId(report.getTeacherUserId());
        response.setFlag(report.getFlag());
        response.setCreatedAt(report.getCreatedAt());
        response.setUpdatedAt(report.getUpdatedAt());

        if (report.getTeacherUserId() != null) {
            User teacher = teacherMap.get(report.getTeacherUserId());
            if (teacher != null) {
                response.setTeacherName(teacher.getUserName());
            }
        }

        return response;
    }
}
