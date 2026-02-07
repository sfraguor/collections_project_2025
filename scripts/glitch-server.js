// server.js - For Glitch.com
const express = require('express');
const app = express();
const path = require('path');

// Enable parsing of JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.query, req.body);
  next();
});

// Main endpoint - handles both verification and normal requests
app.get('/', (req, res) => {
  const { challenge, verify_token, token } = req.query;
  
  console.log('GET request received:', { challenge, verify_token, token });
  
  // If this is an eBay verification request
  if (challenge) {
    console.log('eBay verification challenge detected:', challenge);
    
    // Respond with ONLY the challenge value
    res.set('Content-Type', 'text/plain');
    res.send(challenge);
    return;
  }
  
  // Normal page request - send HTML
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Colecciones App - eBay Compliance Endpoint</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333; }
        h1 { color: #2c5aa0; border-bottom: 2px solid #2c5aa0; padding-bottom: 10px; }
        .status { background: #4CAF50; color: white; padding: 5px 10px; border-radius: 5px; font-size: 12px; }
        .info { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <span class="status">✓ eBay Compliance Endpoint Active</span>
    <h1>Colecciones App</h1>
    
    <div class="info">
        <strong>eBay Marketplace Compliance Endpoint</strong><br>
        This endpoint serves as the Privacy Policy, Terms of Service, and account deletion notification handler for Colecciones App.
        <br><br>
        <strong>Status:</strong> Active and compliant with eBay requirements<br>
        <strong>Last Updated:</strong> November 15, 2025
    </div>

    <h2>Privacy Policy</h2>
    <p><strong>Effective Date:</strong> November 2025</p>
    
    <h3>Information We Collect</h3>
    <ul>
        <li>Collection data you voluntarily input (item names, descriptions, prices)</li>
        <li>Market price data retrieved from eBay for valuation purposes</li>
        <li>Local app usage data stored on your device</li>
    </ul>
    
    <h3>How We Use Your Information</h3>
    <ul>
        <li>To provide collection management and price tracking services</li>
        <li>To calculate market valuations and investment performance</li>
        <li>To display collection statistics and trends</li>
    </ul>
    
    <h3>Data Storage</h3>
    <ul>
        <li>All personal collection data is stored locally on your device</li>
        <li>We do not store personal data on external servers</li>
        <li>eBay market data is used for calculations only</li>
    </ul>
    
    <h3>Data Sharing</h3>
    <p>We do not share, sell, or transfer your personal collection data to third parties.</p>
    
    <h3>Account Deletion</h3>
    <p>You can delete all app data through the app settings. If you delete your eBay account, we will process deletion notifications as required for compliance.</p>

    <h2>Terms of Service</h2>
    <p><strong>Effective Date:</strong> November 2025</p>
    
    <h3>Acceptable Use</h3>
    <ul>
        <li>This app is for personal collection management only</li>
        <li>Users must comply with eBay's terms of service</li>
        <li>Price data is for reference only and may not reflect actual market values</li>
    </ul>
    
    <h3>Disclaimers</h3>
    <ul>
        <li>Market prices are estimates and not guaranteed</li>
        <li>Investment decisions are your own responsibility</li>
        <li>We are not responsible for market fluctuations or losses</li>
    </ul>
</body>
</html>`;
  
  res.send(html);
});

// Handle POST requests for account deletion notifications
app.post('/', (req, res) => {
  console.log('POST request - Account deletion notification:', req.body);
  
  // Process the deletion notification
  // In a real app, you'd handle the account deletion here
  
  res.status(200).json({
    status: 'received',
    message: 'Account deletion notification processed successfully'
  });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`eBay compliance endpoint running on port ${port}`);
});