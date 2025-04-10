 export async function onRequest(context) {
  // Configuration
  const B2_APPLICATION_KEY_ID = '004a21f0da92b3f0000000001';
  const B2_APPLICATION_KEY = 'K004F5JCCj3VMDraFDRlPRruHdbssJE';
  const B2_BUCKET_NAME = 'b2tube';
  const B2_ENDPOINT = 's3.us-west-004.backblazeb2.com'; // Your B2 S3 Endpoint
  const B2_REGION = 'us-west-004'; // Region (required, but doesn't strictly matter for B2)
 const { AwsClient } = require('aws4fetch'); 
  try {
    const aws = new AwsClient({
      accessKeyId: B2_APPLICATION_KEY_ID,
      secretAccessKey: B2_APPLICATION_KEY,
      region: B2_REGION,
    });

    let [timekey,videoKey] = context.params.cafid;

    // Construct the URL
    const url = `https://${B2_ENDPOINT}/${B2_BUCKET_NAME}/${timekey}/${videoKey}`;


    // Sign the request using aws4fetch
    const signedResponse = await aws.fetch(url);
    //const signedResponse = await aws.sign(url);
    if (!signedResponse.ok) {
      console.error("Error fetching signed URL:", signedResponse.status, signedResponse.statusText);
      return new Response(JSON.stringify({ error: 'Failed to get signed URL', status: signedResponse.status, statusText: signedResponse.statusText }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const signedUrl = signedResponse.url; // The signed URL is now in response.url

    const jsonResponse = {
      durl: signedUrl, // durl property containing the signed URL
    };

    // Return JSON response
    return new Response(JSON.stringify(jsonResponse), {
      status: 200, // OK status
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache' // Prevent caching of the URL
      },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: 'Failed to generate signed URL', details: error.message }), {
      status: 500, // Internal Server Error
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
