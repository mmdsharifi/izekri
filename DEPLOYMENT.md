# 🚀 Deployment Guide

This project is configured for automatic deployment on every push to the `main` branch.

## 📋 Prerequisites

- GitHub repository connected to your local project
- Netlify account (recommended) or Vercel account

## 🔧 Setup Instructions

### Option 1: Netlify (Recommended)

1. **Create Netlify Site:**

   ```bash
   # Login to Netlify
   netlify login

   # Initialize site
   netlify init
   ```

2. **Get Netlify Credentials:**

   - Go to Netlify Dashboard → Site Settings → Build & Deploy → Environment
   - Copy your `Site ID`
   - Go to User Settings → Applications → Personal access tokens
   - Create a new token and copy it

3. **Add GitHub Secrets:**
   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `NETLIFY_AUTH_TOKEN`: Your Netlify personal access token
     - `NETLIFY_SITE_ID`: Your Netlify site ID

### Option 2: Vercel

1. **Create Vercel Project:**

   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login and create project
   vercel login
   vercel
   ```

2. **Get Vercel Credentials:**

   - Go to Vercel Dashboard → Settings → General
   - Copy your `Project ID` and `Org ID`
   - Go to Settings → Tokens
   - Create a new token

3. **Add GitHub Secrets:**
   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `VERCEL_TOKEN`: Your Vercel token
     - `PROJECT_ID`: Your Vercel project ID
     - `ORG_ID`: Your Vercel organization ID

## 🔄 Automatic Deployment

Once configured, the app will automatically deploy:

- **On every push to `main` branch** → Production deployment
- **On pull requests** → Preview deployment
- **After running tests** → Only if tests pass

## 📁 Configuration Files

- `netlify.toml` - Netlify configuration
- `.github/workflows/deploy.yml` - Netlify deployment workflow
- `.github/workflows/deploy-vercel.yml` - Vercel deployment workflow

## 🎯 Features

- ✅ **PWA Support** - Service worker and manifest
- ✅ **Audio Caching** - IndexedDB for offline playback
- ✅ **HTTPS** - Automatic SSL certificates
- ✅ **CDN** - Global content delivery
- ✅ **Preview Deployments** - For pull requests

## 🚨 Troubleshooting

### Common Issues:

1. **Build Fails:**

   - Check Node.js version (requires 18+)
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Service Worker Not Working:**

   - Ensure HTTPS is enabled
   - Check `netlify.toml` headers configuration
   - Verify manifest.json is accessible

3. **Audio Not Loading:**
   - Check HTTPS URLs in constants.ts
   - Verify CORS settings
   - Test audio URLs manually

### Manual Deployment:

```bash
# Build locally
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist

# Deploy to Vercel
vercel --prod
```

## 📞 Support

If you encounter issues:

1. Check GitHub Actions logs
2. Verify secrets are correctly set
3. Test build locally with `npm run build`
4. Check deployment platform logs
