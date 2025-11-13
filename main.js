document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Element References ---
    const tablesetSelect = document.getElementById('tableset-select');
    const tableSelect = document.getElementById('table-select');
    const browseBtn = document.getElementById('browse-btn');
    const resultsArea = document.getElementById('results-area');

    // Tab Elements
    const tabButtons = document.querySelectorAll('.operations-tabs .tab-button');
    const tabContents = document.querySelectorAll('.operations-tabs .tab-content article');

    // LLM Query Elements
    const llmPromptInput = document.getElementById('llm-prompt');
    const generateSqlBtn = document.getElementById('generate-sql-btn');
    const sqlOutputTextarea = document.getElementById('sql-output');
    const executeSqlBtn = document.getElementById('execute-sql-btn');

    // Import Elements
    const r2FileSelect = document.getElementById('r2-file-select');
    const fileUploadInput = document.getElementById('file-upload');
    const analyzeFileBtn = document.getElementById('analyze-file-btn');
    const schemaSuggestionArea = document.getElementById('schema-suggestion-area');
    const importBtn = document.getElementById('import-btn');
    const importFeedbackArea = document.getElementById('import-feedback-area');

    // --- Helper Functions ---

    /**
     * A generic wrapper for the fetch API to handle errors and JSON parsing.
     * @param {string} url - The API endpoint to call.
     * @param {object} options - The options for the fetch call (method, headers, body, etc.).
     * @returns {Promise<any>} - The JSON response from the server.
     */
    async function fetchAPI(url, options = {}) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error (${response.status}): ${errorText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Fetch API failed:", error);
            alert(`An error occurred: ${error.message}`);
            throw error; // Re-throw to stop subsequent actions
        }
    }
    
    /**
     * Populates a <select> element with options.
     * @param {HTMLSelectElement} selectElement - The select element to populate.
     * @param {Array<string>} optionsArray - An array of strings to use as options.
     */
    function populateSelect(selectElement, optionsArray) {
        selectElement.innerHTML = ''; // Clear existing options
        if (!optionsArray || optionsArray.length === 0) {
            const option = document.createElement('option');
            option.textContent = 'No items found';
            option.disabled = true;
            selectElement.appendChild(option);
        } else {
            optionsArray.forEach(item => {
                const option = document.createElement('option');
                option.value = item;
                option.textContent = item;
                selectElement.appendChild(option);
            });
        }
    }

    /**
     * Creates a new result block with a title and a Grid.js table.
     * @param {string} title - The title to display in the result block header.
     * @param {object} gridData - The data for Grid.js ({ columns: [...], data: [...] }).
     */
    function createResultBlock(title, gridData) {
        const resultBlock = document.createElement('article');
        resultBlock.className = 'result-block';

        const header = document.createElement('header');
        const headerTitle = document.createElement('strong');
        headerTitle.textContent = title;
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.title = 'Close';
        closeBtn.innerHTML = '&times;';
        
        closeBtn.addEventListener('click', () => {
            resultBlock.remove();
        });

        header.appendChild(headerTitle);
        header.appendChild(closeBtn);

        const content = document.createElement('div');
        content.className = 'content';
        const gridWrapper = document.createElement('div');
        content.appendChild(gridWrapper);

        resultBlock.appendChild(header);
        resultBlock.appendChild(content);

        resultsArea.prepend(resultBlock); // Add new results to the top

        // Render the Grid.js table
        if (gridData && gridData.data && gridData.data.length > 0) {
            new gridjs.Grid({
                columns: gridData.columns,
                data: gridData.data,
                pagination: {
                    limit: 10
                },
                search: true,
                sort: true,
                resizable: true
            }).render(gridWrapper);
        } else {
            gridWrapper.textContent = 'Query returned no results.';
        }
    }


    // --- Event Handlers & Logic ---

    /**
     * Loads the list of TableSets from the backend.
     */
    async function loadTableSets() {
        try {
            const tablesets = await fetchAPI('/api/tablesets');
            populateSelect(tablesetSelect, tablesets);
            // Trigger change to load tables for the first tableset automatically
            if (tablesets.length > 0) {
                tablesetSelect.dispatchEvent(new Event('change'));
            }
        } catch (error) {
            console.error('Failed to load tablesets.');
        }
    }

    /**
     * Handles the change event on the TableSet select list.
     */
    async function handleTableSetChange() {
        const selectedTableSet = tablesetSelect.value;
        if (!selectedTableSet) {
            populateSelect(tableSelect, []);
            return;
        }
        try {
            const tables = await fetchAPI(`/api/tables?tableset=${selectedTableSet}`);
            populateSelect(tableSelect, tables);
        } catch (error) {
            console.error(`Failed to load tables for ${selectedTableSet}.`);
        }
    }

    /**
     * Handles the click event on the "Browse" button.
     */
    async function handleBrowseClick() {
        const selectedTable = tableSelect.value;
        if (!selectedTable) {
            alert('Please select a table to browse.');
            return;
        }
        browseBtn.setAttribute('aria-busy', 'true');
        browseBtn.textContent = 'Loading...';
        try {
            const data = await fetchAPI('/api/browse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tableName: selectedTable })
            });
            createResultBlock(`Browsing Table: ${selectedTable}`, data);
        } catch (error) {
             console.error(`Failed to browse table ${selectedTable}.`);
        } finally {
            browseBtn.removeAttribute('aria-busy');
            browseBtn.textContent = 'Browse Selected Table';
        }
    }

    /**
     * Handles switching between the Query and Import tabs.
     */
    function handleTabSwitch(event) {
        event.preventDefault();
        const clickedTab = event.currentTarget;
        const targetId = clickedTab.dataset.target;

        // Update button active state
        tabButtons.forEach(btn => btn.classList.remove('active'));
        clickedTab.classList.add('active');

        // Update content active state
        tabContents.forEach(content => {
            if (content.id === targetId) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });

        // Load R2 files only when switching to the import tab for the first time
        if (targetId === 'import-tab' && r2FileSelect.options.length === 0) {
            loadR2Files();
        }
    }
    
    // --- Placeholder functions for future implementation ---

    async function handleGenerateSqlClick() {
        const prompt = llmPromptInput.value;
        if (!prompt) {
            alert('Please enter a request.');
            return;
        }
        generateSqlBtn.setAttribute('aria-busy', 'true');
        executeSqlBtn.disabled = true;

        // **BACKEND CALL (Placeholder)**
        // const { sql } = await fetchAPI('/api/llm/generate-sql', { ... });
        // For demonstration, we'll use a timeout and a fake response.
        setTimeout(() => {
            const fakeSql = `SELECT * FROM customers\nWHERE country = 'USA'\nORDER BY sales DESC\nLIMIT 5;`;
            sqlOutputTextarea.value = fakeSql;
            generateSqlBtn.removeAttribute('aria-busy');
            executeSqlBtn.disabled = false;
        }, 1500);
    }
    
    async function handleExecuteSqlClick() {
        const sql = sqlOutputTextarea.value;
        if (!sql) {
            alert('No SQL to execute.');
            return;
        }
        executeSqlBtn.setAttribute('aria-busy', 'true');

        // **BACKEND CALL (Placeholder)**
        // const data = await fetchAPI('/api/query', { method: 'POST', body: JSON.stringify({ sql }) });
        // For demonstration, we'll use a timeout and fake data.
        setTimeout(() => {
            const fakeData = {
                columns: ['customer_id', 'name', 'country', 'sales'],
                data: [
                    [101, 'John Doe', 'USA', 5000],
                    [102, 'Jane Smith', 'USA', 4500],
                    [105, 'Peter Jones', 'USA', 4200]
                ]
            };
            createResultBlock('Query Result', fakeData);
            executeSqlBtn.removeAttribute('aria-busy');
        }, 1000);
    }

    async function loadR2Files() {
        // **BACKEND CALL (Placeholder)**
        // const files = await fetchAPI('/api/r2/files');
        // For demonstration:
        const fakeFiles = ['users_2024.csv', 'products.json', 'sales_q1.csv'];
        populateSelect(r2FileSelect, fakeFiles);
    }
    
    function handleAnalyzeFileClick() {
        alert('File analysis logic not yet implemented.');
        // 1. Get selected file from R2 list or upload input
        // 2. Send to backend: POST /api/llm/analyze-schema
        // 3. Backend returns suggested schema
        // 4. Frontend dynamically creates an editable form in `schemaSuggestionArea`
        // 5. Enable the import button
    }
    
    function handleImportClick() {
        alert('Import logic not yet implemented.');
        // 1. Read schema from the form in `schemaSuggestionArea`
        // 2. Send schema and filename to backend: POST /api/import
        // 3. Display feedback messages in `importFeedbackArea`
    }


    // --- Initialization ---

    function init() {
        // Attach Event Listeners
        tablesetSelect.addEventListener('change', handleTableSetChange);
        browseBtn.addEventListener('click', handleBrowseClick);
        tabButtons.forEach(button => button.addEventListener('click', handleTabSwitch));
        
        // LLM Query listeners
        generateSqlBtn.addEventListener('click', handleGenerateSqlClick);
        executeSqlBtn.addEventListener('click', handleExecuteSqlClick);
        
        // Import listeners
        analyzeFileBtn.addEventListener('click', handleAnalyzeFileClick);
        importBtn.addEventListener('click', handleImportClick);

        // Initial data load
        loadTableSets();
    }

    // Run the initialization function when the DOM is ready
    init();
});
