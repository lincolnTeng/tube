// functions/nav.js
export async function onRequest(context) {
    // 获取查询参数
    const { searchParams } = new URL(context.request.url);
    const action = searchParams.get('action'); // 'index' 或 'toggle'
    const id = searchParams.get('id');         // 用于 toggle 动作

    const nav = [
        {
            "name": "home",
            "type": "page",
            "path": "home.html"
        },
        {
            "name": "video",
            "type": "video",
            "path": "iFLHVWLlnOQ"
        },
        {
            "name": "playlist",
            "type": "videolist",
            "path": "etiMil0_4Jw,BuszZcWJ6as"
        }
    ];

    function buildNavHtml(items, parentId = '') {
        let html = '<ul class="tree">';
        
        items.forEach((item, index) => {
            const currentId = parentId ? `${parentId}-${index}` : `${index}`;
            
            html += '<li';
            if (item.children) {
                html += ` class="has-children" onclick="navonclick('${currentId}')"`;
            }
            html += '>';
            
            if (item.type) {
                html += `<span onclick="gotoonclick('/${item.type}?path=${item.path}')">${item.name}</span>`;
            } else {
                html += item.name;
            }
            
            if (item.children) {
                html += buildNavHtml(item.children, currentId);
            }
            
            html += '</li>';
        });
        
        html += '</ul>';
        return html;
    }

    const navHtml = buildNavHtml(nav);
    return new Response(navHtml, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
}
