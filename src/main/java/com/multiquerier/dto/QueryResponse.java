package com.multiquerier.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QueryResponse {
    private boolean success;
    private String message;
    private List<String> columns;
    private List<Map<String, Object>> data;
    private int rowCount;
    private long executionTimeMs;
    
    public static QueryResponse success(List<String> columns, List<Map<String, Object>> data, long executionTimeMs) {
        QueryResponse response = new QueryResponse();
        response.setSuccess(true);
        response.setColumns(columns);
        response.setData(data);
        response.setRowCount(data.size());
        response.setExecutionTimeMs(executionTimeMs);
        response.setMessage("Query executed successfully");
        return response;
    }
    
    public static QueryResponse error(String message) {
        QueryResponse response = new QueryResponse();
        response.setSuccess(false);
        response.setMessage(message);
        response.setRowCount(0);
        return response;
    }
}
