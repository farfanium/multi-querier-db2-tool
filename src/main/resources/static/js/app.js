// Multi-Querier DB2 Tool JavaScript

let rowCounter = 0;
const API_BASE_URL = '/api/query';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Add initial query row
    addQueryRow();
    
    // Check API health
    checkApiHealth();
});

// Add a new query row to the table
function addQueryRow() {
    rowCounter++;
    const rowId = `row_${rowCounter}`;
    
    const tableBody = document.getElementById('queryTableBody');
    const row = document.createElement('tr');
    row.id = rowId;
    row.className = 'query-row fade-in';
    
    row.innerHTML = `
        <td class="p-3">
            <textarea 
                class="form-control query-textarea" 
                id="query_${rowId}" 
                placeholder="Enter your SQL query here...&#10;Example: SELECT * FROM your_table LIMIT 10"
                rows="5">
            </textarea>
            <div class="mt-2">
                <button class="btn btn-primary btn-sm" onclick="executeQuery('${rowId}')">
                    <i class="fas fa-play me-1"></i>Execute
                </button>
                <button class="btn btn-warning btn-sm ms-1" onclick="clearRow('${rowId}')">
                    <i class="fas fa-eraser me-1"></i>Clear
                </button>
                <button class="btn btn-danger btn-sm ms-1" onclick="removeRow('${rowId}')">
                    <i class="fas fa-trash me-1"></i>Remove Row
                </button>
            </div>
        </td>
        <td class="p-3">
            <div id="result_${rowId}" class="result-container">
                <div class="no-results">
                    <i class="fas fa-info-circle me-1"></i>
                    No query executed yet
                </div>
            </div>
        </td>
    `;
    
    tableBody.appendChild(row);
    
    // Focus on the new textarea
    setTimeout(() => {
        document.getElementById(`query_${rowId}`).focus();
    }, 100);
}

