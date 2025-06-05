package com.multiquerier.controller;

import com.multiquerier.dto.QueryRequest;
import com.multiquerier.dto.QueryResponse;
import com.multiquerier.service.QueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/query")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class QueryController {
    
    private final QueryService queryService;
    
    @PostMapping("/execute")
    public ResponseEntity<QueryResponse> executeQuery(@Valid @RequestBody QueryRequest request) {
        log.info("Received query request for row: {}", request.getRowId());
        
        try {
            QueryResponse response = queryService.executeQuery(request.getQuery());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Unexpected error in controller: {}", e.getMessage(), e);
            return ResponseEntity.ok(QueryResponse.error("Internal server error: " + e.getMessage()));
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("service", "MultiQuerier API");
        return ResponseEntity.ok(status);
    }
}
