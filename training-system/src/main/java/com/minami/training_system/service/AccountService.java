package com.minami.training_system.service;

import com.minami.training_system.dto.AccountResponse;
import com.minami.training_system.dto.AccountSummaryResponse;
import com.minami.training_system.entity.StudentAssignment;
import com.minami.training_system.entity.StudentTrainingPlan;
import com.minami.training_system.entity.StudentTrainingTask;
import com.minami.training_system.entity.User;
import com.minami.training_system.repository.StudentAssignmentRepository;
import com.minami.training_system.repository.StudentTrainingPlanRepository;
import com.minami.training_system.repository.StudentTrainingTaskRepository;
import com.minami.training_system.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AccountService {

    private final UserRepository userRepository;
    private final StudentAssignmentRepository studentAssignmentRepository;
    private final StudentTrainingPlanRepository studentTrainingPlanRepository;
    private final StudentTrainingTaskRepository studentTrainingTaskRepository;

    public AccountService(UserRepository userRepository,
            StudentAssignmentRepository studentAssignmentRepository,
            StudentTrainingPlanRepository studentTrainingPlanRepository,
            StudentTrainingTaskRepository studentTrainingTaskRepository) {
        this.userRepository = userRepository;
        this.studentAssignmentRepository = studentAssignmentRepository;
        this.studentTrainingPlanRepository = studentTrainingPlanRepository;
        this.studentTrainingTaskRepository = studentTrainingTaskRepository;
    }

    public AccountSummaryResponse buildSummary(User currentUser) {
        AccountSummaryResponse response = new AccountSummaryResponse();
        if (currentUser.getRole() == 1) {
            response.setAdminCount(userRepository.countByRole(1));
            response.setTeacherCount(userRepository.countByRole(2));
            response.setStudentCount(userRepository.countByRole(3));
            response.setActiveCount(userRepository.countByFlag(0));
            response.setCompletedCount(userRepository.countByFlag(9));
        } else if (currentUser.getRole() == 2) {
            List<User> students = getStudentsForTeacher(currentUser.getId());
            long active = students.stream().filter(u -> u.getFlag() == 0).count();
            long completed = students.stream().filter(u -> u.getFlag() != 0).count();
            response.setStudentCount(students.size());
            response.setActiveCount(active);
            response.setCompletedCount(completed);
        }
        return response;
    }

    public List<AccountResponse> listAccounts(User currentUser) {
        if (currentUser.getRole() == 1) {
            List<User> users = userRepository.findAll();
            return toAccountResponses(users, Collections.emptyMap());
        } else if (currentUser.getRole() == 2) {
            List<User> students = getStudentsForTeacher(currentUser.getId());
            Map<Long, User> teacherMap = Map.of(currentUser.getId(), currentUser);
            return toAccountResponses(students, teacherMap);
        }
        return List.of();
    }

    private List<User> getStudentsForTeacher(Long teacherId) {
        List<StudentAssignment> assignments = studentAssignmentRepository.findByTeacherUserId(teacherId);
        if (assignments.isEmpty()) {
            return List.of();
        }
        List<Long> studentIds = assignments.stream()
                .map(StudentAssignment::getStudentUserId)
                .toList();
        return userRepository.findAllById(studentIds);
    }

    private List<AccountResponse> toAccountResponses(List<User> users, Map<Long, User> presetTeacherMap) {
        if (users.isEmpty()) {
            return List.of();
        }

        List<Long> studentIds = users.stream()
                .filter(u -> u.getRole() == 3)
                .map(User::getId)
                .toList();

        Map<Long, Long> studentToTeacher = studentIds.isEmpty()
                ? Collections.emptyMap()
                : studentAssignmentRepository.findByStudentUserIdIn(studentIds)
                        .stream()
                        .collect(Collectors.toMap(StudentAssignment::getStudentUserId,
                                StudentAssignment::getTeacherUserId));

        Set<Long> teacherIds = studentToTeacher.values().stream()
                .filter(id -> !presetTeacherMap.containsKey(id))
                .collect(Collectors.toSet());

        Map<Long, User> teacherMap = teacherIds.isEmpty()
                ? presetTeacherMap
                : mergeTeacherMaps(presetTeacherMap, userRepository.findAllById(teacherIds).stream()
                        .collect(Collectors.toMap(User::getId, t -> t)));

        return users.stream()
                .map(user -> buildAccountResponse(user, studentToTeacher, teacherMap))
                .collect(Collectors.toList());
    }

    private Map<Long, User> mergeTeacherMaps(Map<Long, User> preset, Map<Long, User> loaded) {
        if (preset.isEmpty()) {
            return loaded;
        }
        if (loaded.isEmpty()) {
            return preset;
        }
        java.util.HashMap<Long, User> result = new java.util.HashMap<>(preset);
        result.putAll(loaded);
        return result;
    }

    private AccountResponse buildAccountResponse(User user,
            Map<Long, Long> studentToTeacher,
            Map<Long, User> teacherMap) {
        AccountResponse response = new AccountResponse();
        response.setId(user.getId());
        response.setUserId(user.getUserId());
        response.setUserName(user.getUserName());
        response.setUserEmail(user.getUserEmail());
        response.setRole(user.getRole());
        response.setFlag(user.getFlag());
        response.setTrainingStatus(user.getTrainingStatus());

        if (user.getRole() == 3) {
            Long teacherId = studentToTeacher.get(user.getId());
            response.setTeacherId(teacherId);
            if (teacherId != null) {
                User teacher = teacherMap.get(teacherId);
                if (teacher != null) {
                    response.setTeacherName(teacher.getUserName());
                    response.setTeacherEmail(teacher.getUserEmail());
                }
            }

            // Calculate progress from training plans
            response.setProgress(calculateStudentProgress(user.getId()));
        }

        return response;
    }

    private Integer calculateStudentProgress(Long studentId) {
        List<StudentTrainingPlan> plans = studentTrainingPlanRepository.findByStudentId(studentId);
        if (plans.isEmpty()) {
            return 0;
        }

        int totalProgress = 0;
        for (StudentTrainingPlan plan : plans) {
            List<StudentTrainingTask> tasks = studentTrainingTaskRepository.findByStudentTrainingPlanId(plan.getId());
            if (tasks.isEmpty()) {
                continue;
            }
            long completedTasks = tasks.stream()
                    .filter(t -> "完了".equals(t.getStatus()))
                    .count();
            totalProgress += (int) ((completedTasks * 100.0) / tasks.size());
        }

        return totalProgress / plans.size();
    }
}
