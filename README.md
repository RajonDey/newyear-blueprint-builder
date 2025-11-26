# New Year Blueprint Builder

A production-ready goal-setting wizard that helps users create personalized success blueprints using proven frameworks (Wheel of Life, SMART Goals, OKRs, Atomic Habits).

## Features

- **Dynamic Year Support**: Automatically adapts to current/next year
- **Interactive Wizard**: 7-step guided process
- **PDF Export**: Beautiful, professional PDF generation
- **Notion Template**: Downloadable template for progress tracking
- **Email Delivery**: Automated email with PDF and template
- **Payment Integration**: Secure payment via Lemon Squeezy
- **Analytics**: Built-in tracking for conversions
- **Error Tracking**: Production-ready error monitoring
- **Security**: Input validation, security headers, XSS protection

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/36b67127-a29e-42db-bc47-4fe770ccc45f) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Deployment

This project is configured for deployment on Vercel. See `DEPLOYMENT.md` for detailed instructions.

### Quick Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Environment Variables

See `ENV-SETUP.md` for required environment variables.

## Production Readiness

This project has been optimized for production with:
- Security hardening (input validation, security headers)
- Performance optimization (code splitting, lazy loading)
- Error tracking setup
- Analytics integration
- SEO optimization
- Accessibility improvements

See `LAUNCH-CHECKLIST.md` for pre-launch verification steps.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
