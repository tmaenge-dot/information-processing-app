# 🔐 PAYPAL PAYMENT INTEGRATION SETUP GUIDE

## 📋 Overview
This guide will help you set up real PayPal payment processing for your Information Processing App.

---

## 🚀 STEP 1: Create PayPal Developer Account

1. **Go to PayPal Developer Portal**
   - Visit: https://developer.paypal.com
   - Click "Log in to Dashboard"
   - Sign in with your PayPal account (or create one)

2. **Create a Sandbox App** (For Testing)
   - Go to "My Apps & Credentials"
   - Under "Sandbox", click "Create App"
   - Enter app name: "Information Processing App - Test"
   - Click "Create App"
   - **Copy both credentials:**
     - Client ID
     - Secret

3. **Create a Live App** (For Production - when ready)
   - Under "Live", click "Create App"
   - Enter app name: "Information Processing App"
   - Click "Create App"
   - **Copy both credentials:**
     - Client ID
     - Secret

---

## 🔧 STEP 2: Configure Backend Server

1. **Navigate to server folder**
   ```bash
   cd server
   ```

2. **Copy environment template**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` file** with your credentials:
   ```
   # For TESTING (Sandbox)
   PAYPAL_CLIENT_ID=your_sandbox_client_id_from_step1
   PAYPAL_CLIENT_SECRET=your_sandbox_secret_from_step1
   PAYPAL_MODE=sandbox
   
   # Server Configuration
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   ```

4. **Install backend dependencies**
   ```bash
   npm install
   ```

5. **Start backend server**
   ```bash
   npm start
   ```
   
   You should see:
   ```
   🚀 PayPal Backend Server running on port 3001
   📍 Frontend URL: http://localhost:5173
   💳 PayPal Mode: sandbox
   ```

---

## 🎨 STEP 3: Configure Frontend

1. **Navigate back to main folder**
   ```bash
   cd ..
   ```

2. **Copy environment template**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` file** with your Client ID:
   ```
   # Use ONLY the Client ID (NOT the secret!)
   VITE_PAYPAL_CLIENT_ID=your_sandbox_client_id_from_step1
   VITE_API_URL=http://localhost:3001
   ```

4. **Install frontend dependencies**
   ```bash
   npm install @paypal/react-paypal-js
   ```

5. **Start frontend development server**
   ```bash
   npm run dev
   ```

---

## 🧪 STEP 4: Test Payments (Sandbox Mode)

1. **Open your app**
   - Go to: http://localhost:5173/information-processing-app

2. **Navigate to Pricing page**
   - Click "Pricing & Plans" in sidebar

3. **Click "Choose Plan" on any plan**
   - Payment dialog will open with PayPal button

