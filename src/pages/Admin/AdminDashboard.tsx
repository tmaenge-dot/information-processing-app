import React, { useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Alert } from '@mui/material';
import logger, { LogLevel } from '../../utils/logger';
import { useAuth } from '../../hooks/useAuth';

const eventLabels: Record<string, string> = {
  payment_dialog_opened: 'Dialog Opened',
  payment_order_initiated: 'Order Initiated',
  payment_order_created: 'Order Created',
  payment_order_failed: 'Order Failed',
  payment_capture_initiated: 'Capture Initiated',
  payment_capture_failed: 'Capture Failed',
  payment_success: 'Payment Success',
  payment_error: 'Payment Error',
  payment_cancelled: 'Payment Cancelled',
  revenue_event: 'Revenue Event',
};


const AdminDashboard: React.FC = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const [logs, setLogs] = useState(() => {
    try {
      return logger.getLogs().filter(l => l.context === 'Payment' || l.context === 'PayPal' || l.message.includes('payment') || l.message.includes('revenue'));
    } catch (e) {
      return [];
    }
  });

  // Calculate summary stats
  const summary = React.useMemo(() => {
    let attempts = 0, successes = 0, failures = 0, cancels = 0, totalRevenue = 0;
    const revenueByPlan: Record<string, number> = {};
    logs.forEach(log => {
      const event = log.message.match(/Event: (\w+)/)?.[1] || log.message;
      if (event === 'payment_order_initiated' || event === 'payment_order_created') attempts++;
      if (event === 'payment_success') {
        successes++;
        const amt = Number(log.data?.amount || log.data?.price || 0);
        totalRevenue += amt;
        const plan = log.data?.planName || log.data?.planId || 'Unknown';
        if (!revenueByPlan[plan]) revenueByPlan[plan] = 0;
        revenueByPlan[plan] += amt;
      }
      if (event === 'payment_capture_failed' || event === 'payment_order_failed' || log.level === LogLevel.ERROR || log.level === LogLevel.CRITICAL) failures++;
      if (event === 'payment_cancelled') cancels++;
    });
    return { attempts, successes, failures, cancels, totalRevenue, revenueByPlan };
  }, [logs]);

  const handleRefresh = () => {
    try {
      setLogs(logger.getLogs().filter(l => l.context === 'Payment' || l.context === 'PayPal' || l.message.includes('payment') || l.message.includes('revenue')));
    } catch (e) {
      setLogs([]);
    }
  };

  const handleDownload = () => {
    logger.downloadLogs();
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <Box p={4}>
        <Alert severity="error">Access denied. Admins only.</Alert>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>Admin Payment Analytics (Debug: {logs.length} logs)</Typography>
      <Alert severity="info" sx={{ mb: 2 }}>If you see this message, the dashboard component is rendering. If you see no data below, there may be no payment logs yet.</Alert>
      <Button variant="contained" color="primary" onClick={handleRefresh} sx={{ mr: 2 }}>Refresh</Button>
      <Button variant="outlined" color="secondary" onClick={handleDownload}>Download All Logs</Button>

      {/* Summary Section */}
      <Box mt={4} mb={4} display="flex" gap={4} flexWrap="wrap">
        <Paper sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle2">Payment Attempts</Typography>
          <Typography variant="h5" color="primary">{summary.attempts}</Typography>
        </Paper>
        <Paper sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle2">Successes</Typography>
          <Typography variant="h5" color="success.main">{summary.successes}</Typography>
        </Paper>
        <Paper sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle2">Failures</Typography>
          <Typography variant="h5" color="error.main">{summary.failures}</Typography>
        </Paper>
        <Paper sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle2">Cancellations</Typography>
          <Typography variant="h5" color="warning.main">{summary.cancels}</Typography>
        </Paper>
        <Paper sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle2">Total Revenue</Typography>
          <Typography variant="h5" color="primary">${summary.totalRevenue.toFixed(2)}</Typography>
        </Paper>
        <Paper sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle2">Revenue by Plan</Typography>
          {Object.entries(summary.revenueByPlan).length === 0 ? (
            <Typography variant="body2">No payments yet</Typography>
          ) : (
            Object.entries(summary.revenueByPlan).map(([plan, amt]) => (
              <Typography key={plan} variant="body2">{plan}: ${amt.toFixed(2)}</Typography>
            ))
          )}
        </Paper>
      </Box>

      {/* Table Section */}
      <Box mt={2}>
        {logs.length === 0 ? (
          <Alert severity="info">No payment or revenue logs found. Try making a payment or refresh the page.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Event</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.slice().reverse().map((log, idx) => {
                  const event = log.message.match(/Event: (\w+)/)?.[1] || log.message;
                  const plan = log.data?.planName || log.data?.planId || '';
                  const user = log.userId || log.data?.userId || '';
                  const amount = log.data?.amount || log.data?.price || '';
                  const status = log.level === LogLevel.ERROR || log.level === LogLevel.CRITICAL || event?.toLowerCase().includes('fail') ? '❌ Failed' : (event?.toLowerCase().includes('success') ? '✅ Success' : '');
                  return (
                    <TableRow key={idx}>
                      <TableCell>{log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}</TableCell>
                      <TableCell>{eventLabels[event] || event}</TableCell>
                      <TableCell>{plan}</TableCell>
                      <TableCell>{user}</TableCell>
                      <TableCell>{amount ? `$${amount}` : ''}</TableCell>
                      <TableCell>{status && <Chip label={status} color={status.includes('Success') ? 'success' : 'error'} size="small" />}</TableCell>
                      <TableCell><pre style={{ fontSize: 10, margin: 0 }}>{JSON.stringify(log.data, null, 2)}</pre></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard;
