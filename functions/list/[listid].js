export async function onRequest(context) {
       const listid   = context.params.listid ;
       let listjson ={} ;  
       const p = "https://tube.bayx.uk/data/"+listid +".list";
   try{
   
       const fetchre = await fetch( p ) ; 

    
       if( fetchre.ok ) {
           listjson = await fetchre.json() ;
       }
       else {
           return new Response( `bad list fetch ${listid}`, {
                    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
            });
       }
       //   listjson = { "title":"sometitle", "items":[ {"id":"id1"} , {"id":"id2"} ] } ;
      let re = `<div>   <div> list title : ${listjson["title"]} </div>` ;

      for (const item of listjson.items) {
          let fi = await fetch(`https://tube.bayx.uk/item/${item['path']}/${item['id']}`) ;
          let itemdiv = await fi.json() ;
          re += `<div id="${item['id']}" > ${itemdiv}   </div> ` ; 
      
      } ; 
    
      re += "</div>" ; 
      return new Response( re ,  {
           headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      });

 } catch (error) {
    //  console.error('Error parsing FormData:', error);
      return new Response(JSON.stringify({ error: 'Failed to parse form data ', 'p':p,'listid':listid, 'listjson': listjson  }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
 }
     
}
