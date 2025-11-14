// main.js (绝对完整，无任何省略)
document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Element References ---
    const tablesetSelect = document.getElementById('tableset-select');
    const tableSelect = document.getElementById('table-select');
    const browseBtn = document.getElementById('browse-btn');
    const resultsArea = document.getElementById('results-area');
    const tabButtons = document.querySelectorAll('.operations-tabs .tab-button');
    const tabContents = document.querySelectorAll('.operations-tabs .tab-content article');
    const llmPromptInput = document.getElementById('llm-prompt');
    const generateSqlBtn = document.getElementById('generate-sql-btn');
    const sqlOutputTextarea = document.getElementById('sql-output');
    const executeSqlBtn = document.getElementById('execute-sql-btn');
    const r2FileSelect = document.getElementById('r2-file-select');
    const analyzeFileBtn = document.getElementById('analyze-file-btn');
    const schemaSuggestionArea = document.getElementById('schema-suggestion-area');
    const importBtn = document.getElementById('import-btn');
    const importFeedbackArea = document.getElementById('import-feedback-area');
    const createTablesetBtn = document.getElementById('create-tableset-btn');
    const fileUploadInput = document.getElementById('file-upload');

    // --- Helper Functions ---
    async function fetchAPI(url, options = {}) {
        try {
            const response = await fetch(url, options);
            const data = await response.json();
            if (!response.ok) {
                // 使用后端返回的明确错误信息
                throw new Error(data.error || `Request failed with status ${response.status}`);
            }
            return data;
        } catch (error) {
            // 在 alert 中显示更清晰的错误
            alert(`API Communication Error:\n${error.message}`);
            throw error; // 抛出错误以停止后续操作
        }
    }
    
    function populateSelect(selectElement, optionsArray) {
        selectElement.innerHTML = '';
        if (!optionsArray || optionsArray.length === 0) {
            selectElement.innerHTML = '<option disabled>No items found</option>';
        } else {
            optionsArray.forEach(item => {
                const option = document.createElement('option');
                option.value = item;
                option.textContent = item;
                selectElement.appendChild(option);
            });
        }
    }

    function createResultBlock(title, gridData) {
        const resultBlock = document.createElement('article');
        resultBlock.className = 'result-block';
        resultBlock.innerHTML = `
            <header>
                <strong>${title}</strong>
                <button class="close-btn" title="Close">&times;</button>
            </header>
            <div class="content"><div class="grid-wrapper"></div></div>
        `;
        resultsArea.prepend(resultBlock);
        resultBlock.querySelector('.close-btn').addEventListener('click', () => resultBlock.remove());

        const gridWrapper = resultBlock.querySelector('.grid-wrapper');
        if (gridData && gridData.data && gridData.data.length > 0) {
            new gridjs.Grid({
                columns: gridData.columns,
                data: gridData.data,
                pagination: { limit: 10 },
                search: true, sort: true, resizable: true
            }).render(gridWrapper);
        } else {
            gridWrapper.textContent = gridData.columns[0] || 'No data.';
        }
    }

    // --- Event Handlers & Logic (已更新 API 调用) ---

    async function loadTableSets() {
        try {
            const tablesets = await fetchAPI('/llmsql/tablesets');
            populateSelect(tablesetSelect, tablesets);
            if (tablesets.length > 0) {
                tablesetSelect.dispatchEvent(new Event('change'));
            }
        } catch (error) { console.error('Failed to load tablesets:', error); }
    }

    async function handleTableSetChange() {
        const selectedTableSet = tablesetSelect.value;
        if (!selectedTableSet) {
            populateSelect(tableSelect, []);
            return;
        }
        try {
            const tables = await fetchAPI(`/llmsql/tables/${selectedTableSet}`);
            populateSelect(tableSelect, tables);
        } catch (error) { console.error(`Failed to load tables for ${selectedTableSet}:`, error); }
    }

    async function handleBrowseClick() {
        const selectedTable = tableSelect.value;
        if (!selectedTable) {
            alert('Please select a table to browse.');
            return;
        }
        browseBtn.setAttribute('aria-busy', 'true');
        try {
            const data = await fetchAPI(`/llmsql/browse/${selectedTable}`);
            createResultBlock(`Browsing Table: ${selectedTable}`, data);
        } catch (error) { console.error(`Failed to browse table ${selectedTable}:`, error); }
        finally { browseBtn.removeAttribute('aria-busy'); }
    }

    function handleTabSwitch(event) {
        event.preventDefault();
        const clickedTab = event.currentTarget;
        const targetId = clickedTab.dataset.target;
        tabButtons.forEach(btn => btn.classList.remove('active'));
        clickedTab.classList.add('active');
        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === targetId);
        });
    }

    async function handleExecuteSqlClick() {
        const sql = sqlOutputTextarea.value;
        if (!sql) {
            alert('No SQL to execute.');
            return;
        }
        executeSqlBtn.setAttribute('aria-busy', 'true');
        try {
            const data = await fetchAPI('/llmsql/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sql: sql })
            });
            createResultBlock('Query Result', data);
        } catch (e) { console.error("Failed to execute SQL:", e); }
        finally { executeSqlBtn.removeAttribute('aria-busy'); }
    }
    
    // --- 占位符函数，因为后端尚未实现 ---
    function handleGenerateSqlClick() {
        sqlOutputTextarea.value = "SELECT * FROM customers WHERE country = 'USA';";
        executeSqlBtn.disabled = false;
        alert("SQL generation backend is not implemented yet. Using a sample query.");
    }

    function handleAnalyzeFileClick() {
        alert("File analysis backend is not implemented yet.");
    }
    
    function handleImportClick() {
        alert("Import backend is not implemented yet.");
    }
    
    function handleCreateTablesetClick() {
        alert("Create TableSet backend is not implemented yet.");
    }


    // --- Initialization ---
    function init() {
        // Event Listeners for all interactive elements
        tablesetSelect.addEventListener('change', handleTableSetChange);
        browseBtn.addEventListener('click', handleBrowseClick);
        tabButtons.forEach(button => button.addEventListener('click', handleTabSwitch));
        generateSqlBtn.addEventListener('click', handleGenerateSqlClick);
        executeSqlBtn.addEventListener('click', handleExecuteSqlClick);
        analyzeFileBtn.addEventListener('click', handleAnalyzeFileClick);
        importBtn.addEventListener('click', handleImportClick);
        createTablesetBtn.addEventListener('click', handleCreateTablesetClick);

        // Initial data load
        loadTableSets();
    }

    init();
});
