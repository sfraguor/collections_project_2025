// Netlify Function for eBay verification and notifications
// Save this as: netlify/functions/ebay-endpoint.js

exports.handler = async (event, context) => {
  console.log('eBay endpoint called:', event.httpMethod, event.queryStringParameters);
  
  // Handle GET requests (verification)
  if (event.httpMethod === 'GET') {
    const { challenge, verify_token } = event.queryStringParameters || {};
    
    if (challenge) {
      console.log('eBay verification challenge received:', challenge);
      
      // Return just the challenge value for verification
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/plain',
        },
        body: challenge
      };
    }
    
    // Default GET response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: `
        <!DOCTYPE html>
        <html>
        <head><title>eBay Endpoint - Colecciones App</title></head>
        <body>
          <h1>eBay Marketplace Account Deletion Notification Endpoint</h1>
          <p>This endpoint is active and configured for Colecciones App.</p>
          <p>Privacy Policy and Terms of Service are handled through this endpoint.</p>
        </body>
        </html>
      `
    };
  }
  
  // Handle POST requests (account deletion notifications)
  if (event.httpMethod === 'POST') {
    const body = event.body;
    console.log('eBay account deletion notification received:', body);
    
    // Process the notification (log it for now)
    // In a real scenario, you'd handle the account deletion here
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'received',
        message: 'Account deletion notification processed successfully'
      })
    };
  }
  
  // Handle other methods
  return {
    statusCode: 405,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};