// functions/api/llmsql/service.js

export const dbService = {
    async getTableSets(db) {
        if (!db) throw new Error("D1 database binding is missing or not configured.");
        const ps = db.prepare("SELECT DISTINCT tableset_name FROM _tableset_meta ORDER BY tableset_name");
        const { results } = await ps.all();
        return results.map(row => row.tableset_name);
    },
    async getTablesInSet(db, tablesetName) {
        if (!db) throw new Error("D1 database binding is missing.");
        const ps = db.prepare("SELECT table_name FROM _tableset_meta WHERE tableset_name = ? ORDER BY table_name");
        const { results } = await ps.bind(tablesetName).all();
        return results.map(row => row.table_name);
    },
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
    async executeQuery(db, sql) {
        if (!db) throw new Error("D1 database binding is missing.");
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

// =================================================================
// R2 (文件存储) 服务
// =================================================================
export const r2Service = {
    /**
     * 列出 Bucket 中的文件
     */
    async listFiles(bucket) {
        if (!bucket) throw new Error("R2 bucket binding is missing.");
        const listed = await bucket.list();
        return listed.objects.map(obj => obj.key);
    },
    
    /**
     * 上传文件到 R2
     */
    async uploadFile(bucket, fileName, fileData) {
        if (!bucket) throw new Error("R2 bucket binding is missing.");
        await bucket.put(fileName, fileData);
        return { success: true, fileName: fileName };
    }
}
