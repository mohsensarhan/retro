# Deployment Guide

## Egyptian Food Bank - Executive Command Center

### Quick Deploy

This application can be deployed to various platforms. Here are the recommended options:

## 1. Vercel (Recommended)

### Prerequisites
- Vercel account
- GitHub repository connected

### Steps
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Configure environment variables (see below)
6. Deploy!

**Environment Variables:**
```
VITE_TEAMFLECT_API_KEY=your-tenant-id:your-api-key
```

## 2. Netlify

### Steps
1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Select your repository
5. Build command: `npm run build`
6. Publish directory: `dist`
7. Add environment variables
8. Deploy!

## 3. Docker

### Build Docker Image
```bash
# Create Dockerfile
cat > Dockerfile <<EOF
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# Build and run
docker build -t efb-command-center .
docker run -p 8080:80 efb-command-center
```

## 4. Static Hosting (S3, Azure Storage, GCS)

### Build
```bash
npm run build
```

### Upload
Upload the contents of the `dist` folder to your static hosting service.

## Security Checklist

Before deploying:

- [ ] Update API credentials in environment variables (never in code)
- [ ] Enable HTTPS/SSL
- [ ] Set up proper CORS policies
- [ ] Configure CSP headers
- [ ] Enable rate limiting
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategy

## Performance Optimization

### Recommended Settings
- Enable gzip/brotli compression
- Set proper cache headers
- Use CDN for static assets
- Enable HTTP/2
- Set up asset preloading

### Cache Headers Example (Nginx)
```nginx
location / {
  try_files $uri $uri/ /index.html;
  add_header Cache-Control "public, max-age=31536000";
}

location /index.html {
  add_header Cache-Control "no-cache";
}
```

## Post-Deployment

1. Test all features in production
2. Verify API connectivity
3. Check mobile responsiveness
4. Test across different browsers
5. Set up uptime monitoring
6. Configure error tracking (Sentry, etc.)

## Support

For deployment issues:
- Check build logs
- Verify environment variables
- Test locally with production build: `npm run build && npm run preview`
- Contact development team

---

**Production URL:** [Your Production URL]
**Staging URL:** [Your Staging URL]
