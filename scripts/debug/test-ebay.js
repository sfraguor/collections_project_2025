#!/usr/bin/env node

/**
 * Script de prueba para verificar que la integración con eBay funciona correctamente
 * Ejecuta: node test-ebay.js
 */

const fs = require('fs');
const path = require('path');

// Simular el entorno de React Native
global.console = console;
global.fetch = require('node-fetch');

// Importar el servicio eBay (adaptado para Node.js)
const EBAY_ENVIRONMENT = 'sandbox'; // 🧪 SANDBOX MODE for testing
const EBAY_SANDBOX_APP_ID = 'SergioFr-Collecti-SBX-26e85ef25-c81e5fd3';
const EBAY_PRODUCTION_APP_ID = 'SergioFr-Collecti-PRD-36e4180bf-6f605e3e';
const EBAY_APP_ID = EBAY_ENVIRONMENT === 'production' ? EBAY_PRODUCTION_APP_ID : EBAY_SANDBOX_APP_ID;
const EBAY_FINDING_API_URL = EBAY_ENVIRONMENT === 'production'
  ? 'https://svcs.ebay.com/services/search/FindingService/v1'
  : 'https://svcs.sandbox.ebay.com/services/search/FindingService/v1';

console.log('🧪 === PRUEBA DE INTEGRACIÓN eBay ===');
console.log(`🏷️ Entorno: ${EBAY_ENVIRONMENT.toUpperCase()}`);
console.log(`🔑 App ID: ${EBAY_APP_ID.substring(0, 15)}...`);
console.log('');

/**
 * Test de conexión eBay API
 */
