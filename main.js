// main.js (最终修正：恢复所有功能和事件监听)
document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_PATH = '/api/llmsql';

    // --- DOM References ---
    const navSelect = document.getElementById('nav-select');
    const tableDisplayLabel = document.getElementById('table-display-label');
    const gridWrapper = document.getElementById('grid-wrapper');
    const importTargetDisplay = document.getElementById('import-target-display');
    const tabButtons = document.querySelectorAll('.operations-tabs .tab-button');
    const tabContents = document.querySelectorAll('.operations-tabs .tab-content article');
    const createTablesetBtn = document.getElementById('create-tableset-btn');
    const r2FileSelect = document.getElementById('r2-file-select');
    const fileUploadInput = document.getElementById('file-upload');
    const uploadBtn = document.getElementById('upload-btn');
    
    let gridInstance = null;

    // --- Helper Functions ---
    async function fetchAPI(url, options = {}) {
        // FormData requests are handled differently
        const isFormData = options.body instanceof FormData;
        const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
        
        try {
            const response = await fetch(url, { ...options, headers });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Request failed`);
            return data;
        } catch (error) {
            alert(`API Error: ${error.message}`);
            throw error;
        }
    }

    function insertChildOptions(parentOption, children) {
        children.reverse().forEach(childName => {
            const option = document.createElement('option');
            option.value = childName;
            option.textContent = childName;
            option.dataset.type = 'table';
            option.dataset.parent = parentOption.value;
            option.className = 'child-option';
            parentOption.insertAdjacentElement('afterend', option);
        });
    }

    function removeChildOptions(parentName) {
        navSelect.querySelectorAll(`option[data-parent="${parentName}"]`).forEach(el => el.remove());
    }

    // --- Core Logic ---
    async function loadInitialTree() { /* unchanged */ }
    async function handleNavigationSelectChange() { /* unchanged */ }
    function renderTable(gridData, tableName) { /* unchanged */ }
    
    // --- Restored/New Functions ---
    function handleTabSwitch(event) {
        event.preventDefault();
        const clickedTab = event.currentTarget;
        const targetId = clickedTab.dataset.target;
        tabButtons.forEach(btn => btn.classList.remove('active'));
        clickedTab.classList.add('active');
        tabContents.forEach(content => { content.classList.toggle('active', content.id === targetId); });

        if (targetId === 'import-tab' && r2FileSelect.options.length === 0) {
            loadR2Files();
        }
    }

    function handleCreateTablesetClick() {
        const name = prompt("Enter new TableSet name:");
        if (name) alert(`Create TableSet functionality for '${name}' is not yet implemented.`);
    }

    async function loadR2Files() {
        try {
            const files = await fetchAPI(`${API_BASE_PATH}/r2-files`);
            r2FileSelect.innerHTML = files.map(f => `<option value="${f}">${f}</option>`).join('');
        } catch(e) { console.error("Failed to load R2 files"); }
    }

    function handleFileSelected() {
        if (fileUploadInput.files.length > 0) {
            uploadBtn.style.display = 'block';
        } else {
            uploadBtn.style.display = 'none';
        }
    }

    async function handleUploadClick() {
        const file = fileUploadInput.files[0];
        if (!file) {
            alert("Please select a file first.");
            return;
        }
        uploadBtn.setAttribute('aria-busy', 'true');
        const formData = new FormData();
        formData.append('file', file);
        try {
            await fetchAPI(`${API_BASE_PATH}/upload-file`, {
                method: 'POST',
                body: formData
            });
            alert(`File '${file.name}' uploaded successfully!`);
            await loadR2Files(); // Refresh the list
        } catch (e) {
            console.error("Upload failed", e);
        } finally {
            uploadBtn.removeAttribute('aria-busy');
            uploadBtn.style.display = 'none';
            fileUploadInput.value = ''; // Reset file input
        }
    }

    // --- Re-implementing unchanged functions for completeness ---
    async function loadInitialTree() {
        try {
            const tablesets = await fetchAPI(`${API_BASE_PATH}/tablesets`);
            navSelect.innerHTML = '';
            tablesets.forEach(name => {
                const option = document.createElement('option');
                option.value = name; option.textContent = name;
                option.dataset.type = 'tableset'; option.dataset.expanded = 'false';
                navSelect.appendChild(option);
            });
        } catch (error) { console.error('Failed to load initial tree:', error); }
    }
    async function handleNavigationSelectChange() {
        const selectedOption = navSelect.options[navSelect.selectedIndex];
        if (!selectedOption) return;
        const type = selectedOption.dataset.type; const name = selectedOption.value;
        if (type === 'tableset') {
            importTargetDisplay.textContent = name;
            const isExpanded = selectedOption.dataset.expanded === 'true';
            if (isExpanded) {
                removeChildOptions(name); selectedOption.dataset.expanded = 'false';
            } else {
                try {
                    const tables = await fetchAPI(`${API_BASE_PATH}/tables/${name}`);
                    insertChildOptions(selectedOption, tables); selectedOption.dataset.expanded = 'true';
                } catch (error) { console.error('Failed to expand tableset:', error); }
            }
        } else if (type === 'table') {
            try {
                const data = await fetchAPI(`${API_BASE_PATH}/browse/${name}`);
                renderTable(data, name);
            } catch (error) { console.error('Failed to browse table:', error); }
        }
    }
    function renderTable(gridData, tableName) {
        tableDisplayLabel.innerHTML = `<strong>Content of: ${tableName}</strong>`; 
        if (gridInstance) {
            gridInstance.updateConfig({ columns: gridData.columns, data: gridData.data }).forceRender();
        } else {
            gridWrapper.innerHTML = ''; 
            gridInstance = new gridjs.Grid({
                columns: gridData.columns, data: gridData.data, pagination: { limit: 10 },
                search: true, sort: true, resizable: true, height: '320px'
            }).render(gridWrapper);
        }
    }
    
    // --- Initialization ---
    function init() {
        // THE FIX IS HERE: Restoring all event listeners
        navSelect.addEventListener('click', handleNavigationSelectChange);
        tabButtons.forEach(button => button.addEventListener('click', handleTabSwitch));
        createTablesetBtn.addEventListener('click', handleCreateTablesetClick);
        fileUploadInput.addEventListener('change', handleFileSelected);
        uploadBtn.addEventListener('click', handleUploadClick);

        loadInitialTree();
    }

    init();
});
