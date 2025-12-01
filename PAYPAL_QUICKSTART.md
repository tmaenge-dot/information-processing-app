# 🚀 Quick Start - PayPal Integration

## ⚡ 5-Minute Setup (For Testing)

### 1️⃣ Get PayPal Sandbox Credentials (2 minutes)
1. Go to https://developer.paypal.com
2. Login and go to "My Apps & Credentials"
3. Under "Sandbox", create an app
4. Copy **Client ID** and **Secret**

### 2️⃣ Setup Backend (1 minute)
```bash
cd server
cp .env.example .env
# Edit .env and paste your credentials
npm install
npm start
```

### 3️⃣ Setup Frontend (1 minute)
```bash
cd ..
cp .env.example .env
# Edit .env and paste your Client ID
npm install @paypal/react-paypal-js
npm run dev
```

### 4️⃣ Test Payment (1 minute)
1. Open http://localhost:5173/information-processing-app
2. Go to Pricing → Choose a plan
3. Click PayPal button
4. Use PayPal sandbox test account
5. ✅ Payment complete!

---

## 📚 Full Documentation
See [PAYPAL_SETUP_GUIDE.md](./PAYPAL_SETUP_GUIDE.md) for complete instructions.

---

## 💰 Where Does Money Go?

### Testing (Sandbox Mode):
- ❌ NO real money - just testing
- ✅ Safe to experiment

### Production (Live Mode):
- ✅ Real payments processed
- ✅ Money goes to **YOUR PayPal account**
- ✅ Withdraw to your bank account
- Fee: 2.9% + $0.30 per transaction

---

## 🛠️ Project Structure

```
/
├── src/                          # Frontend React app
│   ├── components/
│   │   └── PaymentDialog/       # PayPal payment integration
│   └── ...
├── server/                       # Backend API
│   ├── server.js                # Express server with PayPal
│   ├── paypal-client.js         # PayPal configuration
│   └── package.json             # Backend dependencies
├── .env.example                  # Frontend env template
└── PAYPAL_SETUP_GUIDE.md        # Detailed setup guide
```

---

## ✅ What's Included

✅ **Real PayPal Integration**
- PayPal Buttons in payment dialog
- Secure server-side payment processing
- Sandbox & Live mode support

✅ **Backend Server**
- Express.js API for payment processing
- PayPal SDK integration
- CORS enabled for frontend

✅ **Security**
- API keys kept secret on server
- Client-side only has public Client ID
- Payment validation on server

✅ **Ready to Deploy**
- Environment configuration
- Production-ready code
- Deployment instructions

---

## 🔄 Next Steps

### Required for Production:
1. **Add Database** - Store user subscriptions (currently browser-only)
2. **Add Auth** - Real user accounts and login
3. **Deploy Backend** - Use Heroku, Railway, or Render
4. **Switch to Live Mode** - Get live PayPal credentials

### Optional Enhancements:
- PayPal webhooks for automatic subscription updates
- Recurring billing/subscriptions
- Refund handling
- Email receipts

---

## 🆘 Troubleshooting

**Backend won't start?**
- Check `.env` file exists in `server/` folder
- Verify PayPal credentials are correct

**PayPal button doesn't show?**
- Check frontend `.env` has `VITE_PAYPAL_CLIENT_ID`
- Make sure `@paypal/react-paypal-js` is installed
- Check browser console for errors

**Payment fails?**
- Make sure backend server is running
- Verify `VITE_API_URL` matches backend URL
- Use PayPal sandbox test account in sandbox mode

---

## 📞 Support

- **PayPal Docs**: https://developer.paypal.com/docs/
- **Full Setup Guide**: [PAYPAL_SETUP_GUIDE.md](./PAYPAL_SETUP_GUIDE.md)
- **Backend Health**: http://localhost:3001/api/health

---

**Ready to accept payments? Follow the Quick Start above! 🎉**
