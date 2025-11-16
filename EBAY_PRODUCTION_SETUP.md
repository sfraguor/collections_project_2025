# eBay API Configuration Guide

## 🚀 Production Setup Information

### Application Details
- **Application Name**: Colecciones App
- **Application Type**: Mobile Application
- **Environment**: Currently Sandbox (ready for Production)

### URLs for eBay Developer Console
```
Privacy Policy URL: https://webhook.site/d1fd54f0-6533-44b7-82ae-7c4e90660402
Terms of Service URL: https://webhook.site/d1fd54f0-6533-44b7-82ae-7c4e90660402
Marketplace Deletion Endpoint: https://webhook.site/d1fd54f0-6533-44b7-82ae-7c4e90660402
```

### Application Description
Mobile application for personal collection management with real-time market price tracking using eBay Finding API. Users can catalog their collectibles and track market values for investment purposes.

### Use Case Description
The app uses eBay Finding API to:
- Search for current market prices of collectible items
- Track price history and trends  
- Calculate investment performance
- Provide market insights for personal collections

API calls are made when users:
- Add new items with eBay search terms
- Request price updates for their items
- View collection statistics

### Required Scopes
- `https://api.ebay.com/oauth/api_scope/buy.item.feed`
- `https://api.ebay.com/oauth/api_scope/buy.browse`
- `https://api.ebay.com/oauth/api_scope`

## 🔧 Environment Configuration

### Current Setup (Sandbox)
- **App ID**: `SergioFr-Collecti-SBX-26e85ef25-c81e5fd3`
- **Environment**: `sandbox`
- **Status**: ✅ Active and working

### When You Get Production Approval:

1. **Update the App ID** in `src/utils/ebayPriceService.js`:
   ```javascript
   const EBAY_PRODUCTION_APP_ID = 'YOUR_NEW_PRODUCTION_ID';
   ```

2. **Switch Environment**:
   ```javascript
   const EBAY_ENVIRONMENT = 'production'; // Change from 'sandbox'
   ```

3. **Test the connection** using the "🧪 Test API" button

## 📊 Webhook.site Dashboard

You can monitor notifications at:
https://webhook.site/#!/d1fd54f0-6533-44b7-82ae-7c4e90660402

This will show:
- Account deletion notifications from eBay
- Any other webhook calls
- Request details and payloads

## 🔍 Testing Checklist

### Sandbox Testing (Current)
- [x] API Key configured
- [ ] Test API button works
- [ ] Price search returns results
- [ ] Item tracking functions
- [ ] Error handling works

### Production Testing (After Approval)
- [ ] Update production App ID
- [ ] Switch environment to production
- [ ] Test with real eBay data
- [ ] Monitor webhook notifications
- [ ] Verify rate limits compliance

## 📞 Support Information

- **eBay Developer Support**: https://developer.ebay.com/support
- **API Documentation**: https://developer.ebay.com/devzone/finding/concepts/FindingAPIGuide.html
- **Rate Limits**: https://developer.ebay.com/support/kb/article/3181

## 🎯 Next Steps

1. Submit production application with the URLs above
2. Wait for eBay approval (typically 1-3 business days)
3. Update App ID when approved
4. Switch to production environment
5. Test thoroughly with real data