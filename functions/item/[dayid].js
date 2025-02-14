export async function onRequest(context) {
   
    return new Response(
        JSON.stringify(context.params.dayid), {
          headers: { 'Content-Type': 'text/html;charset=UTF-8' },
        }
    );


  
}
