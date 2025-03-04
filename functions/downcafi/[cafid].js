export async function onRequest(context) {
  const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
  const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

  // Configuration
  const B2_APPLICATION_KEY_ID = '004a21f0da92b3f0000000001'; // or S3 Access Key ID
  const B2_APPLICATION_KEY = 'K004F5JCCj3VMDraFDRlPRruHdbssJE'; // or S3 Secret Access Key
  const B2_BUCKET_NAME = 'b2tube';
  const B2_ENDPOINT = 's3.us-west-004.backblazeb2.com'; // Replace with your B2 S3 endpoint region!


  try {

    const s3Client = new S3Client({
      endpoint: `https://${B2_ENDPOINT}`, //  Backblaze B2 S3 endpoint
      region: 'us-west-004', // or your specific region
      credentials: {
        accessKeyId: B2_APPLICATION_KEY_ID,
        secretAccessKey: B2_APPLICATION_KEY,
      },
      forcePathStyle: true, // Crucial for Backblaze B2
    });

    let videoKey = context.params.cafid;

    // Create command to get the object
    const command = new GetObjectCommand({
      Bucket: B2_BUCKET_NAME,
      Key: videoKey,
    });

    // Generate a presigned URL with a 1-hour expiration
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    const headers = new Headers({
      'Location': url,
    });

    // Return a redirect response
    return new Response(null, {
      status: 302, // Temporary redirect
      headers: headers,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: 'Failed to generate S3 presigned URL', details: error.message }), {
      status: 500, // Internal Server Error
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
