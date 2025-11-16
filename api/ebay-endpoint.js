// eBay Marketplace Account Deletion Endpoint - Vercel Function
// Este endpoint procesa los challenges de eBay correctamente

const crypto = require('crypto');

// Configuración de eBay (debe coincidir EXACTAMENTE con el portal)
const EBAY_VERIFICATION_TOKEN = 'colecciones-app-production-token-2025-secure-key-12345';

module.exports = async (req, res) => {
    console.log('=== eBay Endpoint Called ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Headers:', req.headers);
    console.log('Query:', req.query);

    // Configurar CORS y headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    try {
        // 1. Manejar verificación de eBay (GET con challenge_code)
        if (req.method === 'GET' && req.query.challenge_code) {
            console.log('🔔 eBay Challenge Detected!');
            
            const challengeCode = req.query.challenge_code;
            const endpointUrl = `https://${req.headers.host}${req.url.split('?')[0]}`;
            
            console.log('Challenge Code:', challengeCode);
            console.log('Verification Token:', EBAY_VERIFICATION_TOKEN);
            console.log('Endpoint URL:', endpointUrl);
            
            // Calcular SHA-256 según especificación eBay
            const concatenatedString = challengeCode + EBAY_VERIFICATION_TOKEN + endpointUrl;
            console.log('String to hash:', concatenatedString);
            
            const hash = crypto.createHash('sha256');
            hash.update(concatenatedString);
            const challengeResponse = hash.digest('hex');
            
            console.log('Calculated hash:', challengeResponse);
            
            // Responder con JSON como requiere eBay
            const responseObject = { challengeResponse: challengeResponse };
            
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(responseObject);
            
            console.log('✅ eBay verification response sent');
            return;
        }
        
        // 2. Manejar notificaciones de eliminación de cuenta (POST)
        if (req.method === 'POST') {
            console.log('📫 eBay Account Deletion Notification');
            console.log('Body:', req.body);
            
            // Aquí procesarías la eliminación de datos del usuario
            // Por ahora solo confirmamos la recepción
            
            res.status(200).json({ 
                message: 'Account deletion notification received',
                timestamp: new Date().toISOString()
            });
            
            console.log('✅ Account deletion notification processed');
            return;
        }
        
        // 3. Página de información (GET sin parámetros)
        if (req.method === 'GET') {
            const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Colecciones App - eBay Compliance Endpoint</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        .status { background: #4CAF50; color: white; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
        .config { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
        code { background: #eee; padding: 2px 4px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="status">✅ eBay Compliance Endpoint Active</div>
    
    <h1>Colecciones App - eBay Compliance</h1>
    
    <div class="config">
        <h3>Endpoint Configuration</h3>
        <p><strong>Verification Token:</strong> <code>${EBAY_VERIFICATION_TOKEN}</code></p>
        <p><strong>Token Length:</strong> ${EBAY_VERIFICATION_TOKEN.length} characters ✅</p>
        <p><strong>Endpoint URL:</strong> <code>https://${req.headers.host}${req.url.split('?')[0]}</code></p>
        <p><strong>Status:</strong> Ready for eBay production verification</p>
    </div>
    
    <h2>Privacy Policy</h2>
    <p>Colecciones App respects your privacy. We collect only the collection data you voluntarily input for the purpose of providing collection management and price tracking services. All personal data is stored locally on your device. We do not share your data with third parties.</p>
    
    <h2>Terms of Service</h2>
    <p>This app is for personal collection management only. Price data is for reference only. We are not liable for any financial decisions made based on app data.</p>
    
    <p><small>Last updated: November 2025 | Compliant with eBay requirements</small></p>
</body>
</html>`;
            
            res.setHeader('Content-Type', 'text/html');
            res.status(200).send(htmlContent);
            return;
        }
        
        // Método no soportado
        res.status(405).json({ error: 'Method not allowed' });
        
    } catch (error) {
        console.error('❌ Error in eBay endpoint:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
};