# Environment Setup Guide

## Quick Start - Setting Up .env Files

### Step 1: Frontend Environment Setup

1. **Navigate to the project root**:
   ```bash
   cd C:\Users\riley\Desktop\GEM
   ```

2. **Copy the example file**:
   ```bash
   copy .env.example .env
   ```

3. **Edit `.env`**:
   ```
   # For local development
   VITE_API_URL=http://localhost:5000
   
   # For production (after deploying backend)
   # VITE_API_URL=https://your-backend-url.onrender.com
   ```

### Step 2: Backend Environment Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Copy the example file**:
   ```bash
   copy .env.example .env
   ```

3. **Edit `backend/.env`**:
   ```bash
   # REQUIRED: Change this to a random string!
   # Generate one at: https://randomkeygen.com/
   SECRET_KEY=your-super-secret-random-key-here-change-this
   
   # For local development (SQLite)
   DATABASE_URL=sqlite:///gem.db
   
   # For production (PostgreSQL - Render will provide this)
   # DATABASE_URL=postgresql://user:password@host:port/database
   
   # OPTIONAL: Get your API key from https://makersuite.google.com/app/apikey
   GEMINI_API_KEY=your-gemini-api-key-here
   
   # For local development
   ALLOWED_ORIGINS=*
   FLASK_ENV=development
   
   # For production
   # ALLOWED_ORIGINS=https://your-frontend-domain.com
   # FLASK_ENV=production
   
   PORT=5000
   ```

### Step 3: Verify Setup

1. **Check files exist**:
   ```bash
   # From project root
   dir .env
   dir backend\.env
   ```

2. **Start backend** (to test):
   ```bash
   cd backend
   python run.py
   ```
   
   Should see: `Running on http://127.0.0.1:5000`

3. **Start frontend** (in new terminal):
   ```bash
   cd C:\Users\riley\Desktop\GEM
   npm run dev
   ```
   
   Should see: `Local: http://localhost:5173`

---

## Production Environment Setup

### For Render.com (Backend)

1. **In Render Dashboard**:
   - Go to your web service
   - Click "Environment" tab
   - Add these variables:

   ```
   SECRET_KEY=<generate-new-random-string>
   GEMINI_API_KEY=<your-api-key>
   ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
   FLASK_ENV=production
   ```

2. **Database URL**:
   - Render automatically sets `DATABASE_URL` when you add PostgreSQL
   - No need to set it manually

### For Vercel/Netlify (Frontend)

1. **In Vercel/Netlify Dashboard**:
   - Go to project settings
   - Find "Environment Variables"
   - Add:

   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

2. **Redeploy** after adding variables

---

## Getting API Keys

### Google Gemini API Key (Optional - for AI Coach)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key
4. Add to `backend/.env`:
   ```
   GEMINI_API_KEY=AIza...your-key-here
   ```

### Generating SECRET_KEY

**Option 1: Python**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

**Option 2: Online**
- Visit https://randomkeygen.com/
- Use "CodeIgniter Encryption Keys" or similar
- Copy and paste into `.env`

---

## Common Issues

### Issue: "VITE_API_URL is undefined"
**Fix**: Make sure `.env` file is in the project root (same level as `package.json`)

### Issue: "Database connection failed"
**Fix**: Check `DATABASE_URL` format. For PostgreSQL, must start with `postgresql://`

### Issue: "CORS error"
**Fix**: 
- Development: Set `ALLOWED_ORIGINS=*` in backend `.env`
- Production: Set `ALLOWED_ORIGINS=https://your-exact-frontend-domain.com`

### Issue: "AI Coach not responding"
**Fix**: 
- Check `GEMINI_API_KEY` is set correctly
- Verify API key is valid at https://makersuite.google.com/

---

## Security Checklist

- [ ] Changed `SECRET_KEY` from default
- [ ] Never commit `.env` files to Git (they're in `.gitignore`)
- [ ] Use different keys for development and production
- [ ] Restrict `ALLOWED_ORIGINS` in production (don't use `*`)
- [ ] Keep API keys secret and rotate them periodically

---

## Example Files

### Example `.env` (Frontend - Development)
```
VITE_API_URL=http://localhost:5000
```

### Example `.env` (Frontend - Production)
```
VITE_API_URL=https://vocal-gem-api.onrender.com
```

### Example `backend/.env` (Development)
```
SECRET_KEY=dev-secret-key-12345-change-in-production
DATABASE_URL=sqlite:///gem.db
GEMINI_API_KEY=AIzaSyC...your-key-here
ALLOWED_ORIGINS=*
FLASK_ENV=development
PORT=5000
```

### Example `backend/.env` (Production)
```
SECRET_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
DATABASE_URL=postgresql://user:pass@host.render.com:5432/dbname
GEMINI_API_KEY=AIzaSyC...your-key-here
ALLOWED_ORIGINS=https://vocal-gem.vercel.app,https://www.vocal-gem.vercel.app
FLASK_ENV=production
PORT=5000
```

---

## Next Steps

After setting up `.env` files:

1. ✅ Test locally (both frontend and backend)
2. ✅ Verify API connection works
3. ✅ Test AI Coach (if configured)
4. ✅ Follow [DEPLOYMENT.md](file:///c:/Users/riley/Desktop/GEM/DEPLOYMENT.md) for production deployment
5. ✅ Use [TESTING.md](file:///c:/Users/riley/Desktop/GEM/TESTING.md) to verify everything works
