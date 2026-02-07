#!/usr/bin/env node

/**
 * Detailed sandbox diagnostic
 */

const fetch = require('node-fetch');

const EBAY_SANDBOX_APP_ID = 'SergioFr-Collecti-SBX-26e85ef25-c81e5fd3';
const EBAY_FINDING_API_URL = 'https://svcs.sandbox.ebay.com/services/search/FindingService/v1'; // Note: SANDBOX URL

console.log('🔍 SANDBOX DIAGNOSTIC');
console.log('='.repeat(60));
console.log('App ID:', EBAY_SANDBOX_APP_ID);
console.log('Sandbox URL:', EBAY_FINDING_API_URL);
console.log('');

const testSandbox = async () => {
  const params = new URLSearchParams({
    'OPERATION-NAME': 'findItemsByKeywords',
    'SERVICE-VERSION': '1.0.0',
    'SECURITY-APPNAME': EBAY_SANDBOX_APP_ID,
    'GLOBAL-ID': 'EBAY-US',
    'RESPONSE-DATA-FORMAT': 'JSON',
    'keywords': 'test'
  });
  
  try {
    console.log('📤 Sending request to SANDBOX...');
    const response = await fetch(`${EBAY_FINDING_API_URL}?${params.toString()}`);
    const responseText = await response.text();
    
    console.log('📥 Status:', response.status);
    console.log('');
    
    if (response.status === 500) {
      try {
        const data = JSON.parse(responseText);
        const error = data.errorMessage?.[0]?.error?.[0];
        
        console.log('❌ ERROR DETAILS:');
        console.log('Error ID:', error?.errorId?.[0]);
        console.log('Message:', error?.message?.[0]);
        console.log('Domain:', error?.domain?.[0]);
        console.log('Subdomain:', error?.subdomain?.[0]);
        console.log('');
        console.log('Full response:');
        console.log(JSON.stringify(data, null, 2));
      } catch (e) {
        console.log('Raw response:', responseText);
      }
    } else if (response.status === 200) {
      console.log('✅ SUCCESS!');
      const data = JSON.parse(responseText);
      const result = data.findItemsByKeywordsResponse?.[0];
      console.log('ACK:', result?.ack?.[0]);
      const items = result?.searchResult?.[0]?.item || [];
      console.log('Items found:', items.length);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
};

testSandbox();
