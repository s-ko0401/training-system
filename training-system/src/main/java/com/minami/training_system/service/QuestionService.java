package com.minami.training_system.service;

import com.minami.training_system.dto.QuestionFeedbackRequest;
import com.minami.training_system.dto.QuestionListResponse;
import com.minami.training_system.dto.QuestionRequest;
import com.minami.training_system.dto.QuestionResponse;
import com.minami.training_system.entity.Question;
import com.minami.training_system.entity.StudentAssignment;
import com.minami.training_system.entity.User;
import com.minami.training_system.repository.QuestionRepository;
import com.minami.training_system.repository.StudentAssignmentRepository;
import com.minami.training_system.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final StudentAssignmentRepository studentAssignmentRepository;

    public QuestionService(QuestionRepository questionRepository,
                           UserRepository userRepository,
                           StudentAssignmentRepository studentAssignmentRepository) {
        this.questionRepository = questionRepository;
        this.userRepository = userRepository;
        this.studentAssignmentRepository = studentAssignmentRepository;
    }

    public List<QuestionResponse> listMyQuestions(User student) {
        assertStudent(student);
        List<Question> questions = questionRepository.findByStudentUserIdOrderByDateDesc(student.getId());
        return toResponses(questions);
    }

    @Transactional
    public QuestionResponse createQuestion(User student, QuestionRequest request) {
        assertStudent(student);
        Question question = new Question();
        question.setStudentUserId(student.getId());
        question.setDate(request.getDate());
        question.setTitle(request.getTitle());
        question.setMemo(request.getMemo());
        Question saved = questionRepository.save(question);
        return toResponse(saved, Collections.emptyMap());
    }

    @Transactional
    public QuestionResponse updateQuestion(User student, Long questionId, QuestionRequest request) {
        assertStudent(student);
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new EntityNotFoundException("question not found"));
        if (!question.getStudentUserId().equals(student.getId())) {
            throw new IllegalArgumentException("cannot edit other student's question");
        }
        question.setDate(request.getDate());
        question.setTitle(request.getTitle());
        question.setMemo(request.getMemo());
        Question saved = questionRepository.save(question);
        return toResponse(saved, Collections.emptyMap());
    }

    public QuestionListResponse listQuestionsForStudent(User currentUser, Long studentId) {
        User student = loadStudent(studentId);
        assertCanViewStudent(currentUser, student.getId());

        List<Question> questions = questionRepository.findByStudentUserIdOrderByDateDesc(student.getId());
        List<QuestionResponse> responses = toResponses(questions);

        List<QuestionResponse> pending = responses.stream()
                .filter(q -> q.getFeedback() == null || q.getFeedback().isBlank())
                .toList();
        List<QuestionResponse> replied = responses.stream()
                .filter(q -> q.getFeedback() != null && !q.getFeedback().isBlank())
                .toList();

        return new QuestionListResponse(pending, replied);
    }

    @Transactional
    public QuestionResponse replyFeedback(User teacher, Long questionId, QuestionFeedbackRequest request) {
        assertTeacher(teacher);
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new EntityNotFoundException("question not found"));
        assertCanViewStudent(teacher, question.getStudentUserId());

        question.setFeedback(request.getFeedback());
        question.setTeacherUserId(teacher.getId());
        Question saved = questionRepository.save(question);
        Map<Long, User> teacherMap = Map.of(teacher.getId(), teacher);
        return toResponse(saved, teacherMap);
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
        throw new IllegalArgumentException("no permission to view this student's questions");
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

    private List<QuestionResponse> toResponses(List<Question> questions) {
        if (questions.isEmpty()) {
            return List.of();
        }

        Set<Long> teacherIds = questions.stream()
                .map(Question::getTeacherUserId)
                .filter(id -> id != null)
                .collect(Collectors.toSet());

        Map<Long, User> teacherMap = teacherIds.isEmpty()
                ? Collections.emptyMap()
                : userRepository.findAllById(teacherIds).stream()
                .collect(Collectors.toMap(User::getId, t -> t));

        return questions.stream()
                .map(question -> toResponse(question, teacherMap))
                .toList();
    }

    private QuestionResponse toResponse(Question question, Map<Long, User> teacherMap) {
        QuestionResponse response = new QuestionResponse();
        response.setId(question.getId());
        response.setStudentUserId(question.getStudentUserId());
        response.setDate(question.getDate());
        response.setTitle(question.getTitle());
        response.setMemo(question.getMemo());
        response.setFeedback(question.getFeedback());
        response.setTeacherUserId(question.getTeacherUserId());
        response.setCreatedAt(question.getCreatedAt());
        response.setUpdatedAt(question.getUpdatedAt());

        if (question.getTeacherUserId() != null) {
            User teacher = teacherMap.get(question.getTeacherUserId());
            if (teacher != null) {
                response.setTeacherName(teacher.getUserName());
            }
        }

        return response;
    }
}
