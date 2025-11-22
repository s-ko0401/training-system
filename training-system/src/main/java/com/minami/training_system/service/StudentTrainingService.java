package com.minami.training_system.service;

import com.minami.training_system.dto.AssignPlanRequest;
import com.minami.training_system.dto.StudentTrainingPlanResponse;
import com.minami.training_system.dto.StudentTrainingTaskResponse;
import com.minami.training_system.dto.TrainingStatsResponse;
import com.minami.training_system.dto.UpdateTrainingTaskRequest;
import com.minami.training_system.entity.Plan;
import com.minami.training_system.entity.PlanSection;
import com.minami.training_system.entity.PlanTodo;
import com.minami.training_system.entity.PlanTopic;
import com.minami.training_system.entity.StudentAssignment;
import com.minami.training_system.entity.StudentTrainingPlan;
import com.minami.training_system.entity.StudentTrainingTask;
import com.minami.training_system.entity.User;
import com.minami.training_system.repository.DailyReportRepository;
import com.minami.training_system.repository.PlanRepository;
import com.minami.training_system.repository.PlanSectionRepository;
import com.minami.training_system.repository.PlanTodoRepository;
import com.minami.training_system.repository.PlanTopicRepository;
import com.minami.training_system.repository.QuestionRepository;
import com.minami.training_system.repository.StudentAssignmentRepository;
import com.minami.training_system.repository.StudentTrainingPlanRepository;
import com.minami.training_system.repository.StudentTrainingTaskRepository;
import com.minami.training_system.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
public class StudentTrainingService {

    private final StudentTrainingPlanRepository studentTrainingPlanRepository;
    private final StudentTrainingTaskRepository studentTrainingTaskRepository;
    private final UserRepository userRepository;
    private final PlanRepository planRepository;
    private final PlanSectionRepository planSectionRepository;
    private final PlanTopicRepository planTopicRepository;
    private final PlanTodoRepository planTodoRepository;
    private final DailyReportRepository dailyReportRepository;
    private final QuestionRepository questionRepository;
    private final StudentAssignmentRepository studentAssignmentRepository;

    public StudentTrainingService(StudentTrainingPlanRepository studentTrainingPlanRepository,
            StudentTrainingTaskRepository studentTrainingTaskRepository,
            UserRepository userRepository,
            PlanRepository planRepository,
            PlanSectionRepository planSectionRepository,
            PlanTopicRepository planTopicRepository,
            PlanTodoRepository planTodoRepository,
            DailyReportRepository dailyReportRepository,
            QuestionRepository questionRepository,
            StudentAssignmentRepository studentAssignmentRepository) {
        this.studentTrainingPlanRepository = studentTrainingPlanRepository;
        this.studentTrainingTaskRepository = studentTrainingTaskRepository;
        this.userRepository = userRepository;
        this.planRepository = planRepository;
        this.planSectionRepository = planSectionRepository;
        this.planTopicRepository = planTopicRepository;
        this.planTodoRepository = planTodoRepository;
        this.dailyReportRepository = dailyReportRepository;
        this.questionRepository = questionRepository;
        this.studentAssignmentRepository = studentAssignmentRepository;
    }

