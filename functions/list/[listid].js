export async function onRequest(context) {
       const listid   = context.params.listid ;
       const fetchre = await fetch( `https://tube.bayx.uk/data/${listid}.list`) ; 
       let listjson ={} ; 
    
       if( fetchre.ok ) 
           listjson = fetchre.json() ;
       else 
           return new Response( `bad list fetch ${listid}`, {
                    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
            });
      let re = `<div>   <div> list title : ${listjson.title} </div>` ;

      for (const item of listjson.items) {
       
          re += `<div id="${item.id}" > <script > re = await fetch("/item/${item.id}"); pr= await re.json();  print( pr );</script> </div> ` ; 
      
      } ; 
    
      re += "</div>" ; 
      return new Response( re ,  {
           headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      });
     
}
