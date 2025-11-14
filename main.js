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

    // --- Helper Functions ---
    async function fetchAPI(url, options = {}) {
        try {
            const response = await fetch(url, options);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || `HTTP Error ${response.status}`);
            }
            return data;
        } catch (error) {
            alert(`Error: ${error.message}`);
            throw error;
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
            gridWrapper.textContent = 'Query returned no results.';
        }
    }

    // --- Event Handlers & Logic ---

    async function loadTableSets() {
        try {
            const tablesets = await fetchAPI('/llmsql/tablesets');
            populateSelect(tablesetSelect, tablesets);
            if (tablesets.length > 0) {
                tablesetSelect.dispatchEvent(new Event('change'));
            }
        } catch (error) { console.error('Failed to load tablesets.'); }
    }

    async function handleTableSetChange() {
        const selectedTableSet = tablesetSelect.value;
        if (!selectedTableSet) {
            populateSelect(tableSelect, []);
            return;
        }
        try {
            const tables = await fetchAPI(`/llmsql/tables?tableset=${selectedTableSet}`);
            populateSelect(tableSelect, tables);
        } catch (error) { console.error(`Failed to load tables for ${selectedTableSet}.`); }
    }

    async function handleBrowseClick() {
        const selectedTable = tableSelect.value;
        if (!selectedTable) {
            alert('Please select a table.');
            return;
        }
        browseBtn.setAttribute('aria-busy', 'true');
        try {
            const data = await fetchAPI('/llmsql/browse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tableName: selectedTable })
            });
            createResultBlock(`Browsing Table: ${selectedTable}`, data);
        } catch (error) { console.error(`Failed to browse table ${selectedTable}.`); }
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
        if (targetId === 'import-tab' && r2FileSelect.options.length === 0) {
            loadR2Files();
        }
    }

    // --- LLM & Query Functions (requires backend endpoints) ---
    async function handleGenerateSqlClick() {
        const prompt = llmPromptInput.value;
        if (!prompt) return alert('Please enter a request.');
        generateSqlBtn.setAttribute('aria-busy', 'true');
        executeSqlBtn.disabled = true;
        try {
            // NOTE: For better results, you could also send table schema info here.
            const { sql } = await fetchAPI('/llmsql/generate-sql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: prompt, schema: '...' }) // Schema part to be implemented
            });
            sqlOutputTextarea.value = sql;
            executeSqlBtn.disabled = false;
        } catch (e) { console.error("Failed to generate SQL"); }
        finally { generateSqlBtn.removeAttribute('aria-busy'); }
    }

    async function handleExecuteSqlClick() {
        const sql = sqlOutputTextarea.value;
        if (!sql) return alert('No SQL to execute.');
        executeSqlBtn.setAttribute('aria-busy', 'true');
        try {
            const data = await fetchAPI('/llmsql/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sql: sql })
            });
            createResultBlock('Query Result', data);
        } catch (e) { console.error("Failed to execute SQL"); }
        finally { executeSqlBtn.removeAttribute('aria-busy'); }
    }

    // --- Import Functions (requires backend endpoints) ---
    async function loadR2Files() {
        r2FileSelect.innerHTML = '<option disabled>Loading files...</option>';
        try {
            const files = await fetchAPI('/llmsql/r2-files');
            populateSelect(r2FileSelect, files);
        } catch (e) { console.error("Failed to load R2 files"); }
    }

    async function handleAnalyzeFileClick() {
        const fileName = r2FileSelect.value;
        if (!fileName) return alert('Please select a file from R2.');
        
        analyzeFileBtn.setAttribute('aria-busy', 'true');
        importBtn.style.display = 'none';
        schemaSuggestionArea.innerHTML = '';
        
        try {
            const { tableName, sql } = await fetchAPI('/llmsql/analyze-file', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName: fileName })
            });
            
            // Dynamically create the editable schema form
            schemaSuggestionArea.innerHTML = `
                <label for="import-tableset-name">Add to TableSet</label>
                <input type="text" id="import-tableset-name" value="${tablesetSelect.value || ''}" placeholder="e.g., new_sales_data">
                <label for="import-table-name">Suggested Table Name</label>
                <input type="text" id="import-table-name" value="${tableName}">
                <label for="import-schema-sql">Suggested Schema (CREATE TABLE)</label>
                <textarea id="import-schema-sql" style="height: 120px;">${sql}</textarea>
            `;
            importBtn.style.display = 'block';

        } catch (e) { console.error("File analysis failed"); }
        finally { analyzeFileBtn.removeAttribute('aria-busy'); }
    }
    
    async function handleImportClick() {
        const tablesetName = document.getElementById('import-tableset-name').value;
        const tableName = document.getElementById('import-table-name').value;
        const schemaSql = document.getElementById('import-schema-sql').value;
        const fileName = r2FileSelect.value;

        if (!tablesetName || !tableName || !schemaSql) {
            return alert('Please fill all fields for import.');
        }

        importBtn.setAttribute('aria-busy', 'true');
        importFeedbackArea.textContent = 'Importing... This may take a moment.';

        try {
            const result = await fetchAPI('/llmsql/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tablesetName, tableName, schemaSql, fileName })
            });
            importFeedbackArea.textContent = `Success! ${result.message}`;
            // Refresh the data lists to show the new table
            loadTableSets();
        } catch (e) {
            importFeedbackArea.textContent = `Error: ${e.message}`;
            console.error("Import failed");
        } finally {
            importBtn.removeAttribute('aria-busy');
        }
    }

    // --- Initialization ---
    function init() {
        tablesetSelect.addEventListener('change', handleTableSetChange);
        browseBtn.addEventListener('click', handleBrowseClick);
        tabButtons.forEach(button => button.addEventListener('click', handleTabSwitch));
        generateSqlBtn.addEventListener('click', handleGenerateSqlClick);
        executeSqlBtn.addEventListener('click', handleExecuteSqlClick);
        analyzeFileBtn.addEventListener('click', handleAnalyzeFileClick);
        importBtn.addEventListener('click', handleImportClick);
        
        loadTableSets();
    }

    init();
});
