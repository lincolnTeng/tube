export async function onRequest(context) {

   const [timedir, vid]   = context.params.dayid ;
   //  re = "this is a string " ; ` `;
   let re  = ` `;

     re += ` <div class="panel-heading  "> `;
     re += ` <h6 class="panel-title bg-secondary"> ${timedir}||${vid} </h6> </div>`; 

   
   let fetchpath = `https://tube.bayx.uk/space/${timedir}/${vid}.cfj`;
   const fetchre  = await fetch ( fetchpath );
    const cafiline = await fetchre.text();
   const [ track , fid ]  = cafiline.split('=') ;
 

    re += ` <div class="col-md-2">`;
         
    re += `<a href="/downcafi${fid}" download>`;
    re += `<span  class="badge bg-info">${track}</span></a>`;
    re += `</div>` ;    
    return new Response(
         re , {
          headers: { 'Content-Type': 'text/html;charset=UTF-8' },
        }
    );


  
}
