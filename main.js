// main.js (全新逻辑：树状导航与单一视图)
document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_PATH = '/llmsql';

    // --- DOM References ---
    const navSelect = document.getElementById('nav-select');
    const tableDisplayArea = document.getElementById('table-display-area');
    const importTargetDisplay = document.getElementById('import-target-display');
    // (其他元素的引用保持不变)
    const tabButtons = document.querySelectorAll('.operations-tabs .tab-button');
    const tabContents = document.querySelectorAll('.operations-tabs .tab-content article');

    let gridInstance = null; // 用于持有 Grid.js 实例

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

    /** 辅助函数：在DOM中插入子节点 */
    function insertChildOptions(parentOption, children) {
        let nextSibling = parentOption.nextElementSibling;
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

    /** 辅助函数：移除子节点 */
    function removeChildOptions(parentName) {
        navSelect.querySelectorAll(`option[data-parent="${parentName}"]`).forEach(el => el.remove());
    }

    // --- Core Logic ---

    /** 1. 页面加载时，填充顶层的 TableSets */
    async function loadInitialTree() {
        try {
            const tablesets = await fetchAPI(`${API_BASE_PATH}/tablesets`);
            navSelect.innerHTML = '';
            tablesets.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                option.dataset.type = 'tableset'; // 标记类型
                option.dataset.expanded = 'false'; // 标记折叠状态
                navSelect.appendChild(option);
            });
        } catch (error) { console.error('Failed to load initial tree:', error); }
    }

    /** 2. 处理导航列表中的点击事件 */
    async function handleNavigationSelectChange() {
        const selectedOption = navSelect.options[navSelect.selectedIndex];
        if (!selectedOption) return;

        const type = selectedOption.dataset.type;
        const name = selectedOption.value;

        if (type === 'tableset') {
            // 更新导入区的目标提示
            importTargetDisplay.textContent = name;

            const isExpanded = selectedOption.dataset.expanded === 'true';
            if (isExpanded) {
                // 如果已展开，则折叠
                removeChildOptions(name);
                selectedOption.dataset.expanded = 'false';
            } else {
                // 如果未展开，则加载并展开
                try {
                    const tables = await fetchAPI(`${API_BASE_PATH}/tables/${name}`);
                    insertChildOptions(selectedOption, tables);
                    selectedOption.dataset.expanded = 'true';
                } catch (error) { console.error('Failed to expand tableset:', error); }
            }
        } else if (type === 'table') {
            // 如果是 Table，则在右侧显示内容
            try {
                const data = await fetchAPI(`${API_BASE_PATH}/browse/${name}`);
                renderTable(data, name);
            } catch (error) { console.error('Failed to browse table:', error); }
        }
    }

    /** 3. 在右侧渲染或更新数据表格 */
    function renderTable(gridData, tableName) {
        // 清空现有内容
        tableDisplayArea.innerHTML = `<label><strong>Content of: ${tableName}</strong></label>`; 
        
        if (gridInstance) {
            // 如果实例已存在，则更新数据
            gridInstance.updateConfig({
                columns: gridData.columns,
                data: gridData.data
            }).forceRender();
        } else {
            // 否则，创建新实例
            gridInstance = new gridjs.Grid({
                columns: gridData.columns,
                data: gridData.data,
                pagination: { limit: 10 },
                search: true,
                sort: true,
                resizable: true,
                height: '320px'
            }).render(tableDisplayArea);
        }
    }

    // --- 其他功能的事件监听和处理 (保持不变) ---
    function handleTabSwitch(event) {
        event.preventDefault();
        const clickedTab = event.currentTarget;
        const targetId = clickedTab.dataset.target;
        tabButtons.forEach(btn => btn.classList.remove('active'));
        clickedTab.classList.add('active');
        tabContents.forEach(content => { content.classList.toggle('active', content.id === targetId); });
    }
    
    // --- Initialization ---
    function init() {
        navSelect.addEventListener('click', handleNavigationSelectChange);
        tabButtons.forEach(button => button.addEventListener('click', handleTabSwitch));
        loadInitialTree();
    }

    init();
});
