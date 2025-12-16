import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';
import paypalClient from './paypal-client.js';
import logger from './logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // Log request
  logger.debug(`Incoming request: ${req.method} ${req.path}`, 'HTTP', {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip || req.connection.remoteAddress
  });
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.request(req, res, duration);
  });
  
  next();
});

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
    
    logger.info('Creating PayPal order', 'PayPal', { planId, planName, amount });
    logger.event('revenue_event', 'PayPal', {
      type: 'order_initiated',
      planId,
      planName,
      amount,
      currency: 'USD',
      timestamp: new Date().toISOString(),
      userId: req.body.userId || null
    });

    if (!planId || !planName || !amount) {
      logger.warn('Missing required fields for order creation', 'PayPal', { planId, planName, amount });
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
    
    logger.info('PayPal order created successfully', 'PayPal', { 
      orderId: order.result.id,
      status: order.result.status,
      planId 
    });
    logger.event('revenue_event', 'PayPal', {
      type: 'order_created',
      orderId: order.result.id,
      planId,
      planName,
      amount,
      currency: 'USD',
      status: order.result.status,
      timestamp: new Date().toISOString(),
      userId: req.body.userId || null
    });
    
    res.json({
      id: order.result.id,
      status: order.result.status
    });
  } catch (error) {
    logger.error('Error creating PayPal order', 'PayPal', error, {
      planId: req.body.planId,
      amount: req.body.amount
    });
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
    
    logger.info('Capturing PayPal order', 'PayPal', { orderID });

    if (!orderID) {
      logger.warn('Order ID missing for capture', 'PayPal');
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
    
    logger.info('PayPal order captured successfully', 'PayPal', { 
      orderId: capture.result.id,
      status: capture.result.status,
      planId,
      amount: purchaseUnit.payments.captures[0].amount.value,
      payerEmail: capture.result.payer.email_address
    });
    logger.event('revenue_event', 'PayPal', {
      type: 'payment_success',
      orderId: capture.result.id,
      planId,
      amount: purchaseUnit.payments.captures[0].amount.value,
      currency: purchaseUnit.payments.captures[0].amount.currency_code,
      payerEmail: capture.result.payer.email_address,
      payerName: capture.result.payer.name.given_name + ' ' + capture.result.payer.name.surname,
      timestamp: new Date().toISOString(),
      userId: req.body.userId || null
    });
    
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
    logger.error('Error capturing PayPal order', 'PayPal', error, {
      orderID: req.params.orderID
    });
    logger.event('revenue_event', 'PayPal', {
      type: 'payment_failure',
      orderId: req.params.orderID,
      error: error.message,
      timestamp: new Date().toISOString(),
      userId: req.body.userId || null
    });
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
  const healthData = { 
    status: 'ok', 
    mode: (process.env.PAYPAL_MODE || 'sandbox').toLowerCase(),
    timestamp: new Date().toISOString()
  };
  
  logger.debug('Health check', 'Health', healthData);
  
  res.json(healthData);
});

// Global error handler
app.use((err, req, res, next) => {
  logger.critical('Unhandled error in Express', 'Express', err, {
    method: req.method,
    path: req.path,
    body: req.body
  });
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  logger.info('PayPal Backend Server started', 'Server', {
    port: PORT,
    frontendUrl: process.env.FRONTEND_URL,
    paypalMode: process.env.PAYPAL_MODE || 'sandbox',
    nodeEnv: process.env.NODE_ENV || 'development'
  });
  
  console.log(`🚀 PayPal Backend Server running on port ${PORT}`);
  console.log(`📍 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`💳 PayPal Mode: ${process.env.PAYPAL_MODE || 'sandbox'}`);
  console.log(`\n⚠️  Make sure to configure your .env file with PayPal credentials`);
});
