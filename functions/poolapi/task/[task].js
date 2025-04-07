export async function onRequest(context) {
    const { params } = context;
    const taskId = params.task; // 自动从路径 /poolapi/task/<taskid> 获取 taskid

    if (!taskId) {
        return new Response(JSON.stringify({
            status: "error",
            message: "Task ID is required"
        }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        // 调用 taskstatus.py 的 /task_status/<taskid> 接口
        const response = await fetch(`http://pool.bayx.uk/tuapi/taskstatus/${taskId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch task status: ${response.statusText}`);
        }

        const statusData = await response.json();
        return new Response(JSON.stringify(statusData), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            status: "error",
            message: `Error fetching task status: ${error.message}`
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
