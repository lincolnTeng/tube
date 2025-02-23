// functions/nav.js
export async function onRequest(context) {
    const nav = [
        {
            "name": "home",
            "type": "page",
            "path": "home.html"
        },
        {
            "name": "tube",
            "type": "page",
            "path": "tube.html"
        },
        {
            "name": "info",
            "type": "page",
            "path": "info.html"
        },
        
        
        {
            "name": "video",
            "children": [
                {
                    "name": "hotvideo",
                    "type": "video",
                    "path": "iFLHVWLlnOQ"
                },
                {
                    "name": "list",
                    "type": "videolist",
                    "path": "etiMil0_4Jw,BuszZcWJ6as"
                }
            ]
        },
        {
            "name": "list",
            "children": [
                {
                    "name": "kpoplistA",
                    "type": "list",
                    "path": "lista"
                },
                {
                    "name": "listb",
                    "type": "list",
                    "path": "listb"
                }
            ]
        },


        {
            "name": "itemsample",
            "children": [
                {
                    "name": "My4Vt3lQ1ac",
                    "type": "item",
                    "path": "25021113/My4Vt3lQ1ac"
                },
                {
                    "name": "MN2RlOy8y8k",
                    "type": "item",
                    "path": "25021315/MN2RlOy8y8k"
                },
                {
                    "name": "YvQiZqUOP1M",
                    "type": "item",
                    "path": "25021105/YvQiZqUOP1M"
                },


                {
                    "name": "oEAis-uYTw8",
                    "type": "item",
                    "path": "25021020/oEAis-uYTw8"
                }
            ]
        },


        
        {
            "name": "about",
            "type": "page",
            "path": "about.html"
        }


        
    ];

    function buildNavHtml(items, parentId = '') {
        let html = '<ul class="tree">';
        
        items.forEach((item, index) => {
            const currentId = parentId ? `${parentId}-${index}` : `${index}`;
            
            html += '<li';
            const classList = [];
            if (item.children) {
                classList.push('has-children');
            }
            if (classList.length) {
                html += ` class="${classList.join(' ')}" data-id="${currentId}"`;
            }
            html += '>';
            
            if (item.type) {
                // 内容节点
                html += `<span onclick="gotoonclick('/${item.type}/${item.path}')">${item.name}</span>`;
            } else {
                // 目录节点
                html += `<span onclick="navonclick('${currentId}')">${item.name}</span>`;
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
