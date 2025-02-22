export async function onRequest(context) {
  let ws ='w' ;
  let vid ;
  const formData = await context.request.json()  ;
  const vurl = formData.videourl ; //  vurl 
  
  try {

 
    
      if( vurl .includes( 'youtube.com/')  ) {
              strspl  = vurl.split('youtube.com/') ;
              pubturl = strspl[1]  ;

              if( pubturl .includes('watch?v=' ) ) {
                  vid = pubturl.split('watch?v=')[1] ;
                  ws = 'w' ;
               }


              if( pubturl .includes('shorts/') ) {
                    vid = pubturl.split('shorts/')[1] ;
                    ws = 's' ;
              }


        }
      
       re = await  fetch('http://148.135.115.48/pool/prof/'+ ws+'@'+vid+'@if') ; 
          
       return new Response(
         re , {  headers: { 'Content-Type': 'text/html;charset=UTF-8' },    }
       );

  
    } catch (error) {
    //  console.error('Error parsing FormData:', error);
      return new Response(JSON.stringify({ error: 'Failed to parse form data ','vurl': vurl   }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
     
}
