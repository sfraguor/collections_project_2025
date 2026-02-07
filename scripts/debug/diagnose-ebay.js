#!/usr/bin/env node

/**
 * Diagnostic script for eBay API production issues
 */

const fetch = require('node-fetch');

const EBAY_PRODUCTION_APP_ID = 'SergioFr-Collecti-PRD-36e4180bf-6f605e3e';
const EBAY_FINDING_API_URL = 'https://svcs.ebay.com/services/search/FindingService/v1';

console.log('🔍 DIAGNÓSTICO DETALLADO DE eBay API');
console.log('='.repeat(60));
console.log('');

const diagnoseAuthentication = async () => {
  console.log('🔑 PRUEBA 1: Verificación de Autenticación');
  console.log('─'.repeat(60));
  
  const params = new URLSearchParams({
    'OPERATION-NAME': 'findItemsByKeywords',
    'SERVICE-VERSION': '1.0.0',
    'SECURITY-APPNAME': EBAY_PRODUCTION_APP_ID,
    'GLOBAL-ID': 'EBAY-US',
    'RESPONSE-DATA-FORMAT': 'JSON',
    'keywords': 'test'
  });
  
  try {
    console.log(`📤 Enviando request a eBay...`);
    console.log(`🔑 App ID: ${EBAY_PRODUCTION_APP_ID.substring(0, 20)}...`);
    
    const response = await fetch(`${EBAY_FINDING_API_URL}?${params.toString()}`);
    const responseText = await response.text();
    
    console.log(`📥 Status Code: ${response.status}`);
    console.log('');
    
    if (response.status === 500) {
      try {
        const errorData = JSON.parse(responseText);
        
        console.log('❌ ERROR DETECTADO:');
        console.log('─'.repeat(60));
        
        if (errorData.errorMessage) {
          const error = errorData.errorMessage[0].error[0];
          const errorId = error.errorId[0];
          const errorMsg = error.message[0];
          const severity = error.severity[0];
          
          console.log(`🆔 Error ID: ${errorId}`);
          console.log(`📋 Mensaje: ${errorMsg}`);
          console.log(`⚠️  Severidad: ${severity}`);
          console.log('');
          
          // Specific error analysis
          if (errorId === '11002') {
            console.log('🚨 PROBLEMA IDENTIFICADO: App ID Inválido');
            console.log('');
            console.log('📌 CAUSAS POSIBLES:');
            console.log('   1. App ID no está activo en producción');
            console.log('   2. App ID fue suspendido o revocado');
            console.log('   3. App ID está en sandbox pero usando endpoint de producción');
            console.log('   4. Typo en el App ID');
            console.log('');
            console.log('🛠️  SOLUCIONES:');
            console.log('   1. Ir a: https://developer.ebay.com/my/applications');
            console.log('   2. Verificar que tu app esté "Active" (no suspended)');
            console.log('   3. Copiar el App ID exactamente como aparece');
            console.log('   4. Si está suspendida, contactar eBay Developer Support');
            console.log('   5. Puede que necesites crear una nueva aplicación');
            console.log('');
            console.log('📧 eBay Developer Support: developer@ebay.com');
            
          } else if (errorId === '10001') {
            console.log('🚨 PROBLEMA IDENTIFICADO: Rate Limit');
            console.log('');
            console.log('   Demasiadas peticiones. Espera 5 minutos.');
            
          } else {
            console.log(`🚨 Error desconocido: ${errorId}`);
            console.log(`   Mensaje completo: ${errorMsg}`);
          }
          
          console.log('');
          console.log('📄 Respuesta completa de eBay:');
          console.log(JSON.stringify(errorData, null, 2));
          
        } else {
          console.log('❌ Respuesta inesperada del servidor:');
          console.log(responseText);
        }
        
      } catch (parseError) {
        console.log('❌ No se pudo parsear la respuesta:');
        console.log(responseText);
      }
      
    } else if (response.status === 200) {
      console.log('✅ AUTENTICACIÓN EXITOSA');
      const data = JSON.parse(responseText);
      console.log('📦 Respuesta válida recibida');
      console.log(`🔍 ACK: ${data.findItemsByKeywordsResponse[0].ack[0]}`);
    }
    
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
  }
};

const testServerConnectivity = async () => {
  console.log('');
  console.log('🌐 PRUEBA 2: Conectividad con Servidores eBay');
  console.log('─'.repeat(60));
  
  try {
    const response = await fetch('https://www.ebay.com');
    console.log(`✅ eBay.com está accesible (Status: ${response.status})`);
  } catch (error) {
    console.log(`❌ No se puede conectar a eBay.com: ${error.message}`);
  }
  
  try {
    const response = await fetch('https://developer.ebay.com');
    console.log(`✅ Developer portal está accesible (Status: ${response.status})`);
  } catch (error) {
    console.log(`❌ No se puede conectar al portal de desarrolladores: ${error.message}`);
  }
};

const checkAppIdFormat = () => {
  console.log('');
  console.log('🔍 PRUEBA 3: Verificación del Formato del App ID');
  console.log('─'.repeat(60));
  
  const appId = EBAY_PRODUCTION_APP_ID;
  console.log(`App ID completo: ${appId}`);
  console.log(`Longitud: ${appId.length} caracteres`);
  
  // eBay production App IDs have a specific format
  const productionPattern = /^[a-zA-Z0-9]+-[a-zA-Z0-9]+-PRD-[a-f0-9]+-[a-f0-9]+$/;
  const sandboxPattern = /^[a-zA-Z0-9]+-[a-zA-Z0-9]+-SBX-[a-f0-9]+-[a-f0-9]+$/;
  
  if (productionPattern.test(appId)) {
    console.log('✅ Formato de App ID de PRODUCCIÓN válido');
  } else if (sandboxPattern.test(appId)) {
    console.log('⚠️  Este parece ser un App ID de SANDBOX, no PRODUCCIÓN');
  } else {
    console.log('❌ Formato de App ID no reconocido');
  }
  
  if (appId.includes('PRD')) {
    console.log('✅ Contiene marcador "PRD" (Production)');
  } else if (appId.includes('SBX')) {
    console.log('⚠️  Contiene marcador "SBX" (Sandbox)');
  }
};

const runDiagnostics = async () => {
  console.log('🚀 Iniciando diagnóstico completo...');
  console.log('');
  
  await testServerConnectivity();
  checkAppIdFormat();
  await diagnoseAuthentication();
  
  console.log('');
  console.log('='.repeat(60));
  console.log('✅ DIAGNÓSTICO COMPLETO');
  console.log('='.repeat(60));
  console.log('');
  console.log('📋 Próximos pasos recomendados:');
  console.log('   1. Revisar los mensajes de error arriba');
  console.log('   2. Verificar el estado de tu aplicación en eBay Developer Console');
  console.log('   3. Si necesitas ayuda, incluye el Error ID en tu consulta');
  console.log('');
};

if (require.main === module) {
  runDiagnostics()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { diagnoseAuthentication };
