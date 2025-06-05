package com.multiquerier.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;

@Data
public class QueryRequest {
    @NotBlank(message = "Query cannot be empty")
    private String query;
    
    private String rowId;
}