// Execute query for a specific row
async function executeQuery(rowId) {
    const queryTextarea = document.getElementById(`query_${rowId}`);
    const resultDiv = document.getElementById(`result_${rowId}`);
    const query = queryTextarea.value.trim();
    
    if (!query) {
        showError(resultDiv, 'Please enter a query');
        return;
    }
    
    // Show loading
    showLoading(resultDiv);
    
    try {
        const response = await fetch(`${API_BASE_URL}/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                rowId: rowId
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        displayResult(resultDiv, result);
        
    } catch (error) {
        console.error('Error executing query:', error);
        showError(resultDiv, `Failed to execute query: ${error.message}`);
    }
}

// Display query result
function displayResult(resultDiv, result) {
    if (!result.success) {
        showError(resultDiv, result.message);
        return;
    }
    
    let html = '';
    
    if (result.data && result.data.length > 0) {
        // Create table with results
        html = `
            <div class="success-message">
                <i class="fas fa-check-circle me-1"></i>
                Query executed successfully
            </div>
            <div class="execution-info">
                <strong>Rows:</strong> ${result.rowCount} | 
                <strong>Execution Time:</strong> ${result.executionTimeMs}ms
            </div>
            <div class="table-container mt-2">
                <table class="table table-sm table-striped result-table">
                    <thead class="sticky-header">
                        <tr>
                            ${result.columns.map(col => `<th>${escapeHtml(col)}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${result.data.map(row => `
                            <tr>
                                ${result.columns.map(col => `
                                    <td title="${escapeHtml(String(row[col] || ''))}">${escapeHtml(String(row[col] || ''))}</td>
                                `).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else {
        html = `
            <div class="success-message">
                <i class="fas fa-check-circle me-1"></i>
                Query executed successfully
            </div>
            <div class="execution-info">
                <strong>Rows:</strong> 0 | 
                <strong>Execution Time:</strong> ${result.executionTimeMs}ms
            </div>
            <div class="no-results mt-2">
                <i class="fas fa-info-circle me-1"></i>
                No data returned
            </div>
        `;
    }
    
    resultDiv.innerHTML = html;
}

// Show error message
function showError(resultDiv, message) {
    resultDiv.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle me-1"></i>
            <strong>Error:</strong> ${escapeHtml(message)}
        </div>
    `;
}

// Show loading indicator
function showLoading(resultDiv) {
    resultDiv.innerHTML = `
        <div class="text-center p-3">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <div class="mt-2">Executing query...</div>
        </div>
    `;
}

// Clear query and result for a specific row
function clearRow(rowId) {
    const queryTextarea = document.getElementById(`query_${rowId}`);
    const resultDiv = document.getElementById(`result_${rowId}`);
    
    queryTextarea.value = '';
    resultDiv.innerHTML = `
        <div class="no-results">
            <i class="fas fa-info-circle me-1"></i>
            No query executed yet
        </div>
    `;
    
    queryTextarea.focus();
}

// Remove a row from the table
function removeRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
        // Add fade out animation
        row.style.opacity = '0';
        row.style.transform = 'translateX(-20px)';
        row.style.transition = 'all 0.3s ease-out';
        
        setTimeout(() => {
            row.remove();
            
            // If no rows left, add one
            const tableBody = document.getElementById('queryTableBody');
            if (tableBody.children.length === 0) {
                addQueryRow();
            }
        }, 300);
    }
}

// Check API health
async function checkApiHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            const health = await response.json();
            console.log('API Health:', health);
        }
    } catch (error) {
        console.warn('API health check failed:', error);
    }
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Handle keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + Enter to execute query in focused textarea
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.classList.contains('query-textarea')) {
            const rowId = activeElement.id.replace('query_', '');
            executeQuery(rowId);
            event.preventDefault();
        }
    }
    
    // Ctrl/Cmd + Shift + N to add new row
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'N') {
        addQueryRow();
        event.preventDefault();
    }
});

// Add tooltip for keyboard shortcuts
document.addEventListener('DOMContentLoaded', function() {
    const tooltip = document.createElement('div');
    tooltip.className = 'position-fixed bottom-0 end-0 m-3 p-2 bg-dark text-white rounded';
    tooltip.style.fontSize = '0.75rem';
    tooltip.style.zIndex = '1050';
    tooltip.innerHTML = `
        <div><strong>Keyboard Shortcuts:</strong></div>
        <div>Ctrl+Enter: Execute query</div>
        <div>Ctrl+Shift+N: Add new row</div>
    `;
    document.body.appendChild(tooltip);
    
    // Auto-hide tooltip after 5 seconds
    setTimeout(() => {
        tooltip.style.opacity = '0';
        tooltip.style.transition = 'opacity 1s ease-out';
        setTimeout(() => tooltip.remove(), 1000);
    }, 5000);
});

// Toggle column visibility
function toggleColumn(columnIndex) {
    const table = document.getElementById('queryTable');
    const icon = document.getElementById(`columnToggle${columnIndex}`);
    
    // Get all cells in the specified column
    const cells = table.querySelectorAll(`tr > td:nth-child(${columnIndex + 1}), tr > th:nth-child(${columnIndex + 1})`);
    
    let isHidden = false;
    if (cells.length > 0) {
        // Check current visibility state
        isHidden = cells[0].style.display === 'none';
    }
    
    // Toggle visibility
    cells.forEach(cell => {
        if (isHidden) {
            cell.style.display = '';
            cell.style.width = columnIndex === 0 ? '30%' : '70%';
        } else {
            cell.style.display = 'none';
            cell.style.width = '0';
        }
    });
    
    // Update icon
    if (icon) {
        if (isHidden) {
            icon.className = 'fas fa-eye';
        } else {
            icon.className = 'fas fa-eye-slash';
        }
    }
    
    // Adjust table layout
    if (!isHidden) {
        // When hiding first column, expand second column
        if (columnIndex === 0) {
            const secondColumnCells = table.querySelectorAll('tr > td:nth-child(2), tr > th:nth-child(2)');
            secondColumnCells.forEach(cell => {
                cell.style.width = '100%';
            });
        }
    } else {
        // When showing first column, restore original widths
        if (columnIndex === 0) {
            const secondColumnCells = table.querySelectorAll('tr > td:nth-child(2), tr > th:nth-child(2)');
            secondColumnCells.forEach(cell => {
                cell.style.width = '70%';
            });
        }
    }
}
