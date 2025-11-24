# Deploying Vocal GEM Frontend to Vercel - Complete Walkthrough

## Prerequisites
- [ ] GitHub account
- [ ] Your code pushed to GitHub
- [ ] Backend deployed on Render (and you have the URL)

---

## Step 1: Push Your Code to GitHub (If Not Already Done)

### 1.1 Initialize Git (if needed)
```bash
cd C:\Users\riley\Desktop\GEM
git init
```

### 1.2 Create `.gitignore` (if not exists)
Make sure these are in your `.gitignore`:
```
node_modules/
build/
dist/
.env
.env.local
backend/.env
backend/__pycache__/
backend/*.db
```

### 1.3 Commit and Push
```bash
git add .
git commit -m "Ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/vocal-gem.git
git push -u origin main
```

---

## Step 2: Sign Up for Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub

---

## Step 3: Import Your Project

### 3.1 Create New Project
1. Click **"Add New..."** → **"Project"**
2. Find your repository in the list
3. Click **"Import"** next to `vocal-gem` (or your repo name)

### 3.2 Configure Project Settings

**Framework Preset**: Vite (should auto-detect)

**Root Directory**: `.` (leave as root - do NOT select backend folder)

**Build Command**: 
```
npm run build
```

**Output Directory**: 
```
dist
```

**Install Command**: 
```
npm install
```

---

## Step 4: Add Environment Variables

### 4.1 Click "Environment Variables" Section

Add this variable:

**Key**: `VITE_API_URL`  
**Value**: `https://your-backend-name.onrender.com`  
(Replace with your actual Render backend URL)

**Important**: 
- ✅ Make sure it starts with `https://`
- ✅ No trailing slash at the end
- ✅ Example: `https://vocal-gem-api.onrender.com`

### 4.2 Apply to All Environments
- Check: Production
- Check: Preview  
- Check: Development

Click **"Add"**

---

## Step 5: Deploy!

1. Click **"Deploy"** button
2. Wait 2-3 minutes for build to complete
3. You'll see a success screen with your live URL!

Your app will be at: `https://your-project-name.vercel.app`

---

## Step 6: Update Backend CORS Settings

Now that you have your Vercel URL, update your Render backend:

### 6.1 Go to Render Dashboard
1. Open your backend web service
2. Click **"Environment"**
3. Find `ALLOWED_ORIGINS`
4. Update to: `https://your-project-name.vercel.app`
5. Click **"Save Changes"**

Your backend will automatically redeploy.

---

## Step 7: Test Your Deployment

### 7.1 Visit Your Vercel URL
Open `https://your-project-name.vercel.app`

### 7.2 Check Core Features
- [ ] App loads without errors
- [ ] Can request microphone permission
- [ ] Audio engine initializes
- [ ] Can create account / log in
- [ ] Games load and work
- [ ] Can create journal entries
- [ ] Sync works (check Network tab for API calls)

### 7.3 Check Browser Console
Press `F12` → Console tab
- Should see no red errors
- Should see successful API calls to your Render backend

---

## Step 8: Set Up Automatic Deployments

Good news - this is already done! 🎉

Every time you push to GitHub:
- Vercel automatically builds and deploys
- Takes ~2 minutes
- You get a preview URL for each commit

---

## Troubleshooting

### Issue: "Failed to fetch" or CORS errors
**Fix**: 
1. Check `ALLOWED_ORIGINS` in Render backend includes your Vercel URL
2. Make sure `VITE_API_URL` in Vercel matches your Render backend URL exactly

### Issue: "VITE_API_URL is undefined"
**Fix**: 
1. Go to Vercel project settings
2. Environment Variables
3. Make sure `VITE_API_URL` is set
4. Redeploy (Deployments → three dots → Redeploy)

### Issue: Build fails with "command not found"
**Fix**: 
1. Make sure `package.json` is in the root directory
2. Check Build Command is `npm run build`
3. Check Output Directory is `dist`

### Issue: App loads but shows blank page
**Fix**: 
1. Check browser console for errors
2. Verify `VITE_API_URL` is correct
3. Make sure backend is running on Render

---

## Advanced: Custom Domain (Optional)

### Add Your Own Domain

1. In Vercel project, go to **"Settings"** → **"Domains"**
2. Click **"Add"**
3. Enter your domain (e.g., `vocalgem.com`)
4. Follow DNS configuration instructions
5. Update `ALLOWED_ORIGINS` in Render to include new domain

---

## Monitoring Your Deployment

### View Logs
1. Go to Vercel project
2. Click **"Deployments"**
3. Click on any deployment
4. Click **"View Function Logs"** or **"Build Logs"**

### Analytics (Optional)
1. Vercel provides free analytics
2. Go to **"Analytics"** tab
3. See visitor stats, performance metrics

---

## Updating Your App

### Make Changes Locally
```bash
# Edit your code
git add .
git commit -m "Updated feature X"
git push
```

Vercel automatically:
1. Detects the push
2. Builds your app
3. Deploys to production
4. Takes ~2 minutes

---

## Quick Reference

**Your URLs**:
- Frontend: `https://your-project.vercel.app`
- Backend: `https://your-backend.onrender.com`

**Environment Variables**:
- Vercel: `VITE_API_URL=https://your-backend.onrender.com`
- Render: `ALLOWED_ORIGINS=https://your-project.vercel.app`

**Deployment Commands**:
- Build: `npm run build`
- Output: `dist`
- Framework: Vite

---

## Success Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] `VITE_API_URL` environment variable set
- [ ] Deployment successful
- [ ] Backend CORS updated with Vercel URL
- [ ] App accessible at Vercel URL
- [ ] All features working
- [ ] No console errors

---

## Next Steps

1. ✅ Test thoroughly using [TESTING.md](file:///c:/Users/riley/Desktop/GEM/TESTING.md)
2. ✅ Share your app URL with users
3. ✅ Monitor analytics and logs
4. ✅ Set up custom domain (optional)
5. ✅ Enable Vercel Analytics (optional)

**Congratulations! Your app is now live! 🚀**

---

## Support

If you encounter issues:
1. Check Vercel build logs
2. Check Render backend logs  
3. Review browser console errors
4. Verify environment variables are correct
5. Test API connection with Network tab (F12)
