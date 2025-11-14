// main.js (最终版：已删除所有垃圾逻辑，回归简单和正确)
document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_PATH = '/llmsql';

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
    const createTablesetBtn = document.getElementById('create-tableset-btn');
    
    // --- Helper Functions ---
    async function fetchAPI(url, options = {}) {
        try {
            const response = await fetch(url, options);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || `Request failed with status ${response.status}`);
            }
            return data;
        } catch (error) {
            alert(`API Communication Error:\n${error.message}`);
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
            <header><strong>${title}</strong><button class="close-btn" title="Close">&times;</button></header>
            <div class="content"><div class="grid-wrapper"></div></div>
        `;
        resultsArea.prepend(resultBlock);
        resultBlock.querySelector('.close-btn').addEventListener('click', () => resultBlock.remove());
        const gridWrapper = resultBlock.querySelector('.grid-wrapper');
        if (gridData && gridData.data && gridData.data.length > 0) {
            new gridjs.Grid({
                columns: gridData.columns, data: gridData.data, pagination: { limit: 10 },
                search: true, sort: true, resizable: true
            }).render(gridWrapper);
        } else {
            gridWrapper.textContent = gridData.columns[0] || 'No data.';
        }
    }

    // --- Event Handlers & Logic ---

    /**
     * 页面加载时只做一件事：加载左侧的 TableSet 列表。
     * 不做任何多余的操作。
     */
    async function loadTableSets() {
        try {
            const tablesets = await fetchAPI(`${API_BASE_PATH}/tablesets`);
            populateSelect(tablesetSelect, tablesets);

            // 如果左侧列表为空，确保右侧也显示为空。
            if (tablesets.length === 0) {
                 populateSelect(tableSelect, []);
            }
            // 我之前所有画蛇添足的垃圾代码都已删除。
            
        } catch (error) { console.error('Failed to load tablesets:', error); }
    }

    /**
     * 当用户与左侧列表交互时，这个函数才会被触发。
     */
    async function handleTableSetChange() {
        const selectedTableSet = tablesetSelect.value;
        
        // 如果用户取消了选择，导致值为空，则清空右侧列表。
        if (!selectedTableSet) {
            populateSelect(tableSelect, []);
            return; 
        }

        // 只有当用户确实选择了一个有效项时，才去请求 API。
        try {
            const tables = await fetchAPI(`${API_BASE_PATH}/tables/${selectedTableSet}`);
            populateSelect(tableSelect, tables);
        } catch (error) { console.error(`Failed to load tables for ${selectedTableSet}:`, error); }
    }

    async function handleBrowseClick() {
        const selectedTable = tableSelect.value;
        if (!selectedTable) { alert('Please select a table to browse.'); return; }
        browseBtn.setAttribute('aria-busy', 'true');
        try {
            const data = await fetchAPI(`${API_BASE_PATH}/browse/${selectedTable}`);
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
        tabContents.forEach(content => { content.classList.toggle('active', content.id === targetId); });
    }

    async function handleExecuteSqlClick() {
        const sql = sqlOutputTextarea.value;
        if (!sql) { alert('No SQL to execute.'); return; }
        executeSqlBtn.setAttribute('aria-busy', 'true');
        try {
            const data = await fetchAPI(`${API_BASE_PATH}/query`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sql: sql })
            });
            createResultBlock('Query Result', data);
        } catch (e) { console.error("Failed to execute SQL:", e); }
        finally { executeSqlBtn.removeAttribute('aria-busy'); }
    }
    
    function handleGenerateSqlClick() {
        sqlOutputTextarea.value = "SELECT * FROM customers WHERE country = 'USA';";
        executeSqlBtn.disabled = false;
        alert("SQL generation backend is not implemented yet. Using a sample query.");
    }
    
    function handleCreateTablesetClick() {
        alert("Create TableSet backend is not implemented yet.");
    }

    // --- Initialization ---
    function init() {
        tablesetSelect.addEventListener('change', handleTableSetChange);
        browseBtn.addEventListener('click', handleBrowseClick);
        tabButtons.forEach(button => button.addEventListener('click', handleTabSwitch));
        generateSqlBtn.addEventListener('click', handleGenerateSqlClick);
        executeSqlBtn.addEventListener('click', handleExecuteSqlClick);
        createTablesetBtn.addEventListener('click', handleCreateTablesetClick);
        
        loadTableSets();
    }

    init();
});
