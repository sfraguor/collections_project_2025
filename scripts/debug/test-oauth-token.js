#!/usr/bin/env node

/**
 * Test del User Token OAuth de eBay
 * Ejecuta: node test-oauth-token.js <TOKEN>
 */

const fetch = require('node-fetch');

if (process.argv.length < 3) {
  console.log('❌ Uso: node test-oauth-token.js <EBAY_USER_TOKEN>');
  console.log('');
  console.log('Ejemplo:');
  console.log('node test-oauth-token.js v^1#i#*i#r*O#f*O#fp...');
  process.exit(1);
}

const userToken = process.argv[2];

console.log('🧪 === TEST OAUTH USER TOKEN ===');
console.log('');
console.log('🔑 Token length:', userToken.length, 'characters');
console.log('🔑 Token preview:', userToken.substring(0, 50) + '...');
console.log('');

/**
 * Test del token con Trading API (getUserAccount)
 */
const testUserAccount = async () => {
  console.log('👤 Probando getUserAccount con Trading API...');
  
  try {
    const tradingApiUrl = 'https://api.ebay.com/ws/api.dll';
    
    const xmlRequest = `<?xml version="1.0" encoding="utf-8"?>
<GetAccountRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <eBayAuthToken>${userToken}</eBayAuthToken>
  </RequesterCredentials>
  <Version>1131</Version>
  <AccountEntrySortType>AccountEntryCreatedTimeAscending</AccountEntrySortType>
  <AccountHistorySelection>LastInvoice</AccountHistorySelection>
</GetAccountRequest>`;

    const response = await fetch(tradingApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml',
        'X-EBAY-API-COMPATIBILITY-LEVEL': '1131',
        'X-EBAY-API-CALL-NAME': 'GetAccount',
        'X-EBAY-API-SITEID': '0'
      },
      body: xmlRequest
    });

    const responseText = await response.text();
    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      if (responseText.includes('<Ack>Success</Ack>')) {
        console.log('✅ Token OAuth válido - Trading API responde correctamente');
        
        // Extraer información básica del usuario
        const userIdMatch = responseText.match(/<UserID>([^<]+)<\/UserID>/);
        const userEmailMatch = responseText.match(/<Email>([^<]+)<\/Email>/);
        
        if (userIdMatch) {
          console.log('👤 User ID:', userIdMatch[1]);
        }
        if (userEmailMatch) {
          console.log('📧 Email:', userEmailMatch[1]);
        }
        
        return { success: true, api: 'Trading', userToken: userToken.substring(0, 20) + '...' };
      } else {
        console.log('❌ Token inválido o problema de autorización');
        console.log('Response preview:', responseText.substring(0, 500) + '...');
        return { success: false, error: 'Token inválido' };
      }
    } else {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
  } catch (error) {
    console.log('❌ Error en Trading API:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Test del token con Buy API (getUserAccount)
 */
const testBuyAPI = async () => {
  console.log('\n🛒 Probando Buy API...');
  
  try {
    const buyApiUrl = 'https://api.ebay.com/buy/browse/v1/item_summary/search?q=iphone&limit=3';
    
    const response = await fetch(buyApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
      }
    });

    console.log('📡 Response status:', response.status);
    const responseText = await response.text();
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      if (data.itemSummaries && data.itemSummaries.length > 0) {
        console.log('✅ Buy API funciona correctamente');
        console.log(`📦 Found ${data.itemSummaries.length} items`);
        console.log(`🔍 First item: ${data.itemSummaries[0].title.substring(0, 50)}...`);
        return { success: true, api: 'Buy' };
      } else {
        console.log('⚠️ Buy API responde pero sin items');
        return { success: false, error: 'No items found' };
      }
    } else {
      console.log('❌ Buy API error:', responseText.substring(0, 200));
      return { success: false, error: `HTTP ${response.status}` };
    }
    
  } catch (error) {
    console.log('❌ Error en Buy API:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Ejecutar todas las pruebas
 */
const runTokenTests = async () => {
  console.log('🚀 Iniciando pruebas de User Token...\n');
  
  const results = {
    tradingAPI: await testUserAccount(),
    buyAPI: await testBuyAPI()
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE PRUEBAS OAuth TOKEN');
  console.log('='.repeat(60));
  
  console.log(`Trading API: ${results.tradingAPI.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Buy API: ${results.buyAPI.success ? '✅ PASS' : '❌ FAIL'}`);
  
  const anyPassed = results.tradingAPI.success || results.buyAPI.success;
  
  if (anyPassed) {
    console.log('\n🎉 TOKEN OAUTH VÁLIDO Y FUNCIONANDO');
    console.log('✅ Tu integración OAuth con eBay está lista');
    console.log('\n💡 Próximo paso: Integrar este flujo en tu app React Native');
  } else {
    console.log('\n❌ PROBLEMAS CON EL TOKEN');
    console.log('🔧 Verifica que el token esté completo y no haya expirado');
  }
  
  return results;
};

// Ejecutar pruebas
if (require.main === module) {
  runTokenTests()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { testUserAccount, testBuyAPI };