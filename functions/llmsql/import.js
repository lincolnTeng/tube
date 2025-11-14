// functions/llmsql/import.js
import { executeRawSql, insertBatch, registerTable } from './db.js';
import { getFileContent } from './r2.js';

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const { tableName, tablesetName, schemaSql, fileName } = await request.json();

        if (!tableName || !tablesetName || !schemaSql || !fileName) {
            throw new Error("Missing required fields (tableName, tablesetName, schemaSql, fileName)");
        }

        // 1. 创建表 (执行用户确认的 CREATE TABLE 语句)
        await executeRawSql(env.LLMSQL_DB, schemaSql);

        // 2. 注册到 tableset 元数据
        await registerTable(env.LLMSQL_DB, tablesetName, tableName);

        // 3. 从 R2 读取文件内容
        const csvContent = await getFileContent(env.LLMSQL_BUCKET, fileName);

        // 4. 解析 CSV (简化版: 假设第一行是 header，逗号分隔)
        const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) {
            return new Response(JSON.stringify({ message: "Table created, but file was empty." }), { headers: { 'Content-Type': 'application/json' }});
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const dataRows = lines.slice(1).map(line => {
            // 处理 CSV 值的简单逻辑 (去除引号等逻辑可以在这里加强)
            return line.split(',').map(val => {
                val = val.trim();
                // 尝试转换为数字，如果失败则保留为字符串
                const num = parseFloat(val);
                return isNaN(num) ? val : num;
            });
        });

        // 5. 批量插入数据 (每 50 行一批，防止 SQL 过长)
        const BATCH_SIZE = 50;
        for (let i = 0; i < dataRows.length; i += BATCH_SIZE) {
            const batch = dataRows.slice(i, i + BATCH_SIZE);
            await insertBatch(env.LLMSQL_DB, tableName, headers, batch);
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Imported ${dataRows.length} rows into '${tableName}'.` 
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
