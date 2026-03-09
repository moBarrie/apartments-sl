# Deployment Guide

## 🚀 Production Deployment

This guide covers deploying the Apartment Rentals SL platform to production.

---

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations tested
- [ ] API endpoints tested
- [ ] Frontend builds successfully
- [ ] Stripe webhook configured
- [ ] Domain name purchased
- [ ] SSL certificate ready
- [ ] Email service configured

---

## 🗄️ Database (PostgreSQL)

### Option 1: Railway

1. Go to [Railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy connection string
4. Update `DATABASE_URL` in backend environment

### Option 2: Supabase

1. Go to [Supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy connection string (Pooler mode recommended)
5. Update `DATABASE_URL`

### Option 3: DigitalOcean Managed PostgreSQL

1. Create database cluster on DigitalOcean
2. Add connection pool
3. Copy connection string
4. Update `DATABASE_URL`

**Run Migrations:**

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

---

## 🔧 Backend API Deployment

### Option 1: Railway (Recommended)

**Steps:**

1. Push code to GitHub
2. Go to [Railway.app](https://railway.app)
3. New Project → Deploy from GitHub
4. Select your repository
5. Railway auto-detects Node.js

**Environment Variables:**

Add in Railway dashboard:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_production_secret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SENDGRID_API_KEY=...
FRONTEND_URL=https://yourdomain.com
```

**Custom Domain:**

1. Go to Settings → Domains
2. Add custom domain: `api.yourdomain.com`
3. Update DNS records

### Option 2: DigitalOcean App Platform

1. Create App → GitHub
2. Select repository
3. Configure:
   - **Type**: Web Service
   - **Source Directory**: `/backend`
   - **Build Command**: `npm install && npm run build`
   - **Run Command**: `npm start`
   - **Port**: 5000

4. Add environment variables
5. Deploy

### Option 3: AWS Elastic Beanstalk

1. Install EB CLI: `pip install awsebcli`
2. Initialize:
   ```bash
   cd backend
   eb init -p node.js apartment-api
   ```
3. Create environment:
   ```bash
   eb create prod-api
   ```
4. Set environment variables:
   ```bash
   eb setenv NODE_ENV=production DATABASE_URL=...
   ```
5. Deploy:
   ```bash
   eb deploy
   ```

---

## 🎨 Frontend Deployment

### Option 1: Vercel (Recommended for Next.js)

**Automatic Deployment:**

1. Push to GitHub
2. Go to [Vercel.com](https://vercel.com)
3. Import repository
4. Vercel auto-detects Next.js
5. Add environment variables:

```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

6. Deploy

**Custom Domain:**

1. Go to Project → Settings → Domains
2. Add `yourdomain.com` and `www.yourdomain.com`
3. Update DNS:
   - Type: A / CNAME
   - Value: (provided by Vercel)

### Option 2: Netlify

1. Connect GitHub repository
2. Build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
3. Add environment variables
4. Deploy

### Option 3: Self-Hosted (DigitalOcean Droplet)

1. Create Droplet (Ubuntu 22.04)
2. SSH into server:
   ```bash
   ssh root@your-server-ip
   ```
3. Install Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
4. Clone repository:
   ```bash
   git clone your-repo-url
   cd apartments/frontend
   ```
5. Install dependencies:
   ```bash
   npm install
   ```
6. Build:
   ```bash
   npm run build
   ```
7. Run with PM2:
   ```bash
   npm install pm2 -g
   pm2 start npm --name "frontend" -- start
   pm2 save
   pm2 startup
   ```
8. Configure Nginx as reverse proxy
9. Set up SSL with Let's Encrypt

---

## 🔒 SSL Certificate (HTTPS)

### For Custom Domain

**Option 1: Cloudflare (Free)**

1. Add domain to Cloudflare
2. Update nameservers
3. SSL automatically provisioned

**Option 2: Let's Encrypt (Free)**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 💳 Stripe Configuration

### 1. Get Live Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Switch to Live mode
3. Copy API keys:
   - Publishable key: `pk_live_...`
   - Secret key: `sk_live_...`

### 2. Set Up Webhooks

1. Go to Developers → Webhooks
2. Add endpoint: `https://api.yourdomain.com/api/v1/payments/webhook/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy webhook secret: `whsec_...`
5. Add to backend environment variables

---

## 📧 Email Service

### Option 1: SendGrid

1. Create account at [SendGrid.com](https://sendgrid.com)
2. Create API key
3. Verify sender domain
4. Add to environment:
   ```
   SENDGRID_API_KEY=SG....
   FROM_EMAIL=noreply@yourdomain.com
   ```

### Option 2: Resend

1. Create account at [Resend.com](https://resend.com)
2. Add domain
3. Verify DNS records
4. Create API key
5. Add to environment

---

## 🌍 CDN Setup (Cloudflare)

1. Add domain to Cloudflare
2. Enable:
   - Auto Minify (JS, CSS, HTML)
   - Brotli compression
   - HTTP/3
   - Always Use HTTPS
3. Page Rules:
   - Cache Level: Standard
   - Browser Cache TTL: 4 hours

---

## 📊 Monitoring & Analytics

### Application Monitoring

**Option 1: Sentry**

```bash
npm install @sentry/node @sentry/nextjs
```

Configure in:

- Backend: `src/server.ts`
- Frontend: `next.config.js`

**Option 2: LogRocket**

For session replay and error tracking.

### Uptime Monitoring

- **UptimeRobot** (free)
- **Pingdom**
- **StatusCake**

### Analytics

**Google Analytics 4:**

```javascript
// frontend/src/app/layout.tsx
<Script
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
  strategy="afterInteractive"
/>
```

---

## ♻️ CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          npm install -g railway
          railway up --service backend

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **Rate Limiting**: Already configured in backend
3. **CORS**: Restrict to your frontend domain
4. **Database**: Use connection pooling
5. **Secrets**: Rotate JWT_SECRET regularly
6. **Backups**: Enable automated database backups
7. **Updates**: Keep dependencies updated

---

## 📈 Performance Optimization

### Backend

1. Enable Redis caching (optional)
2. Use CDN for static assets
3. Enable gzip compression
4. Database indexing (already done)

### Frontend

1. Image optimization (Next.js automatic)
2. Code splitting (Next.js automatic)
3. Enable PWA (optional)
4. Lazy loading components

---

## 🧪 Testing Production

1. **API Health**: `https://api.yourdomain.com/health`
2. **Register user**: Test sign up flow
3. **Create listing**: Test landlord flow
4. **Make booking**: Test payment flow
5. **Mobile responsive**: Test on mobile devices

---

## 📝 Post-Deployment

- [ ] Monitor error logs
- [ ] Check payment webhooks
- [ ] Test email delivery
- [ ] Verify SSL certificate
- [ ] Check site speed (GTmetrix, PageSpeed)
- [ ] Submit sitemap to Google
- [ ] Set up Google Search Console

---

## 🆘 Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL
```

### Build Failures

```bash
# Clear cache
rm -rf node_modules .next
npm install
npm run build
```

### Environment Variables Not Working

- Ensure they're prefixed with `NEXT_PUBLIC_` for frontend
- Restart servers after changing env vars

---

## 📞 Support

For deployment issues:

- **Railway**: [Railway Discord](https://discord.gg/railway)
- **Vercel**: [Vercel Support](https://vercel.com/support)
- **Stripe**: [Stripe Support](https://support.stripe.com)

---

**Your platform is now live!** 🎉
