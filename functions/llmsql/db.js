// functions/llmsql/db.js

/**
 * 辅助函数：执行预处理语句并捕获错误
 */
async function executeStatement(db, statement) {
    try {
        return await statement.all();
    } catch (e) {
        console.error("D1 Error:", e.message);
        throw new Error(`Database error: ${e.message}`);
    }
}

/**
 * 获取所有唯一的 tableset 名称
 */
export async function getTableSets(db) {
    const ps = db.prepare("SELECT DISTINCT tableset_name FROM _tableset_meta ORDER BY tableset_name");
    const { results } = await executeStatement(db, ps);
    return results.map(row => row.tableset_name);
}

/**
 * 获取指定 tableset 下的所有表名
 */
export async function getTablesInSet(db, tablesetName) {
    const ps = db.prepare("SELECT table_name FROM _tableset_meta WHERE tableset_name = ? ORDER BY table_name");
    const { results } = await executeStatement(db, ps.bind(tablesetName));
    return results.map(row => row.table_name);
}

/**
 * 浏览表数据 (限制 200 行)
 */
export async function browseTable(db, tableName) {
    // 简单的防注入检查：只允许字母、数字和下划线
    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
        throw new Error("Invalid table name format.");
    }
    const ps = db.prepare(`SELECT * FROM ${tableName} LIMIT 200`);
    const { results } = await executeStatement(db, ps);
    
    if (!results || results.length === 0) {
        return { columns: [], data: [] };
    }
    const columns = Object.keys(results[0]);
    const data = results.map(row => Object.values(row));
    return { columns, data };
}

/**
 * 执行原始 SQL (用于创建表等)
 * 注意：仅用于受控的内部调用，特别是 CREATE TABLE
 */
export async function executeRawSql(db, sql) {
    try {
        await db.exec(sql);
    } catch (e) {
        throw new Error(`Failed to execute SQL: ${e.message}`);
    }
}

/**
 * 注册新表到元数据中
 */
export async function registerTable(db, tablesetName, tableName) {
    const ps = db.prepare("INSERT OR IGNORE INTO _tableset_meta (tableset_name, table_name) VALUES (?, ?)");
    await executeStatement(db, ps.bind(tablesetName, tableName));
}

/**
 * 批量插入数据
 * 这是一个简化的实现，用于处理 CSV 数据导入
 */
export async function insertBatch(db, tableName, columns, rows) {
    if (rows.length === 0) return;
    
    // 构建 SQL: INSERT INTO table (col1, col2) VALUES (?, ?), (?, ?)...
    const placeholders = `(${columns.map(() => '?').join(', ')})`;
    const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${rows.map(() => placeholders).join(', ')}`;
    
    // 扁平化参数数组
    const params = rows.flat();
    
    try {
        const ps = db.prepare(sql).bind(...params);
        await ps.run();
    } catch (e) {
        throw new Error(`Batch insert failed: ${e.message}`);
    }
}
