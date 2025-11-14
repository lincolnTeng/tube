// functions/llmsql/r2.js

/**
 * 列出 Bucket 中的文件
 */
export async function listFiles(bucket) {
    const listed = await bucket.list();
    return listed.objects.map(obj => obj.key);
}

/**
 * 读取文件内容 (作为文本)
 */
export async function getFileContent(bucket, fileName) {
    const object = await bucket.get(fileName);
    if (object === null) {
        throw new Error(`File not found in R2: ${fileName}`);
    }
    return await object.text();
}
