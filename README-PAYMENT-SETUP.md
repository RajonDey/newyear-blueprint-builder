# Payment Setup Instructions

## ✅ What's Been Implemented (Option A - Secure)

Your payment system now includes:

1. **Pricing Consistency** - Updated from $3 to $12 (early access) with $19 price anchor
2. **Secure Payment Flow** - Server-side verification via Vercel API endpoints
3. **Loading States** - "Redirecting to checkout..." and "Verifying payment..." messages
4. **Error Handling** - Clear error messages if verification fails
5. **Webhook Handler** - Ready to receive Lemon Squeezy events

## 🔧 What You Need to Do

### Step 1: Create Lemon Squeezy Product

1. Go to https://lemonsqueezy.com and create account
2. Create new product: "2025 Success Blueprint - Early Access"
3. Set price: **$12 USD**
4. In product description, add: "Regular Price: $19"
5. Get the checkout URL (looks like: `https://yourstore.lemonsqueezy.com/checkout/buy/xxxxx`)

### Step 2: Get API Credentials

1. **API Key**: Go to https://app.lemonsqueezy.com/settings/api
   - Create new API key
   - Copy it (starts with `lemon_`)

2. **Webhook Secret**: Go to https://app.lemonsqueezy.com/settings/webhooks
   - Click "Create Webhook"
   - URL: `https://yourdomain.vercel.app/api/lemon-webhook` (update after deployment)
   - Select events: `order_created`, `subscription_created`
   - Copy the signing secret

### Step 3: Update Code (Before Local Export)

Edit `src/components/wizard/Step6Summary.tsx` (line 23):

```typescript
// REPLACE THIS LINE:
const LEMON_SQUEEZY_CHECKOUT_URL = "https://yourstorename.lemonsqueezy.com/checkout/buy/YOUR-PRODUCT-ID";

// WITH YOUR ACTUAL URL:
const LEMON_SQUEEZY_CHECKOUT_URL = "https://yourstore.lemonsqueezy.com/checkout/buy/12345abcd";
```

### Step 4: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts
```

### Step 5: Add Environment Variables in Vercel

After deployment, go to Vercel dashboard:

1. Navigate to: Project → Settings → Environment Variables
2. Add these two variables:

```
Name: LEMON_SQUEEZY_API_KEY
Value: lemon_your_actual_api_key_here

Name: LEMON_SQUEEZY_WEBHOOK_SECRET
Value: your_webhook_signing_secret_here
```

3. Redeploy: `vercel --prod`

### Step 6: Update Webhook URL

1. Go back to Lemon Squeezy webhooks
2. Edit webhook URL to: `https://your-actual-domain.vercel.app/api/lemon-webhook`
3. Save

### Step 7: Test the Flow

**Test Mode:**
1. Use Lemon Squeezy test mode
2. Complete wizard → click "Get Premium PDF"
3. Use test card: `4242 4242 4242 4242`
4. Verify redirect works and payment is verified

**Production:**
1. Switch to live mode in Lemon Squeezy
2. Update checkout URL if needed
3. Deploy and test with real payment

## 📁 Files Created

- `api/verify-payment.ts` - Payment verification endpoint
- `api/lemon-webhook.ts` - Webhook handler for Lemon Squeezy events
- `vercel.json` - Vercel configuration
- `.env.example` - Environment variables template
- `DEPLOYMENT.md` - Detailed deployment guide

## 🔒 Security Features

✅ Server-side payment verification (no client-side trust)  
✅ Webhook signature validation  
✅ Environment variables for secrets  
✅ One-time download tokens  
✅ Proper error handling and loading states  

## 🎯 Payment Flow

1. User completes wizard
2. Clicks "Get Premium PDF" ($12)
3. Data saved to localStorage
4. Redirects to Lemon Squeezy checkout
5. After payment → redirects to `/success?checkout_id=xxx`
6. Frontend calls `/api/verify-payment` with checkout_id
7. Backend verifies with Lemon Squeezy API
8. Shows success + PDF download if verified
9. Webhook receives confirmation for logging/email

## ❓ Troubleshooting

**"LEMON_SQUEEZY_CHECKOUT_URL" appears in console:**
- Replace the placeholder URL in `Step6Summary.tsx` line 23

**Payment verification fails:**
- Check environment variables are set in Vercel
- Check API key is correct
- View logs: `vercel logs`

**Webhook not working:**
- Verify webhook URL matches deployed domain
- Check signing secret is correct
- Test webhook manually in Lemon Squeezy dashboard

## 📊 What's Next (Optional)

- Add email delivery of PDF via Resend/SendGrid
- Store orders in a database
- Add analytics tracking
- Implement subscription model
- Add coupon codes

---

**Need help?** Check `DEPLOYMENT.md` for detailed step-by-step instructions.
