package org.example.todolist.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.time.format.DateTimeFormatter;

import java.time.OffsetDateTime;
import java.util.*;


@RestController
@RequestMapping("/api/todos")
public class TodoRestController {

    @Value("${todo.api.url}")
    private String todoApiBaseUrl;

    private final RestTemplate restTemplate;
    private int tasksSize = 0;

    public TodoRestController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @GetMapping("")
    public ResponseEntity<String> getAllTasks(@RequestParam(required = false) Integer limit,
                                              @RequestParam(required = false) Integer offset) {

        String url = todoApiBaseUrl;
        if (limit != null) url += "?limit=" + limit;
        if (offset != null) url += "&offset=" + offset;

        return getStringResponseEntity(url, null, null, null);

    }

    @GetMapping("/{taskId}")
    public ResponseEntity<Map<String, Object>> getTask(@PathVariable String taskId) {

        String url = todoApiBaseUrl;

        var response = getStringResponseEntity(url, null, null, null);

        if (response.getStatusCode().is2xxSuccessful()) {
            String responseBody = response.getBody();
            ObjectMapper objectMapper = new ObjectMapper();

            try {
                List<Map<String, Object>> tasks = objectMapper.readValue(responseBody, new TypeReference<List<Map<String, Object>>>() {});

                Optional<Map<String, Object>> task = tasks.stream()
                        .filter(t -> t.get("id") != null && t.get("id").equals(taskId))
                        .findFirst();

                return task.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", String.format("Task with id: %s was not found ", taskId))));
            } catch (JsonProcessingException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Error processing response"));
            }
        } else {
            return ResponseEntity.status(response.getStatusCode()).body(Map.of("error", "Error fetching tasks"));
        }
    }

    @GetMapping("/find")
    public ResponseEntity<String> getTasksByQuery(@RequestParam String q,
                                                  @RequestParam(required = false) Integer limit,
                                                  @RequestParam(required = false) Integer offset) {

        String url = todoApiBaseUrl + "/find?q=" + q;
        return getStringResponseEntity(url, null, limit, offset);

    }

    @GetMapping("/date")
    public ResponseEntity<String> getTaskByDatePeriod(@RequestParam String from,
                                                      @RequestParam String to,
                                                      @RequestParam(required = false) Boolean sorting,
                                                      @RequestParam(required = false) Boolean status,
                                                      @RequestParam(required = false) Integer limit,
                                                      @RequestParam(required = false) Integer offset) {

        String url = todoApiBaseUrl + "/date?from=" + from + "&to=" + to;

        if (sorting == null) return getStringResponseEntity(url, status, limit, offset);
        else {
            return getStringResponseEntity(url, status, Objects.requireNonNullElseGet(limit, () -> tasksSize), offset);
        }
    }

    private ResponseEntity<String> getStringResponseEntity(String url,
                                                           @RequestParam(required = false) Boolean status,
                                                           @RequestParam(required = false) Integer limit,
                                                           @RequestParam(required = false) Integer offset) {

        if (status != null) url += "&status=" + status;
        if (limit != null) url += "&limit=" + limit;
        if (offset != null) url += "&offset=" + offset;

        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        HttpEntity<String> entity = new HttpEntity<>(headers);

        var response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
        tasksSize = Objects.requireNonNull(response.getBody()).length();
        return response;
    }

}
