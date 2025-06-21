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
            <div class="execution-info" style="font-size: 0.6rem;">
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
    
    // Ctrl/Cmd + Shift + E to export queries
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'E') {
        exportQueries();
        event.preventDefault();
    }
    
    // Ctrl/Cmd + Shift + I to import queries
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'I') {
        document.getElementById('importFile').click();
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
            <div>⌘+⇧+E: Export</div>
            <div>⌘+⇧+I: Import</div>
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

// Export queries to JSON file
function exportQueries() {
    const queries = [];
    const tableBody = document.getElementById('queryTableBody');
    const rows = tableBody.getElementsByClassName('query-row');
    
    for (let row of rows) {
        const rowId = row.id;
        const queryTextarea = document.getElementById(`query_${rowId}`);
        const query = queryTextarea.value.trim();
        
        if (query) {
            queries.push({
                query: query,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    if (queries.length === 0) {
        showNotification('No queries to export', 'warning');
        return;
    }
    
    const exportData = {
        queries: queries,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `multiquerier-queries-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(`Exported ${queries.length} queries successfully`, 'success');
}

// Import queries from JSON file
function importQueries(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            
            // Validate import data structure
            if (!importData.queries || !Array.isArray(importData.queries)) {
                throw new Error('Invalid file format. Expected queries array.');
            }
            
            // Clear existing queries
            const tableBody = document.getElementById('queryTableBody');
            tableBody.innerHTML = '';
            rowCounter = 0;
            
            // Add imported queries
            let importedCount = 0;
            for (let queryData of importData.queries) {
                if (queryData.query && queryData.query.trim()) {
                    addQueryRow();
                    const currentRowId = `row_${rowCounter}`;
                    const queryTextarea = document.getElementById(`query_${currentRowId}`);
                    queryTextarea.value = queryData.query;
                    importedCount++;
                }
            }
            
            // If no valid queries were imported, add an empty row
            if (importedCount === 0) {
                addQueryRow();
                showNotification('No valid queries found in the file', 'warning');
            } else {
                showNotification(`Imported ${importedCount} queries successfully`, 'success');
            }
            
        } catch (error) {
            console.error('Error importing queries:', error);
            showNotification(`Failed to import queries: ${error.message}`, 'error');
            
            // Ensure at least one row exists
            const tableBody = document.getElementById('queryTableBody');
            if (tableBody.children.length === 0) {
                addQueryRow();
            }
        }
    };
    
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

// Show notification message
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 1060; min-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
    
    const icon = type === 'success' ? 'check-circle' : 
                type === 'warning' ? 'exclamation-triangle' : 
                type === 'error' ? 'exclamation-circle' : 'info-circle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 150);
        }
    }, 5000);
}
