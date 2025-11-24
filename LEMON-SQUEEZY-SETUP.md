# 🍋 Lemon Squeezy Setup Guide - Complete Walkthrough

This guide walks you through setting up Lemon Squeezy payments for your 2025 Success Blueprint application from scratch.

---

## 📋 Prerequisites

Before you start, make sure you have:
- [x] A Lemon Squeezy account (create at https://lemonsqueezy.com)
- [x] Your application code ready to export
- [x] Access to deploy on Vercel (or similar platform)

**Estimated Setup Time**: 30-45 minutes

---

## Part 1: Lemon Squeezy Account & Store Setup

### Step 1.1: Create Your Lemon Squeezy Account

1. Go to https://lemonsqueezy.com
2. Click **"Sign Up"** (top right)
3. Complete registration with your email
4. Verify your email address
5. Log into your dashboard at https://app.lemonsqueezy.com

### Step 1.2: Create Your Store

1. In the Lemon Squeezy dashboard, click **"Stores"** (left sidebar)
2. Click **"+ New Store"**
3. Fill in store details:
   - **Store Name**: `Success Blueprint` (or your brand name)
   - **Store URL**: Choose a subdomain (e.g., `successblueprint`)
   - **Store Description**: Brief description of your business
4. Click **"Create Store"**
5. Complete store settings:
   - **Currency**: USD (recommended)
   - **Country**: Your business location
   - **Tax Settings**: Configure based on your requirements

### Step 1.3: Connect Payment Methods

1. Go to **Settings → Payments**
2. Connect your payment processor:
   - **Stripe**: Click "Connect Stripe" and follow prompts
   - **PayPal**: Optional - click "Connect PayPal"
3. Complete identity verification if required
4. Set up your bank account for payouts

**✅ Checkpoint**: Your store is now ready to accept payments!

---

## Part 2: Create Your Product

### Step 2.1: Create the Product

1. In your dashboard, click **"Products"** (left sidebar)
2. Click **"+ New Product"**
3. Select product type: **"Single payment"** (one-time purchase)

### Step 2.2: Configure Product Details

Fill in the product information:

**Basic Information:**
- **Product Name**: `2025 Success Blueprint - Premium PDF`
- **Description**: 
  ```
  Get your personalized 2025 Success Blueprint as a beautifully designed PDF with:
  
  ✅ Complete goal-setting framework for all life areas
  ✅ Monthly Review Template for progress tracking
  ✅ 90-Day Action View for quick planning
  ✅ Motivation & accountability worksheets
  ✅ Reflection spaces for continuous improvement
  
  Instant digital delivery. One-time payment, lifetime access.
  ```

**Pricing:**
- **Price**: `$12.00 USD`
- **Discount**: You can add "Regular price: $19" in the description
- Check: ✅ **"This is a digital product"**

**Product Image:**
- Upload a professional product image (recommended: 1200x630px)
- Tip: Create a simple mockup showing a PDF preview

### Step 2.3: Configure Checkout Settings

1. Scroll to **"Checkout settings"**
2. Enable/configure:
   - ✅ **Collect customer email** (required for delivery)
   - ✅ **Collect customer name** (optional but recommended)
   - ⬜ **Collect billing address** (not needed for digital products)

### Step 2.4: Setup Redirect URLs (Important!)

1. In **"Redirect URLs"** section:
   - **Success URL**: Leave blank for now (we'll update this after deployment)
   - **Cancel URL**: Leave blank for now
2. Click **"Save Product"**

### Step 2.5: Get Your Checkout URL

1. After saving, find your product in the products list
2. Click on the product name
3. Look for **"Checkout URL"** or **"Buy Button"**
4. Copy the checkout URL - it looks like:
   ```
   https://yourstore.lemonsqueezy.com/checkout/buy/abc123def456
   ```
5. **SAVE THIS URL** - you'll need it in Step 5.1!

**✅ Checkpoint**: Your product is created with a checkout URL!

---

## Part 3: Get API Credentials

### Step 3.1: Generate API Key

1. In Lemon Squeezy dashboard, click your profile (top right)
2. Select **"Settings"**
3. Go to **"API"** tab (left sidebar)
4. Click **"+ Create API Key"**
5. Name it: `Production API Key`
6. Click **"Create"**
7. **COPY THE API KEY IMMEDIATELY** - it starts with `lemon_`
   ```
   lemon_sk_1234567890abcdef...
   ```
8. **⚠️ CRITICAL**: Store this securely - you cannot view it again!

**Where to save it temporarily**: Use a password manager or secure note.

### Step 3.2: Create Webhook

1. Still in Settings, go to **"Webhooks"** tab
2. Click **"+ Create Webhook"**
3. **Webhook URL**: Enter temporary URL for now:
   ```
   https://placeholder.com/webhook
   ```
   (We'll update this after deployment in Step 6.3)

4. **Select Events**: Check these boxes:
   - ✅ `order_created`
   - ✅ `subscription_created`
   - ✅ `subscription_payment_success` (if offering subscriptions later)

5. Click **"Create Webhook"**

6. **Copy the Signing Secret** - starts with `whsec_`
   ```
   whsec_abcdef1234567890...
   ```

7. **⚠️ CRITICAL**: Save this signing secret securely!

**✅ Checkpoint**: You now have API Key and Webhook Secret!

---

## Part 4: Enable Test Mode (Optional but Recommended)

### Step 4.1: Switch to Test Mode

1. In the top-right corner of your Lemon Squeezy dashboard, you'll see a toggle
2. Switch to **"Test Mode"**
3. Notice the orange banner: "You are in test mode"

### Step 4.2: Create Test Product (Optional)

If you want to test payments without real money:

1. Repeat Part 2 steps to create a test product
2. Or use your existing product (it will accept test payments in test mode)

### Step 4.3: Test Credit Cards

Use these test cards in test mode:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- Any future expiry date and any CVC

**✅ Checkpoint**: Test mode is ready!

---

## Part 5: Update Your Application Code

### Step 5.1: Configure Checkout URL

1. Open your project in code editor
2. Navigate to: `src/components/wizard/Step6Summary.tsx`
3. Find line 26 (look for `LEMON_SQUEEZY_CHECKOUT_URL`)
4. Replace the placeholder with your actual checkout URL:

**Before:**
```typescript
const LEMON_SQUEEZY_CHECKOUT_URL = "https://yourstorename.lemonsqueezy.com/checkout/buy/YOUR-PRODUCT-ID";
```

**After:**
```typescript
const LEMON_SQUEEZY_CHECKOUT_URL = "https://successblueprint.lemonsqueezy.com/checkout/buy/abc123def456";
```

5. Save the file

**✅ Checkpoint**: Checkout URL is configured!

### Step 5.2: Review API Endpoints

The following files handle payment processing (no changes needed):
- `api/verify-payment.ts` - Verifies payment with Lemon Squeezy API
- `api/lemon-webhook.ts` - Receives webhook events
- `vercel.json` - Routes API calls correctly

These files are already configured and ready to use!

---

## Part 6: Deploy to Vercel

### Step 6.1: Install Vercel CLI (if not already installed)

```bash
npm install -g vercel
```

### Step 6.2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

### Step 6.3: Initial Deployment

In your project directory, run:

```bash
vercel
```

Answer the prompts:
- **Set up and deploy?** → `Y`
- **Which scope?** → Select your account
- **Link to existing project?** → `N`
- **Project name?** → `success-blueprint` (or your preferred name)
- **Directory?** → `.` (press Enter)
- **Override settings?** → `N`

Wait for deployment to complete. You'll get a URL like:
```
https://success-blueprint-abc123.vercel.app
```

**✅ Checkpoint**: Your app is live!

---

## Part 7: Configure Environment Variables in Vercel

### Step 7.1: Access Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click on your project (`success-blueprint`)
3. Click **"Settings"** tab
4. Click **"Environment Variables"** (left sidebar)

### Step 7.2: Add LEMON_SQUEEZY_API_KEY

1. Click **"Add New"**
2. Fill in:
   - **Key**: `LEMON_SQUEEZY_API_KEY`
   - **Value**: Paste your API key (starts with `lemon_`)
   - **Environments**: Check all boxes (Production, Preview, Development)
3. Click **"Save"**

### Step 7.3: Add LEMON_SQUEEZY_WEBHOOK_SECRET

1. Click **"Add New"** again
2. Fill in:
   - **Key**: `LEMON_SQUEEZY_WEBHOOK_SECRET`
   - **Value**: Paste your webhook signing secret (starts with `whsec_`)
   - **Environments**: Check all boxes
3. Click **"Save"**

**✅ Checkpoint**: Environment variables are configured!

### Step 7.4: Redeploy with Environment Variables

In your terminal, run:

```bash
vercel --prod
```

This redeploys your app with the new environment variables.

---

## Part 8: Update Webhook URL in Lemon Squeezy

### Step 8.1: Get Your Production Webhook URL

Your webhook URL format:
```
https://your-domain.vercel.app/api/lemon-webhook
```

Example:
```
https://success-blueprint-abc123.vercel.app/api/lemon-webhook
```

### Step 8.2: Update Webhook in Lemon Squeezy

1. Go back to Lemon Squeezy dashboard
2. Navigate to **Settings → Webhooks**
3. Click on the webhook you created earlier
4. Update **Webhook URL** with your production URL
5. Click **"Update Webhook"**

**✅ Checkpoint**: Webhook is connected!

---

## Part 9: Update Product Redirect URLs

### Step 9.1: Configure Success URL

1. Go to **Products** in Lemon Squeezy
2. Click on your product
3. Scroll to **"Redirect URLs"**
4. Set **Success URL**:
   ```
   https://your-domain.vercel.app/success?checkout_id={checkout_id}
   ```
   Replace `your-domain.vercel.app` with your actual domain

5. Set **Cancel URL**:
   ```
   https://your-domain.vercel.app/cancel
   ```

6. Click **"Save Product"**

**✅ Checkpoint**: Redirect URLs are configured!

---

## Part 10: Testing Your Payment Flow

### Step 10.1: Test in Test Mode First

1. Make sure you're in **Test Mode** in Lemon Squeezy (orange banner)
2. Go to your deployed app
3. Complete the wizard
4. Click "Get Premium PDF"
5. Use test card: `4242 4242 4242 4242`
6. Complete checkout

**What should happen:**
1. ✅ You're redirected to Lemon Squeezy checkout
2. ✅ Payment form appears
3. ✅ After payment, redirected to `/success?checkout_id=xxx`
4. ✅ "Verifying payment..." message appears
5. ✅ Payment verified successfully
6. ✅ PDF download button appears
7. ✅ Webhook received (check Lemon Squeezy webhook logs)

### Step 10.2: Check Vercel Logs

To see backend logs:
```bash
vercel logs
```

Or in Vercel dashboard:
1. Go to your project
2. Click **"Functions"** tab
3. Click on `api/verify-payment.ts` or `api/lemon-webhook.ts`
4. View logs

### Step 10.3: Check Webhook Delivery

1. In Lemon Squeezy, go to **Settings → Webhooks**
2. Click on your webhook
3. Scroll to **"Recent Deliveries"**
4. Verify webhook was delivered successfully (green checkmark)

**✅ Checkpoint**: Test payment works end-to-end!

---

## Part 11: Switch to Live Mode

### Step 11.1: Enable Live Mode in Lemon Squeezy

1. Click the toggle in top-right: Switch to **"Live Mode"**
2. The orange "test mode" banner should disappear
3. Verify your product is in live mode

### Step 11.2: Update Live Mode API Credentials (if different)

If your live mode has different credentials:
1. Generate new API key in live mode
2. Update webhook signing secret if needed
3. Update environment variables in Vercel
4. Redeploy: `vercel --prod`

### Step 11.3: Final Live Test

**⚠️ This will charge real money!**

1. Complete the wizard on your live site
2. Use a real credit card (or ask a friend/family to test)
3. Complete the payment
4. Verify entire flow works
5. Request a refund for test order if needed

**✅ Checkpoint**: Live payments are working!

---

## Part 12: Post-Launch Configuration

### Step 12.1: Setup Email Notifications (Optional)

Configure Lemon Squeezy to send order confirmation emails:
1. Go to **Settings → Email**
2. Customize email templates
3. Test email delivery

### Step 12.2: Configure Tax Settings

1. Go to **Settings → Tax**
2. Configure tax collection based on your requirements:
   - US sales tax
   - VAT (for EU customers)
   - Other regional taxes

### Step 12.3: Setup Payout Schedule

1. Go to **Settings → Payouts**
2. Configure payout frequency:
   - Daily, weekly, or monthly
3. Verify bank account details

### Step 12.4: Enable Customer Portal (Recommended)

1. Go to **Settings → Customer Portal**
2. Enable customer portal
3. Customers can:
   - View order history
   - Download invoices
   - Update payment details (for subscriptions)

**✅ Checkpoint**: Post-launch configuration complete!

---

## 🎯 Quick Reference Checklist

Use this checklist to verify everything is set up correctly:

### Pre-Deployment
- [ ] Lemon Squeezy account created
- [ ] Store created and configured
- [ ] Product created ($12 pricing)
- [ ] API Key generated and saved securely
- [ ] Webhook created with signing secret saved
- [ ] Checkout URL copied and added to `Step6Summary.tsx`
- [ ] Code exported and ready to deploy

### Deployment
- [ ] Vercel CLI installed
- [ ] Deployed to Vercel
- [ ] Environment variables added in Vercel:
  - [ ] `LEMON_SQUEEZY_API_KEY`
  - [ ] `LEMON_SQUEEZY_WEBHOOK_SECRET`
- [ ] Redeployed with environment variables

### Post-Deployment
- [ ] Webhook URL updated in Lemon Squeezy
- [ ] Product redirect URLs updated (success & cancel)
- [ ] Test payment completed successfully in test mode
- [ ] Webhook delivery verified in logs
- [ ] Switched to live mode
- [ ] Live payment tested
- [ ] Email notifications configured
- [ ] Tax settings configured
- [ ] Payout settings configured

---

## 🆘 Troubleshooting Guide

### Problem: "Payment verification failed"

**Possible causes:**
1. API key not set or incorrect
2. Environment variables not loaded (forgot to redeploy)
3. Network timeout

**Solutions:**
- Verify API key is correct in Vercel dashboard
- Check Vercel logs: `vercel logs`
- Redeploy: `vercel --prod`
- Check Lemon Squeezy API status

### Problem: "Webhook not receiving events"

**Possible causes:**
1. Webhook URL incorrect
2. Webhook signing secret wrong
3. Firewall blocking webhook

**Solutions:**
- Verify webhook URL matches your domain exactly
- Check signing secret in Vercel env vars
- Test webhook manually in Lemon Squeezy dashboard
- Check Vercel function logs

### Problem: "Redirecting to checkout but nothing happens"

**Possible causes:**
1. Checkout URL not updated in code
2. JavaScript error in console

**Solutions:**
- Verify `LEMON_SQUEEZY_CHECKOUT_URL` in `Step6Summary.tsx`
- Check browser console for errors (F12)
- Test checkout URL directly in browser

### Problem: "PDF not downloading after payment"

**Possible causes:**
1. Payment verification failed
2. localStorage cleared
3. Browser blocking download

**Solutions:**
- Check payment verification status
- Verify wizard data saved to localStorage
- Try different browser
- Check browser download settings

### Problem: "Test mode payments not working"

**Possible causes:**
1. Not switched to test mode in Lemon Squeezy
2. Using wrong test card number

**Solutions:**
- Verify orange "test mode" banner is visible
- Use correct test card: `4242 4242 4242 4242`
- Check Lemon Squeezy dashboard for test orders

---

## 📞 Support Resources

If you get stuck, here are helpful resources:

- **Lemon Squeezy Documentation**: https://docs.lemonsqueezy.com
- **Lemon Squeezy Support**: support@lemonsqueezy.com
- **Vercel Documentation**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support

---

## 🎉 Success Criteria

You'll know everything is working when:

✅ User completes wizard  
✅ Clicks "Get Premium PDF" button  
✅ Redirected to Lemon Squeezy checkout  
✅ Completes payment with real/test card  
✅ Redirected back to your site at `/success`  
✅ "Verifying payment..." message appears  
✅ Payment verified successfully  
✅ PDF download button appears and works  
✅ Webhook received and logged in Lemon Squeezy  
✅ Order appears in Lemon Squeezy dashboard  
✅ Customer receives email confirmation (if configured)  

**Congratulations! Your payment system is fully operational! 🚀**

---

## 📈 Next Steps (Optional)

Consider these enhancements:

1. **Email Delivery**: Use Resend/SendGrid to email PDF
2. **Analytics**: Track conversion rates with Plausible/Google Analytics
3. **A/B Testing**: Test different pricing or copy
4. **Upsells**: Offer additional products after purchase
5. **Subscription Model**: Offer monthly goal-setting workshops
6. **Affiliate Program**: Use Lemon Squeezy affiliate features
7. **Discount Codes**: Create limited-time offers
8. **Customer Segments**: Tag customers for email marketing

---

**Last Updated**: 2025-11-24  
**Version**: 1.0  
**Maintainer**: 2025 Success Blueprint Team
