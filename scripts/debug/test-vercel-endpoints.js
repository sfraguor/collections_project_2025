#!/usr/bin/env node

/**
 * Script simple para probar solo los endpoints de Vercel (sin eBay API)
 * Ejecuta: node test-vercel-endpoints.js
 */

const fetch = require('node-fetch');

console.log('🧪 === PRUEBA DE ENDPOINTS VERCEL ===');
console.log('');

/**
 * Test del endpoint OAuth de eBay
 */
const testOAuthEndpoint = async () => {
  console.log('🔗 Probando endpoint OAuth de eBay...');
  
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
const runVercelTests = async () => {
  console.log('🚀 Iniciando pruebas de endpoints Vercel...\n');
  
  const results = {
    complianceEndpoint: await testComplianceEndpoint(),
    oauthEndpoint: await testOAuthEndpoint()
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE PRUEBAS VERCEL');
  console.log('='.repeat(60));
  
  console.log(`Compliance Endpoint: ${results.complianceEndpoint.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`OAuth Endpoint: ${results.oauthEndpoint.success ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = results.complianceEndpoint.success && results.oauthEndpoint.success;
  
  console.log('\n' + (allPassed ? '🎉 TODOS LOS ENDPOINTS FUNCIONAN' : '⚠️ ALGUNOS ENDPOINTS FALLARON'));
  
  if (allPassed) {
    console.log('\n🔗 URLs para eBay Developer Console:');
    console.log('📋 Compliance Endpoint: https://collections-project-2025.vercel.app/api/ebay-endpoint');
    console.log('🔗 OAuth Redirect URL: https://collections-project-2025.vercel.app/api/ebay-oauth');
  }
  
  return results;
};

// Ejecutar pruebas
if (require.main === module) {
  runVercelTests()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { testOAuthEndpoint, testComplianceEndpoint };