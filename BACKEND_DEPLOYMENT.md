# 🚀 SuiKnow Backend Deployment Guide

## Overview
This guide covers deploying SuiKnow's backend services (Walrus Proxy & Enoki Backend) to production.

## Services to Deploy

### 1. Walrus Proxy Server (`walrus-proxy-server.js`)
- **Purpose**: Proxy for Walrus CLI uploads
- **Port**: 3003 (or Railway/Render assigned)
- **Dependencies**: Walrus CLI binary
- **Environment Variables**: 
  - `PORT` - Server port (auto-assigned by platform)
  - `WALRUS_PROXY_PORT` - Alternative port variable

### 2. Enoki Backend Server (`enoki-backend-server.js`)
- **Purpose**: Sponsored transaction handling
- **Port**: 3004 (or Railway/Render assigned)
- **Environment Variables**:
  - `PORT` - Server port (auto-assigned by platform)
  - `ENOKI_PRIVATE_KEY` - **REQUIRED** (Secret: `enoki_private_8a522594a3f9138837481d121ccf6c13`)

---

## 🚂 Option 1: Railway.app (Recommended)

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
railway login
```

### Step 2: Deploy Walrus Proxy
```bash
# Create new Railway project
railway init

# Set service name
railway up --service walrus-proxy

# Set environment variables
railway variables set SERVICE=walrus
railway variables set NODE_VERSION=18.20.8

# Deploy
git push railway main
```

### Step 3: Deploy Enoki Backend (Separate Service)
```bash
# Create another service in same project
railway service create enoki-backend

# Set environment variables
railway variables set SERVICE=enoki
railway variables set ENOKI_PRIVATE_KEY=enoki_private_8a522594a3f9138837481d121ccf6c13
railway variables set NODE_VERSION=18.20.8

# Deploy
railway up --service enoki-backend
```

### Step 4: Get Deployment URLs
```bash
railway domain

# Example outputs:
# Walrus Proxy: https://walrus-proxy-production.up.railway.app
# Enoki Backend: https://enoki-backend-production.up.railway.app
```

---

## 🎨 Option 2: Render.com

### Step 1: Connect GitHub Repository
1. Go to https://render.com/dashboard
2. Click "New +" → "Blueprint"
3. Connect your GitHub repo
4. Render will auto-detect `render.yaml`

### Step 2: Configure Services

**Walrus Proxy Service:**
- Name: `suiknow-walrus-proxy`
- Environment: `Node`
- Build Command: `npm install`
- Start Command: `node walrus-proxy-server.js`
- Plan: Free

**Enoki Backend Service:**
- Name: `suiknow-enoki-backend`
- Environment: `Node`
- Build Command: `npm install`
- Start Command: `node enoki-backend-server.js`
- Environment Variable: `ENOKI_PRIVATE_KEY=enoki_private_8a522594a3f9138837481d121ccf6c13`
- Plan: Free

### Step 3: Deploy
- Render will automatically deploy both services
- Get URLs from dashboard

---

## ☁️ Option 3: VPS (DigitalOcean, AWS, etc.)

### Step 1: Setup Server
```bash
# SSH into your server
ssh user@your-server-ip

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Install Walrus CLI
curl https://install.walrus.com | sh
```

### Step 2: Upload Files
```bash
# On your local machine
scp -r walrus-proxy-server.js enoki-backend-server.js package.json .env user@your-server-ip:~/suiknow-backends/
```

### Step 3: Install Dependencies
```bash
cd ~/suiknow-backends
npm install
```

### Step 4: Start Services with PM2
```bash
# Start Walrus Proxy
pm2 start walrus-proxy-server.js --name walrus-proxy

# Start Enoki Backend
pm2 start enoki-backend-server.js --name enoki-backend

# Save PM2 config
pm2 save
pm2 startup

