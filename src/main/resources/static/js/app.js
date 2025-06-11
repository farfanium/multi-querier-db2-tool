// Multi-Querier DB2 Tool JavaScript - Minimalist Version

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
        <td class="p-2">
            <textarea 
                class="form-control query-textarea" 
                id="query_${rowId}" 
                placeholder="Enter your SQL query here...&#10;Example: SELECT * FROM your_table LIMIT 10"
                rows="4">
            </textarea>
            <div class="mt-2">
                <button class="btn btn-sm me-1" onclick="executeQuery('${rowId}')" title="Execute Query">
                    <i class="fas fa-play" style="font-size: 0.7rem;"></i>
                </button>
                <button class="btn btn-sm me-1" onclick="clearRow('${rowId}')" title="Clear Query">
                    <i class="fas fa-eraser" style="font-size: 0.7rem;"></i>
                </button>
                <button class="btn btn-sm" onclick="removeRow('${rowId}')" title="Remove Row">
                    <i class="fas fa-trash" style="font-size: 0.7rem;"></i>
                </button>
            </div>
        </td>
        <td class="p-2">
            <div id="result_${rowId}" class="result-container">
                <div class="no-results">
                    <i class="fas fa-info-circle" style="font-size: 0.8rem;"></i>
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

    clearRow(rowId);
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
            <!-- <div class="success-message">
                <i class="fas fa-check-circle" style="font-size: 0.8rem;"></i>
                Query executed successfully
            </div> -->
            <div class="execution-info" style="font-size: 0.6rem;>
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
                <i class="fas fa-check-circle" style="font-size: 0.8rem;"></i>
                Query executed successfully
            </div>
            <div class="execution-info">
                <strong>Rows:</strong> 0 | 
                <strong>Execution Time:</strong> ${result.executionTimeMs}ms
            </div>
            <div class="no-results mt-2">
                <i class="fas fa-info-circle" style="font-size: 0.8rem;"></i>
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
            <i class="fas fa-exclamation-triangle" style="font-size: 0.8rem;"></i>
            <strong>Error:</strong> ${escapeHtml(message)}
        </div>
    `;
}

// Show loading indicator
function showLoading(resultDiv) {
    resultDiv.innerHTML = `
        <div class="text-center p-3">
            <div class="spinner-border text-muted" role="status" style="width: 1.5rem; height: 1.5rem;">
                <span class="visually-hidden">Loading...</span>
            </div>
            <div class="mt-2" style="font-size: 0.85rem; color: #999;">Executing query...</div>
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
            <i class="fas fa-info-circle" style="font-size: 0.8rem;"></i>
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
        row.style.transition = 'all 0.2s ease-out';
        
        setTimeout(() => {
            row.remove();
            
            // If no rows left, add one
            const tableBody = document.getElementById('queryTableBody');
            if (tableBody.children.length === 0) {
                addQueryRow();
            }
        }, 200);
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

// Add subtle tooltip for keyboard shortcuts
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const tooltip = document.createElement('div');
        tooltip.className = 'position-fixed bottom-0 end-0 m-2 p-2 rounded';
        tooltip.style.fontSize = '0.7rem';
        tooltip.style.zIndex = '1050';
        tooltip.style.backgroundColor = 'rgba(0,0,0,0.8)';
        tooltip.style.color = 'white';
        tooltip.style.maxWidth = '200px';
        tooltip.innerHTML = `
            <div><strong>Shortcuts:</strong></div>
            <div>⌘+Enter: Execute</div>
            <div>⌘+⇧+N: Add row</div>
        `;
        document.body.appendChild(tooltip);
        
        // Auto-hide tooltip after 4 seconds
        setTimeout(() => {
            tooltip.style.opacity = '0';
            tooltip.style.transition = 'opacity 0.5s ease-out';
            setTimeout(() => tooltip.remove(), 500);
        }, 4000);
    }, 1000);
});
