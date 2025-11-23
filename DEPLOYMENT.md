# Vocal GEM - Deployment Guide

## Prerequisites

- [ ] Node.js 18+ installed
- [ ] Python 3.9+ installed
- [ ] PostgreSQL database (for production)
- [ ] Google Gemini API key (for AI Coach feature)
- [ ] Hosting accounts (Render/Heroku for backend, Vercel/Netlify for frontend)

---

## Phase 1: Backend Deployment

### Option A: Deploy to Render.com (Recommended)

1. **Create New Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `backend` directory as root

2. **Configure Build Settings**
   ```
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn app:app
   ```

3. **Add Environment Variables**
   ```
   SECRET_KEY=<generate-random-string>
   DATABASE_URL=<render-will-provide-this>
   GEMINI_API_KEY=<your-api-key>
   ```

4. **Create PostgreSQL Database**
   - In Render, create a new PostgreSQL database
   - Copy the "Internal Database URL"
   - Add it as `DATABASE_URL` environment variable

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the service URL (e.g., `https://vocal-gem-api.onrender.com`)

### Option B: Deploy to Heroku

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create new app
heroku create vocal-gem-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set SECRET_KEY=your-secret-key
heroku config:set GEMINI_API_KEY=your-api-key

# Deploy
git subtree push --prefix backend heroku main
```

---

## Phase 2: Database Setup

### Run Migrations

After backend is deployed, you need to initialize the database:

1. **Access your backend shell** (Render or Heroku)

2. **Run Python shell**:
   ```python
   from app import create_app, db
   app = create_app()
   with app.app_context():
       db.create_all()
   ```

3. **Verify tables created**:
   - `user`
   - `journal`
   - `stats`
   - `settings`

---

## Phase 3: Frontend Deployment

### Option A: Deploy to Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Configure Environment**
   - Create `.env.production` file:
     ```
     VITE_API_URL=https://your-backend-url.onrender.com
     ```

3. **Deploy**
   ```bash
   cd GEM
   vercel --prod
   ```

4. **Configure Project Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Option B: Deploy to Netlify

1. **Build the app**
   ```bash
   npm run build
   ```

2. **Deploy via Netlify CLI or UI**
   ```bash
   netlify deploy --prod --dir=dist
   ```

3. **Set Environment Variables** in Netlify dashboard:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

---

## Phase 4: Mobile App Deployment (Optional)

### Android

1. **Build the web app**
   ```bash
   npm run build
   ```

2. **Sync Capacitor**
   ```bash
   npx cap sync android
   ```

3. **Build APK**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

4. **Sign and upload to Google Play Store**

### iOS

1. **Sync Capacitor**
   ```bash
   npx cap sync ios
   ```

2. **Open in Xcode**
   ```bash
   npx cap open ios
   ```

3. **Build and submit to App Store**

---

## Phase 5: Post-Deployment Testing

### Backend Health Check

```bash
curl https://your-backend-url.com/api/health
```

Expected: `{"status": "ok"}`

### Frontend Verification

1. **Visit your deployed URL**
2. **Test Core Features**:
   - [ ] Audio engine initializes
   - [ ] Games load and play
   - [ ] AI Coach responds (if API key configured)
   - [ ] Offline mode works
   - [ ] Sync works when online

3. **Test Authentication**:
   - [ ] Sign up new account
   - [ ] Log in
   - [ ] Log out
   - [ ] Session persists

4. **Test Sync**:
   - [ ] Create journal entry → verify it syncs
   - [ ] Play game → verify score syncs
   - [ ] Change settings → verify they sync

---

## Phase 6: Monitoring & Maintenance

### Set Up Monitoring

1. **Backend Monitoring** (Render/Heroku provides this)
   - Monitor response times
   - Track error rates
   - Set up alerts for downtime

2. **Frontend Monitoring** (Optional: Sentry)
   ```bash
   npm install @sentry/react
   ```

### Database Backups

- **Render**: Automatic daily backups
- **Heroku**: Configure backup schedule

### SSL/HTTPS

- Both Render and Vercel provide automatic HTTPS
- Ensure `VITE_API_URL` uses `https://`

---

## Rollback Procedures

### Backend Rollback (Render)

1. Go to Render Dashboard
2. Select your service
3. Click "Deploys" tab
4. Find previous successful deploy
5. Click "Redeploy"

### Frontend Rollback (Vercel)

1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments"
4. Find previous deployment
5. Click "..." → "Promote to Production"

---

## Troubleshooting

### Common Issues

**Issue**: "CORS Error"
- **Fix**: Ensure backend CORS is configured for your frontend domain

**Issue**: "Database connection failed"
- **Fix**: Check `DATABASE_URL` format (should start with `postgresql://`)

**Issue**: "AI Coach not responding"
- **Fix**: Verify `GEMINI_API_KEY` is set correctly

**Issue**: "Sync not working"
- **Fix**: Check browser console for errors, verify user is logged in

---

## Security Checklist

- [ ] Change `SECRET_KEY` from default
- [ ] Use HTTPS for all connections
- [ ] Configure CORS for production domains only
- [ ] Enable database SSL connections
- [ ] Set secure cookie flags
- [ ] Rate limit API endpoints
- [ ] Sanitize user inputs
- [ ] Keep dependencies updated

---

## Support

For issues or questions:
- Check the GitHub Issues
- Review application logs
- Contact support team

**Last Updated**: 2025-11-23
