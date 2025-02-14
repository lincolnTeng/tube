export async function onRequest(context) {

   const [timedir, vid]   = context.params.dayid ;
   //  re = "this is a string " ; ` `;
   let re  = ` path is  ${timedir} to ${vid} .....  `;
   let fetchpath = `/space/${timedir}/${vid}.pjson`;/*
   const fetchre  = await fetch ( fetchpath );
    const pjson = await fetchre.json();
   const { info , tracks }  = pjson ;
   const { title, channel,upload_date,duration,view_count } = info ;
    re += `<div class= 'video-profile'> ` ; 
    re += ` <div class= 'video-thumb'> <span >thunb </span></div> ` ; 

    re += ` <div class= 'video-info'>` ; 
    re += ` <h6 class= 'video-title'> ${title}  </h6>` ; 
    re += " <div class='video-details' > " ; 
    re += " <span class='vviews'> <i class='bi bi-broadcast'> </i> {$inf['channel']}</span>" ;
    re += " <span class='vviews'> <i class='bi bi-eye'> </i> {$inf['view_count']}</span>"; 
    re += " <span class='vviews'> <i class='bi bi-clock'> </i> {$inf['duration']}</span>"; 
    re += " <span class='vviews'> <i class='bi bi-calendar'> </i> {$inf['upload_date']}</span>" ; 

    re += "</div></div></div>" ; 

   */
    

   
    return new Response(
         re , {
          headers: { 'Content-Type': 'text/html;charset=UTF-8' },
        }
    );


  
}
