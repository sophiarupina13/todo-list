package org.example.todolist.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;


@RestController
@RequestMapping("/api/todos")
public class TodoRestController {

    @Value("${todo.api.url}")
    private String todoApiBaseUrl;

    private final RestTemplate restTemplate;

    public TodoRestController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @GetMapping("")
    public ResponseEntity<String> getAllTasks(@RequestParam(required = false) Boolean status,
                                              @RequestParam(required = false) Integer limit,
                                              @RequestParam(required = false) Integer offset) {

        String url = todoApiBaseUrl;
        if (status == null) {
            if (limit != null) url += "?limit=" + limit;
            if (offset != null) url += "&offset=" + offset;
        }
        else {
            url += "?status=" + status;
            if (limit != null) url += "&limit=" + limit;
            if (offset != null) url += "&offset=" + offset;
        }
        return getStringResponseEntity(url, null, null, null);

    }

    @GetMapping("/find")
    public ResponseEntity<String> getTasksByQuery(@RequestParam String q,
                                                  @RequestParam(required = false) Boolean status,
                                                  @RequestParam(required = false) Integer limit,
                                                  @RequestParam(required = false) Integer offset) {

        String url = todoApiBaseUrl + "/find?q=" + q;
        return getStringResponseEntity(url, status, limit, offset);

    }

    @GetMapping("/date")
    public ResponseEntity<String> getTaskByDatePeriod(@RequestParam String from,
                                                      @RequestParam String to,
                                                      @RequestParam(required = false) Boolean status,
                                                      @RequestParam(required = false) Integer limit,
                                                      @RequestParam(required = false) Integer offset) {

        String url = todoApiBaseUrl + "/date?from=" + from + "&to=" + to;

        return getStringResponseEntity(url, status, limit, offset);

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
        return response;
    }

}
