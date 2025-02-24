export async function onRequest(context) {
  
  let fid = context.param.cafid ; 
 
  const formData = await context.request.json()  ;
  const vurl = formData.videourl ; //  vurl 
  
  try {
    
      if( vurl .includes( 'youtube.com/')  ) {
              let strspl  = vurl.split('youtube.com/') ;
              let pubturl = strspl[1]  ;

              if( pubturl .includes('watch?v=' ) ) {
                  vid = pubturl.split('watch?v=')[1] ;
                  ws = 'w' ;
               }


              if( pubturl .includes('shorts/') ) {
                    vid = pubturl.split('shorts/')[1] ;
                    ws = 's' ;
              }


        }
       pcode = ws + '@' + vid + '@if' ;
       let fetchre = await  fetch('http://pool.bayx.uk/pyapp/pool/prof/'+pcode ) ; 
       let re = await fetchre.text();
       return new Response(
         re , {  headers: { 'Content-Type': 'text/html;charset=UTF-8' },    }
       );

  
    } catch (error) {
    //  console.error('Error parsing FormData:', error);
      return new Response(JSON.stringify({ error: 'Failed to parse form data ','vurl': vurl ,
        'pcode':pcode , 'ws':ws, 'vid': vid                                 }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
     
}
