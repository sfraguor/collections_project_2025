// Endpoint simple para eBay deletion notifications
// Puedes hostear esto en Netlify, Vercel, etc.

exports.handler = async (event, context) => {
  // eBay enviará notificaciones de eliminación de cuenta aquí
  console.log('eBay deletion notification received:', event.body);
  
  // Procesar la notificación si es necesario
  // Por ahora solo respondemos OK
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'received',
      message: 'Account deletion notification processed'
    })
  };
};

// Para Express.js (si usas un servidor tradicional):
/*
app.post('/ebay-deletion-notification', (req, res) => {
  console.log('eBay deletion notification:', req.body);
  res.status(200).json({ status: 'received' });
});
*/