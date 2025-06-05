package com.multiquerier.service;

import com.multiquerier.dto.QueryResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.ResultSetMetaData;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class QueryService {
    
    private final JdbcTemplate jdbcTemplate;
    
    public QueryResponse executeQuery(String query) {
        log.info("Executing query: {}", query);
        long startTime = System.currentTimeMillis();
        
        try {
            // Validate query type (only SELECT queries allowed for security)
            if (!isSelectQuery(query)) {
                log.warn("Non-SELECT query attempted: {}", query);
                return QueryResponse.error("Only SELECT queries are allowed");
            }
            
            List<Map<String, Object>> results = jdbcTemplate.query(query, (rs, rowNum) -> {
                Map<String, Object> row = new LinkedHashMap<>();
                ResultSetMetaData metaData = rs.getMetaData();
                int columnCount = metaData.getColumnCount();
                
                for (int i = 1; i <= columnCount; i++) {
                    String columnName = metaData.getColumnName(i);
                    Object value = rs.getObject(i);
                    row.put(columnName, value);
                }
                return row;
            });
            
            List<String> columns = new ArrayList<>();
            if (!results.isEmpty()) {
                columns.addAll(results.get(0).keySet());
            }
            
            long executionTime = System.currentTimeMillis() - startTime;
            log.info("Query executed successfully in {} ms, returned {} rows", executionTime, results.size());
            
            return QueryResponse.success(columns, results, executionTime);
            
        } catch (Exception e) {
            long executionTime = System.currentTimeMillis() - startTime;
            log.error("Error executing query: {}", e.getMessage(), e);
            return QueryResponse.error("Query execution failed: " + e.getMessage());
        }
    }
    
    private boolean isSelectQuery(String query) {
        String trimmedQuery = query.trim().toLowerCase();
        return trimmedQuery.startsWith("select") || trimmedQuery.startsWith("with");
    }
}
