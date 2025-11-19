# Deployment Guide - Pilgrim Notes PWA

This guide covers deploying your Pilgrim Notes Progressive Web App to various hosting platforms.

## 🚀 Quick Deploy

### Prerequisites
```bash
# Build the production bundle
npm run build

# Test production build locally
npm run preview
```

The `dist/` folder contains your production-ready static site.

---

## 📦 Platform-Specific Guides

### 1. Netlify (Recommended - Easiest)

#### Option A: Drag & Drop
1. Build: `npm run build`
2. Go to [https://app.netlify.com/drop](https://app.netlify.com/drop)
3. Drag the `dist/` folder to the drop zone
4. Done! Your app is live.

#### Option B: CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

#### Option C: Git Integration
1. Push code to GitHub/GitLab
2. Connect repository in Netlify dashboard
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Auto-deploys on every push

**netlify.toml** (already configured):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### 2. Vercel

#### CLI Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Git Integration
1. Import repository at [vercel.com](https://vercel.com)
2. Framework: Vite
3. Build command: `npm run build`
4. Output directory: `dist`

**vercel.json** (create if needed):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

### 3. GitHub Pages

#### Using gh-pages package
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}

# Deploy
npm run deploy
```

#### Manual GitHub Pages
```bash
# Build
npm run build

# Create gh-pages branch
git checkout --orphan gh-pages
git rm -rf .
cp -r dist/* .
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages --force
```

**Important:** Update `vite.config.ts` if deploying to a subdirectory:
```typescript
export default defineConfig({
  base: '/your-repo-name/', // Add this line
  // ... rest of config
})
```

---

### 4. Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting
# Choose: dist as public directory
# Configure as single-page app: Yes

# Build
npm run build

# Deploy
firebase deploy --only hosting
```

**firebase.json**:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

---

### 5. Cloudflare Pages

1. Go to [Cloudflare Pages](https://pages.cloudflare.com)
2. Connect your Git repository
3. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Deploy

Or use Wrangler CLI:
```bash
npm install -g wrangler
wrangler pages publish dist
```

---

### 6. AWS S3 + CloudFront

```bash
# Install AWS CLI
# Configure credentials: aws configure

# Build
npm run build

# Create S3 bucket
aws s3 mb s3://pilgrim-notes-pwa

# Upload files
aws s3 sync dist/ s3://pilgrim-notes-pwa --delete

# Enable static website hosting
aws s3 website s3://pilgrim-notes-pwa --index-document index.html --error-document index.html

# Create CloudFront distribution (for HTTPS)
# ... (use AWS Console or CLI)
```

---

### 7. Azure Static Web Apps

```bash
# Install Azure CLI
# Login: az login

# Build
npm run build

# Deploy
az staticwebapp create \
  --name pilgrim-notes-pwa \
  --resource-group my-resource-group \
  --source dist \
  --branch main
```

---

### 8. Docker + Nginx

**Dockerfile**:
```dockerfile
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf**:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

**Deploy**:
```bash
docker build -t pilgrim-notes-pwa .
docker run -p 80:80 pilgrim-notes-pwa
```

---

## 🔒 HTTPS Requirements

PWA features (camera, microphone, service workers) **require HTTPS**.

All the platforms above provide automatic HTTPS:
- Netlify: ✅ Free SSL
- Vercel: ✅ Free SSL
- GitHub Pages: ✅ Free SSL
- Firebase: ✅ Free SSL
- Cloudflare: ✅ Free SSL

For custom domains, enable SSL/TLS in your hosting dashboard.

---

## 🌍 Custom Domain

### Netlify
1. Go to Site settings → Domain management
2. Add custom domain
3. Update DNS:
   ```
   CNAME subdomain.yourdomain.com your-site.netlify.app
   ```

### Vercel
1. Go to Project settings → Domains
2. Add domain
3. Update DNS as instructed

### GitHub Pages
1. Go to repository Settings → Pages
2. Custom domain: enter your domain
3. Update DNS:
   ```
   CNAME subdomain.yourdomain.com username.github.io
   ```

---

## 📊 Performance Optimization

### Before Deploying

1. **Optimize Images**
   ```bash
   # Install imagemin
   npm install -g imagemin-cli

   # Optimize images
   imagemin public/*.png --out-dir=public
   ```

2. **Analyze Bundle**
   ```bash
   npm run build -- --mode analyze
   ```

3. **Test Performance**
   - Run Lighthouse audit
   - Check load time
   - Verify PWA installability

### After Deploying

1. **Enable Compression** (Most hosts do this automatically)
2. **Set Cache Headers** (Check hosting docs)
3. **Use CDN** (Most hosts provide this)

---

## 🧪 Testing Production Build

Before deploying, test locally:

```bash
# Build
npm run build

# Preview
npm run preview
# Opens at http://localhost:4173

# Test with different devices
# Mobile simulation in Chrome DevTools
```

### PWA Checklist
- [ ] App installs correctly
- [ ] Works offline after install
- [ ] Camera/microphone work (requires HTTPS)
- [ ] Notes save and load correctly
- [ ] PDF export works
- [ ] Audio recording works
- [ ] Web Share API works (on supported devices)

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

**.github/workflows/deploy.yml**:
```yaml
name: Deploy to Netlify

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2
        with:
          publish-dir: './dist'
          production-deploy: true
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## 🐛 Common Deployment Issues

### Issue: 404 on Refresh
**Solution:** Add SPA redirect rules (shown above for each platform)

### Issue: Camera/Mic Not Working
**Solution:** Ensure site is served over HTTPS

### Issue: Service Worker Not Updating
**Solution:**
```javascript
// Clear cache
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => reg.unregister());
  });
}
```

### Issue: Large Bundle Size
**Solution:**
- Code split: Already configured in vite.config.ts
- Optimize images before deployment
- Review bundle analyzer output

### Issue: Fonts Not Loading
**Solution:** Google Fonts already configured in index.html, should work automatically

---

## 📈 Monitoring

### Recommended Tools

1. **Google Analytics** (optional)
   Add to `index.html`:
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
   ```

2. **Sentry** (error tracking)
   ```bash
   npm install @sentry/browser
   ```

3. **Web Vitals**
   Already included in Vite

---

## 🎉 Success Checklist

After deployment:

- [ ] Site loads at your URL
- [ ] PWA passes Lighthouse audit (score 90+)
- [ ] Install prompt appears on mobile
- [ ] Works offline after installation
- [ ] All 58 sites display correctly
- [ ] Can create text/audio/image notes
- [ ] PDF export generates correctly
- [ ] Camera capture works
- [ ] Audio recording works
- [ ] Notes persist after closing app

---

## 📞 Support

If you encounter deployment issues:

1. Check hosting platform status page
2. Review build logs for errors
3. Test production build locally first
4. Check browser console for errors
5. Verify HTTPS is enabled

---

**Happy deploying! 🚀**

Your Pilgrim Notes PWA is now ready to serve pilgrims worldwide!