# Check status
pm2 list
pm2 logs
```

### Step 5: Setup Nginx Reverse Proxy
```bash
sudo nano /etc/nginx/sites-available/suiknow-backends
```

```nginx
# Walrus Proxy
server {
    listen 80;
    server_name walrus-proxy.yourdomain.com;

    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enoki Backend
server {
    listen 80;
    server_name enoki-backend.yourdomain.com;

    location / {
        proxy_pass http://localhost:3004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable sites
sudo ln -s /etc/nginx/sites-available/suiknow-backends /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔧 Update Frontend Environment Variables

After deployment, update your frontend `.env`:

```env
# Replace localhost with your production URLs

# Railway Example:
VITE_WALRUS_PROXY_URL=https://walrus-proxy-production.up.railway.app
VITE_BACKEND_URL=https://enoki-backend-production.up.railway.app

# Render Example:
VITE_WALRUS_PROXY_URL=https://suiknow-walrus-proxy.onrender.com
VITE_BACKEND_URL=https://suiknow-enoki-backend.onrender.com

# VPS Example:
VITE_WALRUS_PROXY_URL=https://walrus-proxy.yourdomain.com
VITE_BACKEND_URL=https://enoki-backend.yourdomain.com
```

Then rebuild and redeploy frontend:
```bash
npm run build
site-builder --config site-builder-config.yaml publish --epochs 1 ./dist
```

---

## 🧪 Test Deployed Backends

### Test Walrus Proxy:
```bash
# Health check
curl https://your-walrus-proxy-url/health

# Expected: {"success":true,"status":"healthy","walrusCLI":"available"}
```

### Test Enoki Backend:
```bash
# Health check
curl https://your-enoki-backend-url/health

# Expected: {"success":true,"status":"healthy","enoki":"ready"}
```

---

## 📝 Environment Variables Reference

| Variable | Service | Required | Description |
|----------|---------|----------|-------------|
| `PORT` | Both | Auto | Server port (platform assigns) |
| `ENOKI_PRIVATE_KEY` | Enoki | ✅ Yes | Private API key for sponsorship |
| `NODE_VERSION` | Both | No | Node.js version (18+) |
| `SERVICE` | Railway | No | Service selector (walrus/enoki) |

---

## 🚨 Important Notes

### Walrus CLI Requirement:
- **Railway/Render**: May need custom buildpack or Docker image
- **VPS**: Install manually
- **Alternative**: Use Walrus HTTP API instead of CLI

### Free Tier Limitations:
- **Railway**: 500 hours/month, $5 free credit
- **Render**: 750 hours/month, sleeps after 15min inactivity
- **VPS**: Always-on but costs ~$5-10/month

### Security:
- ✅ Use HTTPS (Railway/Render provide automatically)
- ✅ Keep `ENOKI_PRIVATE_KEY` secret
- ✅ Enable CORS only for your domain
- ✅ Rate limiting recommended for production

---

## 📊 Monitoring

### Railway:
```bash
railway logs --service walrus-proxy
railway logs --service enoki-backend
```

### Render:
- Check logs in dashboard
- Real-time log streaming available

### VPS:
```bash
pm2 logs walrus-proxy
pm2 logs enoki-backend
pm2 monit
```

---

## ✅ Deployment Checklist

- [ ] Both backends deployed and running
- [ ] Health endpoints returning 200 OK
- [ ] ENOKI_PRIVATE_KEY environment variable set
- [ ] Frontend .env updated with production URLs
- [ ] Frontend rebuilt with new env vars
- [ ] Frontend redeployed to Walrus Sites
- [ ] Test profile creation with sponsored transactions
- [ ] Test Walrus upload functionality
- [ ] CORS configured for production domain
- [ ] Monitoring/logging configured

---

## 🆘 Troubleshooting

**Backend not starting:**
- Check logs for errors
- Verify Node.js version (18+)
- Ensure all dependencies installed

**Enoki errors:**
- Verify `ENOKI_PRIVATE_KEY` is set correctly
- Check crypto polyfill is working (Node 18)
- Test with curl to ensure endpoint accessible

**Walrus upload failing:**
- Ensure Walrus CLI installed on server
- Check file upload size limits
- Verify `/tmp` directory writable

**CORS errors:**
- Update CORS config to allow your frontend domain
- Check preflight OPTIONS requests

---

## 📚 Additional Resources

- [Railway Docs](https://docs.railway.app/)
- [Render Docs](https://render.com/docs)
- [PM2 Docs](https://pm2.keymetrics.io/docs/)
- [Walrus Docs](https://docs.walrus.site/)
- [Enoki Docs](https://docs.mystenlabs.com/enoki)
