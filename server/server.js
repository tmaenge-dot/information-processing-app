import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';
import paypalClient from './paypal-client.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

/**
 * Create PayPal Order
 * POST /api/orders
 */
app.post('/api/orders', async (req, res) => {
  try {
    const { planId, planName, amount } = req.body;

    if (!planId || !planName || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create order request
    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        description: `${planName} Subscription`,
        amount: {
          currency_code: 'USD',
          value: amount.toString()
        },
        custom_id: planId // Store plan ID for reference
      }],
      application_context: {
        brand_name: 'Information Processing App',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${process.env.FRONTEND_URL}/payment-success`,
        cancel_url: `${process.env.FRONTEND_URL}/pricing`
      }
    });

    // Execute request
    const order = await paypalClient().execute(request);
    
    res.json({
      id: order.result.id,
      status: order.result.status
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      error: 'Failed to create order',
      details: error.message 
    });
  }
});

/**
 * Capture PayPal Order
 * POST /api/orders/:orderID/capture
 */
app.post('/api/orders/:orderID/capture', async (req, res) => {
  try {
    const { orderID } = req.params;

    if (!orderID) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    // Capture order request
    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    // Execute capture
    const capture = await paypalClient().execute(request);

    // Extract purchase details
    const purchaseUnit = capture.result.purchase_units[0];
    const planId = purchaseUnit.custom_id;
    
    res.json({
      id: capture.result.id,
      status: capture.result.status,
      planId: planId,
      payer: {
        email: capture.result.payer.email_address,
        name: capture.result.payer.name.given_name + ' ' + capture.result.payer.name.surname
      },
      amount: purchaseUnit.payments.captures[0].amount.value,
      currency: purchaseUnit.payments.captures[0].amount.currency_code
    });
  } catch (error) {
    console.error('Error capturing order:', error);
    res.status(500).json({ 
      error: 'Failed to capture order',
      details: error.message 
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mode: process.env.PAYPAL_MODE || 'sandbox',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 PayPal Backend Server running on port ${PORT}`);
  console.log(`📍 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`💳 PayPal Mode: ${process.env.PAYPAL_MODE || 'sandbox'}`);
  console.log(`\n⚠️  Make sure to configure your .env file with PayPal credentials`);
});