    @Transactional
    public StudentTrainingPlanResponse assignPlan(User currentUser, AssignPlanRequest request) {
        assertManagerOrTeacher(currentUser);
        User student = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new EntityNotFoundException("student not found"));
        if (student.getRole() != 3) {
            throw new IllegalArgumentException("target user is not student");
        }
        Plan plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new EntityNotFoundException("plan not found"));

        studentTrainingPlanRepository.findByStudentIdAndPlanId(student.getId(), plan.getId())
                .ifPresent(existing -> {
                    throw new IllegalStateException("plan already assigned to this student");
                });

        StudentTrainingPlan trainingPlan = new StudentTrainingPlan();
        trainingPlan.setStudentId(student.getId());
        trainingPlan.setPlan(plan);
        trainingPlan.setStatus("未開始");
        trainingPlan.setAssignedAt(LocalDateTime.now());
        trainingPlan.setAssignedBy(currentUser.getId());

        StudentTrainingPlan savedPlan = studentTrainingPlanRepository.save(trainingPlan);

        List<PlanTodo> todos = fetchTodosForPlan(plan.getId());
        List<StudentTrainingTask> tasks = todos.stream()
                .map(todo -> {
                    StudentTrainingTask task = new StudentTrainingTask();
                    task.setStudentTrainingPlan(savedPlan);
                    task.setTodo(todo);
                    task.setStatus("未開始");
                    return task;
                })
                .toList();
        studentTrainingTaskRepository.saveAll(tasks);

        return buildPlanResponse(savedPlan);
    }

    @Transactional(readOnly = true)
    public List<StudentTrainingPlanResponse> listForStudent(User requester, Long studentId) {
        if (requester.getRole() == 3 && !requester.getId().equals(studentId)) {
            throw new IllegalArgumentException("students can only view their own plans");
        }
        if (requester.getRole() == 2 || requester.getRole() == 1) {
            // allowed
        } else if (requester.getRole() != 3) {
            throw new IllegalArgumentException("no permission");
        }

        return studentTrainingPlanRepository.findByStudentId(studentId).stream()
                .map(this::buildPlanResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<StudentTrainingPlanResponse> listMine(User student) {
        if (student.getRole() != 3) {
            throw new IllegalArgumentException("only students can view their own plans");
        }
        return studentTrainingPlanRepository.findByStudentId(student.getId()).stream()
                .map(this::buildPlanResponse)
                .toList();
    }

    @Transactional
    public StudentTrainingTaskResponse updateTask(User requester, Long taskId, UpdateTrainingTaskRequest request) {
        StudentTrainingTask task = studentTrainingTaskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("task not found"));
        StudentTrainingPlan plan = task.getStudentTrainingPlan();
        if (requester.getRole() == 3) {
            if (!plan.getStudentId().equals(requester.getId())) {
                throw new IllegalArgumentException("cannot update other student's task");
            }
        } else if (requester.getRole() != 2 && requester.getRole() != 1) {
            throw new IllegalArgumentException("no permission to update task");
        }

        task.setStatus(request.getStatus());
        task.setProgressNote(request.getProgressNote());
        task.setStartedAt(request.getStartedAt());
        task.setCompletedAt(request.getCompletedAt());
        StudentTrainingTask saved = studentTrainingTaskRepository.save(task);
        return buildTaskResponse(saved);
    }

    @Transactional
    public void deletePlan(User requester, Long planId) {
        assertManagerOrTeacher(requester);
        StudentTrainingPlan plan = studentTrainingPlanRepository.findById(planId)
                .orElseThrow(() -> new EntityNotFoundException("plan not found"));
        studentTrainingPlanRepository.delete(plan);
    }

    private void assertManagerOrTeacher(User user) {
        if (user.getRole() != 1 && user.getRole() != 2) {
            throw new IllegalArgumentException("no permission");
        }
    }

    private List<PlanTodo> fetchTodosForPlan(Long planId) {
        List<PlanSection> sections = planSectionRepository.findByPlanIdOrderBySortOrderAsc(planId);
        List<Long> sectionIds = sections.stream().map(PlanSection::getId).toList();
        List<PlanTopic> topics = sectionIds.isEmpty()
                ? List.of()
                : planTopicRepository.findBySectionIdIn(sectionIds);
        List<Long> topicIds = topics.stream().map(PlanTopic::getId).toList();
        List<PlanTodo> todos = topicIds.isEmpty()
                ? List.of()
                : planTodoRepository.findByTopicIdIn(topicIds);
        return todos.stream()
                .sorted(Comparator.comparing(PlanTodo::getDayIndex, Comparator.nullsLast(Integer::compareTo))
                        .thenComparing(PlanTodo::getSortOrder, Comparator.nullsLast(Integer::compareTo)))
                .toList();
    }

    private StudentTrainingPlanResponse buildPlanResponse(StudentTrainingPlan trainingPlan) {
        StudentTrainingPlanResponse response = new StudentTrainingPlanResponse();
        response.setId(trainingPlan.getId());
        response.setStudentId(trainingPlan.getStudentId());
        response.setPlanId(trainingPlan.getPlan().getId());
        response.setPlanName(trainingPlan.getPlan().getPlanName());
        response.setExpectedDays(trainingPlan.getPlan().getExpectedDays());
        response.setDescription(trainingPlan.getPlan().getDescription());
        response.setStatus(trainingPlan.getStatus());
        response.setAssignedAt(trainingPlan.getAssignedAt());
        response.setAssignedBy(trainingPlan.getAssignedBy());

        List<StudentTrainingTask> tasks = studentTrainingTaskRepository
                .findByStudentTrainingPlanId(trainingPlan.getId());

        List<StudentTrainingTaskResponse> taskResponses = tasks.stream()
                .map(this::toTaskResponse)
                .sorted(Comparator
                        .comparing(StudentTrainingTaskResponse::getDayIndex, Comparator.nullsLast(Integer::compareTo))
                        .thenComparing(StudentTrainingTaskResponse::getSectionSortOrder,
                                Comparator.nullsLast(Integer::compareTo))
                        .thenComparing(StudentTrainingTaskResponse::getTopicSortOrder,
                                Comparator.nullsLast(Integer::compareTo))
                        .thenComparing(StudentTrainingTaskResponse::getSortOrder,
                                Comparator.nullsLast(Integer::compareTo))
                        .thenComparing(StudentTrainingTaskResponse::getId))
                .toList();

        response.setTasks(taskResponses);
        return response;
    }

    private StudentTrainingTaskResponse buildTaskResponse(StudentTrainingTask task) {
        return toTaskResponse(task);
    }

    private StudentTrainingTaskResponse toTaskResponse(StudentTrainingTask task) {
        StudentTrainingTaskResponse response = new StudentTrainingTaskResponse();
        response.setId(task.getId());
        response.setTodoId(task.getTodo().getId());
        response.setTodoName(task.getTodo().getTodoName());
        PlanTopic topic = task.getTodo().getTopic();
        if (topic != null) {
            response.setTopicName(topic.getTopicName());
            response.setTopicSortOrder(topic.getSortOrder());
            PlanSection section = topic.getSection();
            if (section != null) {
                response.setSectionName(section.getSectionName());
                response.setSectionSortOrder(section.getSortOrder());
            }
        }
        response.setDayIndex(task.getTodo().getDayIndex());
        response.setSortOrder(task.getTodo().getSortOrder());
        response.setStatus(task.getStatus());
        response.setProgressNote(task.getProgressNote());
        response.setStartedAt(task.getStartedAt());
        response.setCompletedAt(task.getCompletedAt());
        return response;
    }

    public TrainingStatsResponse getTrainingStats(User requester) {
        assertManagerOrTeacher(requester);

        TrainingStatsResponse stats = new TrainingStatsResponse();

        if (requester.getRole() == 2) {
            // Teacher: Get stats for assigned students only
            List<StudentAssignment> assignments = studentAssignmentRepository.findByTeacherUserId(requester.getId());
            List<Long> studentIds = assignments.stream()
                    .map(StudentAssignment::getStudentUserId)
                    .toList();

            if (studentIds.isEmpty()) {
                stats.setUnrepliedReportsCount(0);
                stats.setUnrepliedQuestionsCount(0);
                stats.setStudentsInTrainingCount(0);
                stats.setStudentsCompletedCount(0);
            } else {
                stats.setUnrepliedReportsCount(
                        (int) dailyReportRepository.countByStudentUserIdInAndFeedbackIsNull(studentIds));
                stats.setUnrepliedQuestionsCount(
                        (int) questionRepository.countByStudentUserIdInAndFeedbackIsNull(studentIds));

                List<User> students = userRepository.findAllById(studentIds);
                long trainingCount = students.stream()
                        .filter(u -> "研修中".equals(u.getTrainingStatus()))
                        .count();
                long completedCount = students.stream()
                        .filter(u -> "研修終了".equals(u.getTrainingStatus()))
                        .count();

                stats.setStudentsInTrainingCount((int) trainingCount);
                stats.setStudentsCompletedCount((int) completedCount);
            }
        } else {
            // Admin: Get stats for all students
            stats.setUnrepliedReportsCount((int) dailyReportRepository.countByFeedbackIsNull());
            stats.setUnrepliedQuestionsCount((int) questionRepository.countByFeedbackIsNull());

            List<User> allStudents = userRepository.findByRole(3);
            long trainingCount = allStudents.stream()
                    .filter(u -> "研修中".equals(u.getTrainingStatus()))
                    .count();
            long completedCount = allStudents.stream()
                    .filter(u -> "研修終了".equals(u.getTrainingStatus()))
                    .count();

            stats.setStudentsInTrainingCount((int) trainingCount);
            stats.setStudentsCompletedCount((int) completedCount);
        }

        return stats;
    }
}
