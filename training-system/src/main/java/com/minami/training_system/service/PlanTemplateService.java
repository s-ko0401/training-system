package com.minami.training_system.service;

import com.minami.training_system.dto.PlanRequest;
import com.minami.training_system.dto.PlanSectionRequest;
import com.minami.training_system.dto.PlanSectionResponse;
import com.minami.training_system.dto.PlanTemplateResponse;
import com.minami.training_system.dto.PlanTodoRequest;
import com.minami.training_system.dto.PlanTodoResponse;
import com.minami.training_system.dto.PlanTopicRequest;
import com.minami.training_system.dto.PlanTopicResponse;
import com.minami.training_system.entity.Plan;
import com.minami.training_system.entity.PlanSection;
import com.minami.training_system.entity.PlanTodo;
import com.minami.training_system.entity.PlanTopic;
import com.minami.training_system.repository.PlanRepository;
import com.minami.training_system.repository.PlanSectionRepository;
import com.minami.training_system.repository.PlanTodoRepository;
import com.minami.training_system.repository.PlanTopicRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PlanTemplateService {

    private final PlanRepository planRepository;
    private final PlanSectionRepository planSectionRepository;
    private final PlanTopicRepository planTopicRepository;
    private final PlanTodoRepository planTodoRepository;

    public PlanTemplateService(PlanRepository planRepository,
                               PlanSectionRepository planSectionRepository,
                               PlanTopicRepository planTopicRepository,
                               PlanTodoRepository planTodoRepository) {
        this.planRepository = planRepository;
        this.planSectionRepository = planSectionRepository;
        this.planTopicRepository = planTopicRepository;
        this.planTodoRepository = planTodoRepository;
    }

    public List<PlanTemplateResponse> listTemplates() {
        return planRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public PlanTemplateResponse createPlan(PlanRequest request) {
        Plan plan = new Plan();
        plan.setPlanName(request.getPlanName());
        plan.setExpectedDays(request.getExpectedDays());
        plan.setDescription(request.getDescription());
        Plan saved = planRepository.save(plan);
        return toResponse(saved);
    }

    @Transactional
    public PlanTemplateResponse updatePlan(Long planId, PlanRequest request) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new EntityNotFoundException("plan not found"));
        plan.setPlanName(request.getPlanName());
        plan.setExpectedDays(request.getExpectedDays());
        plan.setDescription(request.getDescription());
        return toResponse(planRepository.save(plan));
    }

    @Transactional
    public void deletePlan(Long planId) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new EntityNotFoundException("plan not found"));
        planRepository.delete(plan);
    }

    @Transactional
    public PlanSectionResponse addSection(PlanSectionRequest request) {
        Plan plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new EntityNotFoundException("plan not found"));
        PlanSection section = new PlanSection();
        section.setPlan(plan);
        section.setSectionName(request.getSectionName());
        section.setExpectedDays(request.getExpectedDays());
        section.setSortOrder(request.getSortOrder());
        PlanSection saved = planSectionRepository.save(section);
        return toSectionResponse(saved);
    }

    @Transactional
    public PlanSectionResponse updateSection(Long sectionId, PlanSectionRequest request) {
        PlanSection section = planSectionRepository.findById(sectionId)
                .orElseThrow(() -> new EntityNotFoundException("section not found"));
        if (request.getPlanId() != null && !request.getPlanId().equals(section.getPlan().getId())) {
            Plan plan = planRepository.findById(request.getPlanId())
                    .orElseThrow(() -> new EntityNotFoundException("plan not found"));
            section.setPlan(plan);
        }
        section.setSectionName(request.getSectionName());
        section.setExpectedDays(request.getExpectedDays());
        section.setSortOrder(request.getSortOrder());
        return toSectionResponse(planSectionRepository.save(section));
    }

    @Transactional
    public void deleteSection(Long sectionId) {
        PlanSection section = planSectionRepository.findById(sectionId)
                .orElseThrow(() -> new EntityNotFoundException("section not found"));
        planSectionRepository.delete(section);
    }

    @Transactional
    public PlanTopicResponse addTopic(PlanTopicRequest request) {
        PlanSection section = planSectionRepository.findById(request.getSectionId())
                .orElseThrow(() -> new EntityNotFoundException("section not found"));
        PlanTopic topic = new PlanTopic();
        topic.setSection(section);
        topic.setTopicName(request.getTopicName());
        topic.setSortOrder(request.getSortOrder());
        PlanTopic saved = planTopicRepository.save(topic);
        return toTopicResponse(saved);
    }

    @Transactional
    public PlanTopicResponse updateTopic(Long topicId, PlanTopicRequest request) {
        PlanTopic topic = planTopicRepository.findById(topicId)
                .orElseThrow(() -> new EntityNotFoundException("topic not found"));
        if (request.getSectionId() != null && !request.getSectionId().equals(topic.getSection().getId())) {
            PlanSection section = planSectionRepository.findById(request.getSectionId())
                    .orElseThrow(() -> new EntityNotFoundException("section not found"));
            topic.setSection(section);
        }
        topic.setTopicName(request.getTopicName());
        topic.setSortOrder(request.getSortOrder());
        return toTopicResponse(planTopicRepository.save(topic));
    }

    @Transactional
    public void deleteTopic(Long topicId) {
        PlanTopic topic = planTopicRepository.findById(topicId)
                .orElseThrow(() -> new EntityNotFoundException("topic not found"));
        planTopicRepository.delete(topic);
    }

    @Transactional
    public PlanTodoResponse addTodo(PlanTodoRequest request) {
        PlanTopic topic = planTopicRepository.findById(request.getTopicId())
                .orElseThrow(() -> new EntityNotFoundException("topic not found"));
        PlanTodo todo = new PlanTodo();
        todo.setTopic(topic);
        todo.setTodoName(request.getTodoName());
        todo.setDayIndex(request.getDayIndex());
        todo.setSortOrder(request.getSortOrder());
        PlanTodo saved = planTodoRepository.save(todo);
        return toTodoResponse(saved);
    }

    @Transactional
    public PlanTodoResponse updateTodo(Long todoId, PlanTodoRequest request) {
        PlanTodo todo = planTodoRepository.findById(todoId)
                .orElseThrow(() -> new EntityNotFoundException("todo not found"));
        if (request.getTopicId() != null && !request.getTopicId().equals(todo.getTopic().getId())) {
            PlanTopic topic = planTopicRepository.findById(request.getTopicId())
                    .orElseThrow(() -> new EntityNotFoundException("topic not found"));
            todo.setTopic(topic);
        }
        todo.setTodoName(request.getTodoName());
        todo.setDayIndex(request.getDayIndex());
        todo.setSortOrder(request.getSortOrder());
        return toTodoResponse(planTodoRepository.save(todo));
    }

    @Transactional
    public void deleteTodo(Long todoId) {
        PlanTodo todo = planTodoRepository.findById(todoId)
                .orElseThrow(() -> new EntityNotFoundException("todo not found"));
        planTodoRepository.delete(todo);
    }

    private PlanTemplateResponse toResponse(Plan plan) {
        PlanTemplateResponse response = new PlanTemplateResponse();
        response.setId(plan.getId());
        response.setPlanName(plan.getPlanName());
        response.setExpectedDays(plan.getExpectedDays());
        response.setDescription(plan.getDescription());
        List<PlanSectionResponse> sectionResponses = planSectionRepository.findByPlanIdOrderBySortOrderAsc(plan.getId())
                .stream()
                .map(this::toSectionResponse)
                .toList();
        response.setSections(sectionResponses);
        return response;
    }

    private PlanSectionResponse toSectionResponse(PlanSection section) {
        PlanSectionResponse response = new PlanSectionResponse();
        response.setId(section.getId());
        response.setPlanId(section.getPlan().getId());
        response.setSectionName(section.getSectionName());
        response.setExpectedDays(section.getExpectedDays());
        response.setSortOrder(section.getSortOrder());
        List<PlanTopicResponse> topics = planTopicRepository.findBySectionIdOrderBySortOrderAsc(section.getId())
                .stream()
                .map(this::toTopicResponse)
                .toList();
        response.setTopics(topics);
        return response;
    }

    private PlanTopicResponse toTopicResponse(PlanTopic topic) {
        PlanTopicResponse response = new PlanTopicResponse();
        response.setId(topic.getId());
        response.setSectionId(topic.getSection().getId());
        response.setTopicName(topic.getTopicName());
        response.setSortOrder(topic.getSortOrder());
        List<PlanTodoResponse> todos = planTodoRepository.findByTopicIdOrderByDayIndexAscSortOrderAsc(topic.getId())
                .stream()
                .map(this::toTodoResponse)
                .toList();
        response.setTodos(todos);
        return response;
    }

    private PlanTodoResponse toTodoResponse(PlanTodo todo) {
        PlanTodoResponse response = new PlanTodoResponse();
        response.setId(todo.getId());
        response.setTopicId(todo.getTopic().getId());
        response.setTodoName(todo.getTodoName());
        response.setDayIndex(todo.getDayIndex());
        response.setSortOrder(todo.getSortOrder());
        return response;
    }
}
