// functions/llmsql/service.js

// =================================================================
// 数据库 (D1) 服务
// =================================================================

export const dbService = {
    /**
     * 获取所有唯一的 tableset 名称
     * @param {D1Database} db - D1 数据库绑定
     * @returns {Promise<string[]>}
     */
    async getTableSets(db) {
        if (!db) throw new Error("D1 database binding is missing or not configured.");
        const ps = db.prepare("SELECT DISTINCT tableset_name FROM _tableset_meta ORDER BY tableset_name");
        const { results } = await ps.all();
        return results.map(row => row.tableset_name);
    },

    /**
     * 获取指定 tableset 下的所有表名
     * @param {D1Database} db - D1 数据库绑定
     * @param {string} tablesetName - The name of the tableset
     * @returns {Promise<string[]>}
     */
    async getTablesInSet(db, tablesetName) {
        if (!db) throw new Error("D1 database binding is missing.");
        const ps = db.prepare("SELECT table_name FROM _tableset_meta WHERE tableset_name = ? ORDER BY table_name");
        const { results } = await ps.bind(tablesetName).all();
        return results.map(row => row.table_name);
    },

    /**
     * 浏览表数据 (限制 200 行)
     * @param {D1Database} db - D1 数据库绑定
     * @param {string} tableName - The name of the table
     * @returns {Promise<{columns: string[], data: any[][]}>}
     */
    async browseTable(db, tableName) {
        if (!db) throw new Error("D1 database binding is missing.");
        if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
            throw new Error("Invalid table name format. Only alphanumeric characters and underscores are allowed.");
        }
        
        const ps = db.prepare(`SELECT * FROM ${tableName} LIMIT 200`);
        const { results } = await ps.all();
        
        if (!results || results.length === 0) {
            return { columns: [`No data in table '${tableName}'`], data: [] };
        }
        
        const columns = Object.keys(results[0]);
        const data = results.map(row => Object.values(row));
        return { columns, data };
    },

    /**
     * 执行只读的 SELECT 查询
     * @param {D1Database} db - D1 数据库绑定
     * @param {string} sql - The user-provided SQL query
     * @returns {Promise<{columns: string[], data: any[][]}>}
     */
    async executeQuery(db, sql) {
        if (!db) throw new Error("D1 database binding is missing.");
        
        // 安全检查：确保是只读查询
        if (!sql.trim().toLowerCase().startsWith('select')) {
            throw new Error("Security violation: Only SELECT queries are allowed.");
        }

        const ps = db.prepare(sql);
        const { results } = await ps.all();

        if (!results || results.length === 0) {
            return { columns: ["Query returned no results"], data: [] };
        }

        const columns = Object.keys(results[0]);
        const data = results.map(row => Object.values(row));
        return { columns, data };
    }
};
