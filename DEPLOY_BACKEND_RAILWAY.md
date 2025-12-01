# 🚀 Deploy Backend to Railway (FREE)

## Why Railway?
- ✅ **FREE** tier available
- ✅ Easiest to deploy
- ✅ Automatic HTTPS
- ✅ Git integration
- ✅ Perfect for this project

---

## 📋 Step-by-Step Deployment

### 1️⃣ Prepare Your Repository (5 minutes)

First, we need to push the `server/` folder to GitHub:

```bash
# Make sure you're in the project root
cd "/home/oem/Desktop/Information Processing App - Netlify"

# Add all new files
git add .

# Commit the backend server
git commit -m "Add PayPal backend server for production"

# Push to GitHub
git push origin gh-pages
```

### 2️⃣ Create Railway Account (2 minutes)

1. Go to: **https://railway.app**
2. Click **"Login"**
3. Choose **"Login with GitHub"**
4. Authorize Railway to access your GitHub

### 3️⃣ Deploy Your Backend (5 minutes)

1. **Click "New Project"**

2. **Select "Deploy from GitHub repo"**

3. **Choose your repository**: `information-processing-app`

4. **Railway will detect your project**
   - It might ask which folder to deploy
   - Select: **`server`**

5. **Add Environment Variables**
   - Click on your deployment
   - Go to "Variables" tab
   - Click "New Variable"
   - Add these ONE BY ONE:

   ```
   PAYPAL_CLIENT_ID
   Value: [Your LIVE PayPal Client ID]

   PAYPAL_CLIENT_SECRET
   Value: [Your LIVE PayPal Secret]

   PAYPAL_MODE
   Value: live

   FRONTEND_URL
   Value: https://tmaenge-dot.github.io/information-processing-app

   PORT
   Value: 3001
   ```

6. **Deploy!**
   - Railway will automatically build and deploy
   - Wait 2-3 minutes for deployment

7. **Get Your Backend URL**
   - Click "Settings" tab
   - Look for "Domains"
   - Click "Generate Domain"
   - Copy the URL (e.g., `https://your-app-production.up.railway.app`)
   - **SAVE THIS URL** - you'll need it!

### 4️⃣ Verify Backend is Running

Visit your backend URL + `/api/health`:

Example: `https://your-app-production.up.railway.app/api/health`

You should see:
```json
{
  "status": "ok",
  "mode": "live",
  "timestamp": "2025-12-01T..."
}
```

✅ If you see this, your backend is LIVE!

---

## 🔄 Alternative: If Railway Doesn't Auto-Detect Server Folder

If Railway deploys the whole repo instead of just the `server/` folder:

### Option A: Update Railway Settings
1. In Railway dashboard, click your service
2. Go to "Settings"
3. Find "Root Directory"
4. Set it to: `server`
5. Redeploy

### Option B: Create Separate Server Repo (Recommended)

Create a new repo just for the backend:

```bash
# Create new repo on GitHub called "information-processing-backend"

# Then locally:
cd server
git init
git add .
git commit -m "Initial commit - PayPal backend"
git remote add origin https://github.com/tmaenge-dot/information-processing-backend.git
git push -u origin main

# Then deploy THIS repo to Railway
```

---

## 📝 After Deployment Checklist

- [ ] Backend deployed to Railway
- [ ] Environment variables set (all 5)
- [ ] Generated Railway domain
- [ ] Tested `/api/health` endpoint
- [ ] Copied backend URL for frontend

---

## 🆘 Troubleshooting

**Deployment Failed?**
- Check that `package.json` is in server folder
- Verify `"type": "module"` is in package.json
- Check Railway logs for error messages

**Backend URL returns 404?**
- Make sure you're visiting `/api/health` (not just the root)
- Check Railway logs to see if server started

**Environment variables not working?**
- Make sure there are no typos
- PAYPAL_MODE must be exactly `live` (lowercase)
- No extra spaces in values

---

## 💰 You're Almost There!

Once your backend is deployed:

1. ✅ Backend is online and processing payments
2. ⏭️ Next: Update frontend `.env` with your Railway URL
3. ⏭️ Rebuild and deploy frontend
4. ✅ Start accepting REAL money!

---

**Backend URL from Railway:** `_______________________________`

**Write your URL here** ↑ (you'll need it for the frontend!)

---

## 🔗 Useful Railway Links

- Dashboard: https://railway.app/dashboard
- Documentation: https://docs.railway.app
- Support: https://help.railway.app

---

**Next Step:** Once backend is deployed, update your frontend configuration!
