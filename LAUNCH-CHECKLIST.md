# Launch Checklist

## Pre-Launch Checklist

### Environment Variables
- [ ] `LEMON_SQUEEZY_API_KEY` - Set in Vercel
- [ ] `LEMON_SQUEEZY_WEBHOOK_SECRET` - Set in Vercel
- [ ] `EMAIL_SERVICE` - Set to 'resend' or 'sendgrid'
- [ ] `RESEND_API_KEY` or `SENDGRID_API_KEY` - Set in Vercel
- [ ] `RESEND_FROM_EMAIL` or `SENDGRID_FROM_EMAIL` - Set in Vercel
- [ ] `VITE_GA_MEASUREMENT_ID` - Set if using Google Analytics (optional)
- [ ] `VITE_SENTRY_DSN` - Set if using Sentry (optional)
- [ ] `VERCEL_URL` - Automatically set by Vercel

### Payment Setup
- [ ] Lemon Squeezy product created
- [ ] Checkout URL updated in `src/components/wizard/Step6Summary.tsx`
- [ ] Webhook URL configured in Lemon Squeezy dashboard
- [ ] Test payment flow end-to-end
- [ ] Verify payment success page works
- [ ] Verify payment cancel page works

### Email Setup
- [ ] Email service configured (Resend or SendGrid)
- [ ] From email address verified
- [ ] Test email sending works
- [ ] Email templates look good

### SEO
- [ ] Update Google Analytics ID in `index.html` (if using)
- [ ] Update Plausible domain in `index.html` (if using)
- [ ] Verify sitemap.xml is accessible
- [ ] Verify robots.txt is correct
- [ ] Test Open Graph tags with social media debuggers
- [ ] Verify structured data with Google Rich Results Test

### Functionality
- [ ] Complete wizard flow works end-to-end
- [ ] PDF generation works correctly
- [ ] Notion template download works
- [ ] Auto-save functionality works
- [ ] Session restore works
- [ ] Error boundary catches errors gracefully

### Security
- [ ] All console statements removed (using logger)
- [ ] Input validation working on all forms
- [ ] Security headers configured in vercel.json
- [ ] Webhook signature verification working
- [ ] Payment verification working

### Performance
- [ ] Build completes without errors
- [ ] Bundle size is reasonable
- [ ] Code splitting configured
- [ ] Images optimized
- [ ] Test on slow network connection

### Testing
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on mobile (iOS)
- [ ] Test on mobile (Android)
- [ ] Test payment flow
- [ ] Test PDF download
- [ ] Test Notion template download

### Legal
- [ ] Terms of Service page accessible
- [ ] Privacy Policy page accessible
- [ ] Refund Policy page accessible
- [ ] All legal pages have correct year references

### Analytics
- [ ] Analytics tracking initialized
- [ ] Page views tracked
- [ ] Conversion events tracked
- [ ] Test events fire correctly

### Documentation
- [ ] README updated
- [ ] ENV-SETUP.md updated
- [ ] DEPLOYMENT.md updated
- [ ] API documentation added (if needed)

## Post-Launch

### Monitoring
- [ ] Error tracking working (Sentry or similar)
- [ ] Analytics dashboard set up
- [ ] Uptime monitoring configured
- [ ] Set up alerts for critical errors

### Marketing
- [ ] Social media posts ready
- [ ] Email campaign ready (if applicable)
- [ ] Landing page optimized for conversions

### Support
- [ ] Support email configured
- [ ] FAQ section complete
- [ ] Help documentation ready

## Notes

- Replace `G-XXXXXXXXXX` with actual Google Analytics Measurement ID
- Update Lemon Squeezy checkout URL in code
- Configure email service before launch
- Test everything in staging environment first

