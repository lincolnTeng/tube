// main.js (最终修正：使用干净的容器进行渲染)
document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_PATH = '/llmsql';

    // --- DOM References ---
    const navSelect = document.getElementById('nav-select');
    const tableDisplayLabel = document.getElementById('table-display-label');
    const gridWrapper = document.getElementById('grid-wrapper');
    const importTargetDisplay = document.getElementById('import-target-display');
    const tabButtons = document.querySelectorAll('.operations-tabs .tab-button');
    const tabContents = document.querySelectorAll('.operations-tabs .tab-content article');
    
    let gridInstance = null;

    // --- Helper Functions ---
    async function fetchAPI(url, options = {}) {
        try {
            const response = await fetch(url, options);
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

    async function loadInitialTree() {
        try {
            const tablesets = await fetchAPI(`${API_BASE_PATH}/tablesets`);
            navSelect.innerHTML = '';
            tablesets.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                option.dataset.type = 'tableset';
                option.dataset.expanded = 'false';
                navSelect.appendChild(option);
            });
        } catch (error) { console.error('Failed to load initial tree:', error); }
    }

    async function handleNavigationSelectChange() {
        const selectedOption = navSelect.options[navSelect.selectedIndex];
        if (!selectedOption) return;

        const type = selectedOption.dataset.type;
        const name = selectedOption.value;

        if (type === 'tableset') {
            importTargetDisplay.textContent = name;
            const isExpanded = selectedOption.dataset.expanded === 'true';
            if (isExpanded) {
                removeChildOptions(name);
                selectedOption.dataset.expanded = 'false';
            } else {
                try {
                    const tables = await fetchAPI(`${API_BASE_PATH}/tables/${name}`);
                    insertChildOptions(selectedOption, tables);
                    selectedOption.dataset.expanded = 'true';
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
        // 更新标题
        tableDisplayLabel.innerHTML = `<strong>Content of: ${tableName}</strong>`; 
        
        // ==========================================================
        // THE FIX IS HERE: Always operate on the clean gridWrapper
        // ==========================================================
        if (gridInstance) {
            gridInstance.updateConfig({
                columns: gridData.columns,
                data: gridData.data
            }).forceRender();
        } else {
            // 第一次渲染时，确保 gridWrapper 是空的
            gridWrapper.innerHTML = ''; 
            gridInstance = new gridjs.Grid({
                columns: gridData.columns,
                data: gridData.data,
                pagination: { limit: 10 },
                search: true,
                sort: true,
                resizable: true,
                height: '320px'
            }).render(gridWrapper); // <-- Render into the clean wrapper
        }
    }

    function handleTabSwitch(event) {
        event.preventDefault();
        const clickedTab = event.currentTarget;
        const targetId = clickedTab.dataset.target;
        tabButtons.forEach(btn => btn.classList.remove('active'));
        clickedTab.classList.add('active');
        tabContents.forEach(content => { content.classList.toggle('active', content.id === targetId); });
    }
    
    function init() {
        navSelect.addEventListener('click', handleNavigationSelectChange);
        tabButtons.forEach(button => button.addEventListener('click', handleTabSwitch));
        loadInitialTree();
    }

    init();
});
