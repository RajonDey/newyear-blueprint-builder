# Deployment Guide - Option A (Secure Payment Flow)

## Prerequisites

1. **Lemon Squeezy Account**
   - Sign up at https://lemonsqueezy.com
   - Create a product: "2025 Success Blueprint - Early Access"
   - Set price: $12 USD
   - Add "Regular Price: $19" in product description

2. **Vercel Account**
   - Sign up at https://vercel.com
   - Install Vercel CLI: `npm i -g vercel`

## Step 1: Get Lemon Squeezy Credentials

### 1.1 Get API Key
1. Go to https://app.lemonsqueezy.com/settings/api
2. Create a new API key
3. Copy the API key (starts with `lemon_`)

### 1.2 Get Checkout URL
1. Go to your product in Lemon Squeezy dashboard
2. Click "Get Checkout URL"
3. Copy the checkout URL (looks like `https://yourstore.lemonsqueezy.com/checkout/buy/...`)

### 1.3 Create Webhook
1. Go to https://app.lemonsqueezy.com/settings/webhooks
2. Click "Create Webhook"
3. Webhook URL: `https://yourdomain.vercel.app/api/lemon-webhook` (update after deployment)
4. Subscribe to events:
   - `order_created`
   - `subscription_created` (optional, for future subscriptions)
5. Copy the signing secret

## Step 2: Update Code

### 2.1 Add Checkout URL
Edit `src/components/wizard/Step6Summary.tsx` line 21:
```typescript
const checkoutUrl = "YOUR_LEMON_SQUEEZY_CHECKOUT_URL_HERE";
```

## Step 3: Deploy to Vercel

### 3.1 Initial Deployment
```bash
# Login to Vercel
vercel login

# Deploy project
vercel

# Follow prompts and deploy
```

### 3.2 Add Environment Variables
After deployment, add environment variables in Vercel dashboard:

1. Go to your project on Vercel
2. Settings → Environment Variables
3. Add these variables:

```
LEMON_SQUEEZY_API_KEY=lemon_your_api_key_here
LEMON_SQUEEZY_WEBHOOK_SECRET=your_webhook_secret_here
```

4. Redeploy to apply environment variables:
```bash
vercel --prod
```

## Step 4: Update Webhook URL

1. Go back to Lemon Squeezy webhook settings
2. Update webhook URL to: `https://your-actual-domain.vercel.app/api/lemon-webhook`
3. Save changes

## Step 5: Test Payment Flow

### 5.1 Test Mode
1. Use Lemon Squeezy test mode
2. Go through wizard and click "Get Premium PDF"
3. Use test card: `4242 4242 4242 4242`
4. Complete payment
5. Verify:
   - Redirects to `/success?checkout_id=...`
   - Shows "Verifying Payment..." loading state
   - Shows success message after verification
   - PDF downloads successfully

### 5.2 Production Mode
1. Switch Lemon Squeezy to live mode
2. Update checkout URL in code if needed
3. Deploy: `vercel --prod`
4. Test with real payment

## Troubleshooting

### Payment Verification Fails
- Check API key is correct in Vercel env vars
- Check checkout_id is in URL after redirect
- Check Vercel function logs: `vercel logs`

### Webhook Not Receiving Events
- Verify webhook URL is correct
- Check webhook signing secret matches
- Test webhook manually from Lemon Squeezy dashboard

### PDF Download Not Working
- Check wizard data is in localStorage
- Verify payment is verified before showing download
- Check browser console for errors

## Architecture Overview

```
User Journey:
1. Complete wizard → Click "Get Premium PDF"
2. Redirect to Lemon Squeezy checkout
3. Complete payment on Lemon Squeezy
4. Redirect back to /success?checkout_id=xxx
5. Frontend calls /api/verify-payment with checkout_id
6. Backend verifies with Lemon Squeezy API
7. Show PDF download if verified

Webhook Flow:
1. Lemon Squeezy sends order_created webhook
2. /api/lemon-webhook receives and verifies signature
3. Log order details (can extend to send email, etc.)
```

## Security Features

✅ Payment verification via server-side API call  
✅ Webhook signature verification  
✅ No direct localStorage trust - always verify with Lemon Squeezy  
✅ One-time download tokens (can be enhanced with Redis/KV store)  
✅ Environment variables for sensitive keys  

## Next Steps

- [ ] Add email delivery of PDF via Resend/SendGrid
- [ ] Store orders in database for analytics
- [ ] Add retry logic for failed verifications
- [ ] Implement download token validation with Vercel KV
- [ ] Add Google Analytics events for conversion tracking
