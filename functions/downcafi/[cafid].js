import { B2 } from '@backblaze/b2-js';

export async function onRequest(context) {

// Configuration
const B2_APPLICATION_KEY_ID = '004a21f0da92b3f0000000001';
const B2_APPLICATION_KEY = 'K004F5JCCj3VMDraFDRlPRruHdbssJE';
const B2_BUCKET_NAME = 'b2tube';


try {
    const b2 = new B2({
      applicationKeyId: B2_APPLICATION_KEY_ID,
      applicationKey: B2_APPLICATION_KEY
    });

    let videoKey = context.params.cafid ; 

    // Authenticate with B2
    await b2.authorize();
    
    const downloadAuth = await b2.getDownloadAuthorization({
      bucketName: B2_BUCKET_NAME,
      fileNamePrefix: videoKey, // 使用 key 而不是 originalFileName
      validDurationInSeconds: 3600 // URL valid for 1 hour
    });
  
    const downloadUrl = 
        `${downloadAuth.downloadUrl}/file/${B2_BUCKET_NAME}/${key}?authorization=${downloadAuth.authorizationToken}`; 

    
   const headers = new Headers({
    'Location': downloadUrl 
    // This header tells browsers to download the file instead of displaying it
   });
  
  // Return a redirect response that will trigger the download with custom filename
  return new Response(null, {
    status: 302, // Temporary redirect
    headers: headers
  });
} catch (error) {

      return new Response(JSON.stringify({ error: 'Failed make b2 url '   }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
      
}


 