4. **Use PayPal Sandbox Test Account**
   - Click the PayPal button
   - You'll be redirected to PayPal sandbox
   - **Test credentials** (create at https://developer.paypal.com/dashboard/accounts):
     - Email: Create a test buyer account
     - Password: Use the test account password

5. **Complete test payment**
   - Follow PayPal's test checkout flow
   - Payment will be processed in SANDBOX mode
   - NO REAL MONEY is charged
   - Your app subscription will be upgraded

---

## 💰 STEP 5: Go Live (Production Mode)

### ⚠️ IMPORTANT: Only do this when ready to accept real payments!

1. **Update Backend `.env`** (server/.env):
   ```
   # Switch to LIVE credentials
   PAYPAL_CLIENT_ID=your_live_client_id_from_step1
   PAYPAL_CLIENT_SECRET=your_live_secret_from_step1
   PAYPAL_MODE=live
   
   # Update frontend URL to your deployed site
   FRONTEND_URL=https://tmaenge-dot.github.io/information-processing-app
   ```

2. **Update Frontend `.env`**:
   ```
   # Switch to LIVE Client ID
   VITE_PAYPAL_CLIENT_ID=your_live_client_id_from_step1
   
   # Point to your deployed backend
   VITE_API_URL=https://your-backend-server.com
   ```

3. **Deploy Backend Server**
   - Options:
     - **Heroku**: https://heroku.com (Free tier available)
     - **Railway**: https://railway.app (Free tier available)
     - **Render**: https://render.com (Free tier available)
     - **DigitalOcean**: https://digitalocean.com
   
   - Example for Railway:
     ```bash
     # Install Railway CLI
     npm i -g @railway/cli
     
     # Login
     railway login
     
     # Deploy from server folder
     cd server
     railway init
     railway up
     
     # Set environment variables in Railway dashboard
     # Copy from your .env file
     ```

4. **Rebuild and deploy frontend**
   ```bash
   npm run build
   npx gh-pages -d dist -f --dotfiles
   ```

---

## 💳 Where Your Money Goes

### Sandbox Mode (Testing):
- ❌ NO real money is processed
- ✅ Simulated transactions only
- ✅ Perfect for development and testing

### Live Mode (Production):
- ✅ **Real payments** are processed
- ✅ Money goes to **YOUR PayPal account**
- ✅ You can withdraw to your bank account
- ✅ PayPal charges fees:
   - Domestic: 2.9% + $0.30 per transaction
   - International: 4.4% + fixed fee

### Example:
- User pays $10 for monthly plan
- PayPal fee: $0.59 (2.9% + $0.30)
- **You receive: $9.41**
- Funds appear in your PayPal account instantly
- Withdraw to bank (usually 1-3 business days)

---

## 📊 Managing Subscriptions

### Current Setup (One-time Payments):
- Users pay once when upgrading
- Subscription is activated in browser memory
- **Problem**: Resets when they close the browser

### Recommended Next Steps:
1. **Add Database** (Firebase, Supabase, or MongoDB)
   - Store user accounts
   - Track subscription status
   - Persist across sessions

2. **Add User Authentication**
   - Real login system
   - Link payments to user accounts
   - Secure subscription access

3. **Add PayPal Webhooks**
   - Automatically track payment status
   - Handle refunds, disputes
   - Update subscription in database

---

## 🔒 Security Checklist

✅ **DO:**
- Keep `.env` files out of Git (already in .gitignore)
- Use HTTPS in production
- Store secrets only on server
- Validate payments on server-side

❌ **DON'T:**
- Commit API keys to GitHub
- Trust client-side payment validation alone
- Skip webhook verification
- Expose client secret in frontend

---

## 🆘 Troubleshooting

### "PayPal credentials not configured"
- ✅ Check server/.env file exists
- ✅ Verify PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are set
- ✅ Restart backend server

### "Failed to create order"
- ✅ Check backend server is running (http://localhost:3001/api/health)
- ✅ Verify VITE_API_URL matches backend URL
- ✅ Check browser console for errors

### PayPal button doesn't show
- ✅ Check VITE_PAYPAL_CLIENT_ID is set correctly
- ✅ Verify @paypal/react-paypal-js is installed
- ✅ Check browser console for errors

### Test payment fails
- ✅ Make sure using SANDBOX mode
- ✅ Use PayPal sandbox test account
- ✅ Check PayPal developer logs

---

## 📞 Support Resources

- **PayPal Developer Docs**: https://developer.paypal.com/docs/
- **PayPal Sandbox**: https://developer.paypal.com/dashboard/accounts
- **PayPal Support**: https://www.paypal.com/businesshelp/contact
- **This App's Backend Health**: http://localhost:3001/api/health

---

## ✅ Quick Start Checklist

- [ ] Created PayPal Developer account
- [ ] Created Sandbox app, copied credentials
- [ ] Configured server/.env with sandbox credentials
- [ ] Installed backend dependencies (`cd server && npm install`)
- [ ] Started backend server (`npm start`)
- [ ] Configured .env with VITE_PAYPAL_CLIENT_ID
- [ ] Installed @paypal/react-paypal-js (`npm install @paypal/react-paypal-js`)
- [ ] Started frontend (`npm run dev`)
- [ ] Tested payment with PayPal sandbox account
- [ ] Payment successful, subscription activated!

---

**Need help? Check the troubleshooting section above or consult PayPal's developer documentation.**
