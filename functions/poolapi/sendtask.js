export async function onRequest(context) {
    const { request } = context;

    try {
        let taskData = await request.json(); // 获取前端发送的 JSON
        const vdir = new Date().getFullYear().toString().slice(-2) + String(new Date().getMonth() + 1).padStart(2, '0');
        taskData.vdir = vdir ;
        if (!taskData.vid || !taskData.vcmd  || !taskData.ws) {
            return new Response(JSON.stringify({
                status: "error",
                message: "Missing required task fields"
            }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // 发送任务到 runtask.py
        const response = await fetch("http://pool.bayx.uk/tuapi/runtask/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            throw new Error(`Failed to submit task: ${response.statusText}`);
        }

        const result = await response.json();
        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            status: "error",
            message: `Error submitting task: ${error.message}`
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