const testEbayConnection = async () => {
  console.log('📡 Probando conexión a eBay API...');
  
  try {
    const searchTerms = 'iPhone 13 128GB'; // Búsqueda más específica
    console.log(`🔍 Buscando: "${searchTerms}"`);
    
    const params = new URLSearchParams({
      'OPERATION-NAME': 'findItemsByKeywords',
      'SERVICE-VERSION': '1.0.0',
      'SECURITY-APPNAME': EBAY_APP_ID,
      'GLOBAL-ID': 'EBAY-US',
      'RESPONSE-DATA-FORMAT': 'JSON',
      'REST-PAYLOAD': '',
      'keywords': searchTerms,
      'paginationInput.entriesPerPage': '3', // Reducido para evitar rate limits
      'sortOrder': 'PricePlusShipping',
      'itemFilter(0).name': 'Condition',
      'itemFilter(0).value(0)': 'New',
      'itemFilter(0).value(1)': 'Used',
      'itemFilter(1).name': 'MinPrice',
      'itemFilter(1).value': '50', // Precio mínimo más alto para mejores resultados
      'itemFilter(1).paramName': 'Currency',
      'itemFilter(1).paramValue': 'USD'
    });

    const startTime = Date.now();
    const response = await fetch(`${EBAY_FINDING_API_URL}?${params.toString()}`);
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Verificar respuesta
    if (data.findItemsByKeywordsResponse?.[0]?.ack?.[0] === 'Failure') {
      const errorMessage = data.findItemsByKeywordsResponse?.[0]?.errorMessage?.[0]?.error?.[0]?.message?.[0];
      throw new Error(`eBay API Error: ${errorMessage}`);
    }
    
    const searchResult = data.findItemsByKeywordsResponse?.[0]?.searchResult?.[0];
    const items = searchResult?.item || [];
    
    console.log('✅ Conexión eBay API: EXITOSA');
    console.log(`⏱️  Tiempo de respuesta: ${responseTime}ms`);
    console.log(`📦 Items encontrados: ${items.length}`);
    
    if (items.length > 0) {
      console.log('\n📋 Muestra de resultados:');
      items.slice(0, 3).forEach((item, index) => {
        const title = item.title?.[0] || 'Sin título';
        const price = item.sellingStatus?.[0]?.currentPrice?.[0]?.__value__ || '0';
        const currency = item.sellingStatus?.[0]?.currentPrice?.[0]?.['@currencyId'] || 'USD';
        const condition = item.condition?.[0]?.conditionDisplayName?.[0] || 'Unknown';
        
        console.log(`  ${index + 1}. ${title.substring(0, 50)}...`);
        console.log(`     💰 Precio: ${price} ${currency} | Condición: ${condition}`);
      });
      
      // Calcular precio promedio
      const validPrices = items
        .map(item => parseFloat(item.sellingStatus?.[0]?.currentPrice?.[0]?.__value__ || '0'))
        .filter(price => price > 0);
      
      if (validPrices.length > 0) {
        const avgPrice = validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length;
        const minPrice = Math.min(...validPrices);
        const maxPrice = Math.max(...validPrices);
        
        console.log('\n📊 Análisis de precios:');
        console.log(`   💵 Precio promedio: $${avgPrice.toFixed(2)}`);
        console.log(`   📉 Precio mínimo: $${minPrice.toFixed(2)}`);
        console.log(`   📈 Precio máximo: $${maxPrice.toFixed(2)}`);
      }
    }
    
    return {
      success: true,
      responseTime,
      itemCount: items.length,
      data: items.slice(0, 3)
    };
    
  } catch (error) {
    console.log('❌ Error en conexión eBay API:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Test del endpoint OAuth de eBay
 */
const testOAuthEndpoint = async () => {
  console.log('\n🔗 Probando endpoint OAuth de eBay...');
  
  try {
    const endpointUrl = 'https://collections-project-2025.vercel.app/api/ebay-oauth';
    
    console.log(`🌐 URL: ${endpointUrl}`);
    
    const startTime = Date.now();
    const response = await fetch(endpointUrl);
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }
    
    const responseText = await response.text();
    
    // Verificar que es HTML válido y contiene contenido esperado
    if (responseText.includes('eBay OAuth Redirect Endpoint') && 
        responseText.includes('Ready for eBay Developer Console')) {
      console.log('✅ Endpoint OAuth: FUNCIONANDO');
      console.log(`⏱️  Tiempo de respuesta: ${responseTime}ms`);
      console.log('🔗 Landing page configurada correctamente');
      
      return {
        success: true,
        responseTime,
        contentLength: responseText.length
      };
    } else {
      throw new Error('Respuesta no contiene contenido esperado');
    }
    
  } catch (error) {
    console.log('❌ Error en endpoint OAuth:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};
/**
 * Test del endpoint de compliance
 */
const testComplianceEndpoint = async () => {
  console.log('\n🔐 Probando endpoint de compliance...');
  
  try {
    const testChallengeCode = `TEST_${Date.now()}`;
    const endpointUrl = `https://collections-project-2025.vercel.app/api/ebay-endpoint?challenge_code=${testChallengeCode}`;
    
    console.log(`🌐 URL: ${endpointUrl}`);
    
    const startTime = Date.now();
    const response = await fetch(endpointUrl);
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }
    
    const responseText = await response.text();
    
    try {
      const jsonResponse = JSON.parse(responseText);
      
      if (jsonResponse.challengeResponse) {
        console.log('✅ Endpoint de compliance: FUNCIONANDO');
        console.log(`⏱️  Tiempo de respuesta: ${responseTime}ms`);
        console.log(`🔐 Challenge response generado: ${jsonResponse.challengeResponse.substring(0, 16)}...`);
        
        return {
          success: true,
          responseTime,
          challengeResponse: jsonResponse.challengeResponse
        };
      } else {
        throw new Error('Respuesta JSON no contiene challengeResponse');
      }
      
    } catch (parseError) {
      throw new Error(`Error parsing JSON: ${parseError.message}`);
    }
    
  } catch (error) {
    console.log('❌ Error en endpoint de compliance:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Ejecutar todas las pruebas
 */
const runAllTests = async () => {
  console.log('🚀 Iniciando suite de pruebas...\n');
  
  const results = {
    ebayAPI: await testEbayConnection(),
    complianceEndpoint: await testComplianceEndpoint(),
    oauthEndpoint: await testOAuthEndpoint()
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log('='.repeat(60));
  
  console.log(`eBay API: ${results.ebayAPI.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Compliance Endpoint: ${results.complianceEndpoint.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`OAuth Endpoint: ${results.oauthEndpoint.success ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = results.ebayAPI.success && results.complianceEndpoint.success && results.oauthEndpoint.success;
  
  console.log('\n' + (allPassed ? '🎉 TODAS LAS PRUEBAS PASARON' : '⚠️ ALGUNAS PRUEBAS FALLARON'));
  console.log(allPassed ? '✅ Tu integración eBay está lista para producción!' : '❌ Revisa los errores arriba');
  
  return results;
};

// Ejecutar pruebas
if (require.main === module) {
  runAllTests()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { testEbayConnection, testComplianceEndpoint, testOAuthEndpoint };
