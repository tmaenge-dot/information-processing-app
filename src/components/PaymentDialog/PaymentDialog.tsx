import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Lock,
  CheckCircle,
  CreditCard
} from '@mui/icons-material';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { SubscriptionPlan } from '../../types/subscription';

// PayPal configuration
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
  onPaymentComplete: (planId: string) => void;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({ 
  open, 
  onClose, 
  plan, 
  onPaymentComplete 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create PayPal order
  const createOrder = async () => {
    if (!plan) return '';

    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          planName: plan.name,
          amount: plan.price
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      return data.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
      throw err;
    }
  };

  // Capture PayPal order
  const onApprove = async (data: any) => {
    if (!plan) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/orders/${data.orderID}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const captureData = await response.json();

      if (!response.ok) {
        throw new Error(captureData.error || 'Failed to capture payment');
      }

      console.log('Payment captured:', captureData);
      
      // Mark payment as successful
      setPaymentSuccess(true);
      
      // Update user's subscription
      onPaymentComplete(plan.id);
      
      // Close dialog after short delay
      setTimeout(() => {
        onClose();
        setPaymentSuccess(false);
        setIsProcessing(false);
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setIsProcessing(false);
    }
  };

  const onError = (err: any) => {
    console.error('PayPal error:', err);
    setError('Payment failed. Please try again.');
    setIsProcessing(false);
  };

  const onCancel = () => {
    console.log('Payment cancelled by user');
    setError(null);
  };

  if (!plan) return null;

  // PayPal initial options
  const initialOptions = {
    clientId: PAYPAL_CLIENT_ID,
    currency: 'USD',
    intent: 'capture',
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <CreditCard color="primary" />
          <Box>
            <Typography variant="h6">Complete Your Purchase</Typography>
            <Typography variant="body2" color="text.secondary">
              Upgrade to {plan.name} - ${plan.price}/{plan.period}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Payment Success Message */}
        {paymentSuccess && (
          <Alert 
            icon={<CheckCircle />} 
            severity="success" 
            sx={{ mb: 3 }}
          >
            <Typography variant="body1" fontWeight="bold">
              Payment Successful! 🎉
            </Typography>
            <Typography variant="body2">
              Your subscription has been activated. Redirecting...
            </Typography>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            onClose={() => setError(null)}
          >
            <Typography variant="body2">
              {error}
            </Typography>
          </Alert>
        )}

        {/* Plan Summary */}
        <Box mb={3} p={2} bgcolor="grey.50" borderRadius={2}>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            Order Summary
          </Typography>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body1">{plan.name} Plan</Typography>
              <Typography variant="body2" color="text.secondary">
                {plan.period === 'yearly' ? 'Annual billing' : 'Monthly billing'}
              </Typography>
            </Box>
            <Box textAlign="right">
              <Typography variant="h6" fontWeight="bold">
                ${plan.price}
              </Typography>
              {plan.period === 'yearly' && (
                <Chip label="Save 17%" color="success" size="small" />
              )}
            </Box>
          </Box>
        </Box>

        {/* Security Notice */}
        <Alert 
          icon={<Lock />} 
          severity="info" 
          sx={{ mb: 3 }}
        >
          <Typography variant="body2">
            <strong>Secure Payment:</strong> Your payment is processed securely through PayPal. 
            We never store your payment information.
          </Typography>
        </Alert>

        {/* PayPal Buttons */}
        {!paymentSuccess && !isProcessing && (
          <PayPalScriptProvider options={initialOptions}>
            <PayPalButtons
              style={{
                layout: 'vertical',
                color: 'gold',
                shape: 'rect',
                label: 'paypal',
              }}
              createOrder={createOrder}
              onApprove={onApprove}
              onError={onError}
              onCancel={onCancel}
              disabled={isProcessing}
            />
          </PayPalScriptProvider>
        )}

        {/* Processing Indicator */}
        {isProcessing && !paymentSuccess && (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={4}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Processing your payment...
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isProcessing}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog;