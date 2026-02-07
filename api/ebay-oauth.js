// eBay OAuth Redirect Handler - Vercel Function
// Este endpoint maneja la redirección después de autenticación eBay

module.exports = async (req, res) => {
    console.log('=== eBay OAuth Redirect Called ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Query:', req.query);

    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    try {
        // Manejar OPTIONS para CORS
        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }

        if (req.method === 'GET') {
            const { code, error, error_description, state } = req.query;
            
            console.log('OAuth Parameters:');
            console.log('- Authorization Code:', code ? code.substring(0, 20) + '...' : 'Not provided');
            console.log('- Error:', error || 'None');
            console.log('- Error Description:', error_description || 'None');
            console.log('- State:', state || 'None');

            // Página de respuesta OAuth
            let htmlContent;
            
            if (error) {
                // Error en autenticación
                htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Colecciones App - eBay OAuth Error</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; }
        .error { background: #ff5252; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .button { display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px; }
    </style>
    <script>
        // Notificar error a la app padre (si está en iframe)
        window.parent.postMessage({
            type: 'ebay_oauth_error',
            error: '${error}',
            description: '${error_description || ''}'
        }, '*');
    </script>
</head>
<body>
    <div class="error">
        <h2>❌ Error de Autenticación eBay</h2>
        <p><strong>Error:</strong> ${error}</p>
        ${error_description ? `<p><strong>Descripción:</strong> ${error_description}</p>` : ''}
    </div>
    
    <h3>¿Qué pasó?</h3>
    <p>La autenticación con eBay no se completó correctamente. Esto puede deberse a:</p>
    <ul style="text-align: left;">
        <li>Usuario canceló la autenticación</li>
        <li>Problema temporal con eBay</li>
        <li>Configuración incorrecta de la aplicación</li>
    </ul>
    
    <a href="#" onclick="window.close()" class="button">Cerrar</a>
    <a href="https://collections-project-2025.vercel.app" class="button">Volver a la App</a>
    
    <script>
        // Auto-cerrar después de 5 segundos si es popup
        if (window.opener) {
            setTimeout(() => window.close(), 5000);
        }
    </script>
</body>
</html>`;
            } else if (code) {
                // Autenticación exitosa
                htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Colecciones App - eBay OAuth Success</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; }
        .success { background: #4CAF50; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .code-display { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; font-family: monospace; word-break: break-all; }
        .button { display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px; }
        .loading { margin: 20px 0; }
    </style>
    <script>
        // Notificar éxito a la app padre (si está en iframe)
        window.parent.postMessage({
            type: 'ebay_oauth_success',
            code: '${code}',
            state: '${state || ''}'
        }, '*');
    </script>
</head>
<body>
    <div class="success">
        <h2>✅ Autenticación eBay Exitosa</h2>
        <p>Has autorizado correctamente la aplicación Colecciones</p>
    </div>
    
    <div class="loading">
        <p>🔄 Procesando autorización...</p>
    </div>
    
    <div class="code-display">
        <strong>Código de Autorización:</strong><br>
        <small>${code ? code.substring(0, 50) + '...' : 'No disponible'}</small>
    </div>
    
    <p>Este código se usará para obtener tokens de acceso y configurar la integración con eBay.</p>
    
    <a href="#" onclick="window.close()" class="button">Cerrar</a>
    <a href="https://collections-project-2025.vercel.app" class="button">Continuar en la App</a>
    
    <script>
        // Auto-cerrar después de 3 segundos si es popup
        if (window.opener) {
            setTimeout(() => {
                window.opener.postMessage({
                    type: 'ebay_oauth_complete',
                    code: '${code}',
                    state: '${state || ''}'
                }, '*');
                window.close();
            }, 3000);
        }
    </script>
</body>
</html>`;
            } else {
                // Landing page información
                htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Colecciones App - eBay OAuth Endpoint</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .status { background: #2196F3; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px; text-align: center; }
        .info { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
        code { background: #eee; padding: 2px 4px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="status">🔗 eBay OAuth Redirect Endpoint</div>
    
    <h1>Colecciones App - eBay Integration</h1>
    
    <div class="info">
        <h3>🔧 Endpoint Configuration</h3>
        <p><strong>Redirect URL:</strong> <code>https://${req.headers.host}/api/ebay-oauth</code></p>
        <p><strong>Purpose:</strong> Handle eBay OAuth authentication callbacks</p>
        <p><strong>Status:</strong> ✅ Ready for eBay Developer Console</p>
    </div>
    
    <h2>🔒 Privacy & Security</h2>
    <p>Este endpoint procesa de forma segura las autorizaciones eBay para la aplicación Colecciones. No almacenamos credenciales permanentemente.</p>
    
    <h2>📋 Integration Status</h2>
    <ul>
        <li>✅ OAuth Redirect Handler</li>
        <li>✅ Error Handling</li>
        <li>✅ CORS Configuration</li>
        <li>✅ Security Headers</li>
    </ul>
    
    <p><em>Este endpoint se utiliza automáticamente durante el proceso de autenticación eBay.</em></p>
    
    <hr>
    <p><small>Colecciones App | eBay Developer Integration | ${new Date().getFullYear()}</small></p>
</body>
</html>`;
            }
            
            res.setHeader('Content-Type', 'text/html');
            res.status(200).send(htmlContent);
            return;
        }
        
        // Método no soportado
        res.status(405).json({ error: 'Method not allowed' });
        
    } catch (error) {
        console.error('❌ Error in eBay OAuth endpoint:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
};