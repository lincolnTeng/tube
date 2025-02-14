export async function onRequest(context) {

   const [timedir, vid]   = context.params.dayid ;
   //  re = "this is a string " ; ` `;
   let re  = ` path is  ${timedir} to ${vid} .....  `;

   let re = ''' .video-profile {
    width: 500px;
    border: 2px solid #0d6efd;
    border-radius: 10px;
    overflow: hidden;
    display: flex;
    align-items: center;
}
.video-thumb {
    width: 160px;
    height: 90px;
    background-color: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6c757d;
}
.video-info {
    flex: 1;
    padding: 12px;
}
.video-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 6px;
    overflow-wrap: break-word;
}
.video-details {
    font-size: 14px;
    color: #6c757d;
    display: flex;
    justify-content: space-between;
}
.video-details span {
    padding: 4px 8px;
    border-radius: 4px;
}
.video-details .vchannel {
    background-color: #e3f2fd;
}
.video-details .vviews {
    background-color: #e6ffed;
}
.video-details .vduration {
    background-color: #fff3e0;
}
.video-details .vupdate {
    background-color: #f4f4f4;
}
.video-details i {
    font-size: 12px;
    margin-right: 4px;
}  ''' ; 


   


   
   let fetchpath = `https://tube.bayx.uk/space/${timedir}/${vid}.pjson`;
   const fetchre  = await fetch ( fetchpath );
    const pjson = await fetchre.json();
   const { info , tracks }  = pjson ;
   const { title, channel,upload_date,duration,view_count } = info ;
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
