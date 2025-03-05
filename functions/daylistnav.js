// functions/nav.js
export async function onRequest(context) {
    


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
                if( item.type === 'link' ){
                html += `<a href=${item.path} > <span >${item.name}</span></a>`;
                    
                }
                    
                 else  {// 内容节点
                html += `<span onclick="gotoonclick('/${item.type}/${item.path}')">${item.name}</span>`;
                 }
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
    const res  = await fetch("/space/daynav.json") ;
    let nav  ; 
    if( res.ok)  nav = await res.json() ; 
    const navHtml = buildNavHtml(nav);
    return new Response(navHtml, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
}
