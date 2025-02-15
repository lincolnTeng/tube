export async function onRequest(context) {

   const [timedir, vid]   = context.params.dayid ;
   //  re = "this is a string " ; ` `;
   let re  = ` `;

     re +=   `  <div class="panel-heading border"> `;
     re +=  `    <h4 class="panel-title bg-secondary">  ${timedir}||${vid} </h4>  </div>`; 

   
   let fetchpath = `https://tube.bayx.uk/space/${timedir}/${vid}.pjson`;
   const fetchre  = await fetch ( fetchpath );
    const pjson = await fetchre.json();
   const { info , tracks }  = pjson ;
   const { title, channel,upload_date,duration,view_count } = info ;

    re += ` <div class="col-md-6"><iframe src = "https://www.youtube.com/embed/${vid}?width=600" allowfullscreen> `;
   
    re += `</iframe> </div>`;   
   
   re += `<div class= 'video-profile'> ` ; 
 

    re += ` <div class= 'video-thumb'> <span >thunb </span></div> ` ; 

    re += ` <div class= 'video-info'>` ; 
    re += ` <h6 class= 'video-title'> ${title}  </h6>` ; 
    re += ` <div class='video-details' > `; 
   
    re += ` <span class='vviews'> <i class='bi bi-broadcast'> </i> ${channel}</span>` ;
    re += ` <span class='vviews'> <i class='bi bi-eye'> </i> ${view_count}</span>`; 
    re += ` <span class='vviews'> <i class='bi bi-clock'> </i> ${duration}</span>`; 
    re += ` <span class='vviews'> <i class='bi bi-calendar'> </i> ${upload_date}</span>` ; 

    re += `</div></div></div>` ; 

   
    

   
    return new Response(
         re , {
          headers: { 'Content-Type': 'text/html;charset=UTF-8' },
        }
    );


  
}
