# Production Logging Configuration

  +## Overview
This application now includes comprehensive producti5on logging for both frontend (React) and backend (Node.js) components.

## Frontend Logging

### Logger Location
- **File**: `src/utils/logger.ts`
- **Type**: TypeScript utility class
- **Import**: `import logger from './utils/logger'`

### Log Levels
1. **DEBUG** - Development only, detailed debugging information
2. **INFO** - General informational messages
3. **WARN** - Warning messages for potential issues
4. **ERROR** - Error messages for recoverable errors
5. **CRITICAL** - Critical errors that may break the system

### Usage Examples

```typescript
import logger from './utils/logger';

// Info logging
logger.info('User logged in successfully', 'Auth', { userId: '123' });

// Error logging
logger.error('Failed to fetch data', 'API', error, { endpoint: '/api/users' });

// Event tracking
logger.event('button_clicked', 'UI', { buttonId: 'submit' });

// Performance tracking
logger.performance('api_call', 1250, 'API', { endpoint: '/api/data' });

// Warning
logger.warn('API response slow', 'API', { duration: 5000 });

// Critical error
logger.critical('Database connection lost', 'Database', error);
```

### Features Implemented

1. **Structured Logging**
   - All logs include timestamp, level, message, context, and metadata
   - Production logs output as JSON for easy parsing
   - Development logs use colored console output

2. **Error Tracking**
   - Global error handler captures uncaught errors
   - Unhandled promise rejection tracking
   - Error context includes file, line number, and stack trace

3. **Event Tracking**
   - User actions (login, logout, registration)
   - Plan upgrades and subscription changes
   - Feature usage tracking

4. **Performance Monitoring**
   - Track execution time of operations
   - Automatic request/response timing

5. **User Context**
   - Logs include user ID when available
   - Browser information (user agent)
   - Current URL

6. **Log Buffer**
   - Maintains last 100 log entries in memory
   - Can download logs as JSON file
   - Useful for debugging and support

### Frontend Integration Points

1. **App.tsx** - Application lifecycle, global error handling
2. **useAuth.tsx** - Authentication events (login, logout, registration)
3. **useSubscription.tsx** - Subscription changes, usage tracking

## Backend Logging

### Logger Location
- **File**: `server/logger.js`
- **Type**: CommonJS/ES6 module
- **Import**: `import logger from './logger.js'`

### Features Implemented

1. **HTTP Request Logging**
   - Automatic logging of all HTTP requests
   - Includes method, path, status code, duration
   - Client IP and user agent tracking

2. **PayPal Integration Logging**
   - Order creation tracking
   - Order capture tracking
   - Error details for failed transactions

3. **Structured JSON Output**
   - Production logs are JSON formatted
   - Compatible with log aggregation services (ELK, Splunk, etc.)
   - Development logs are colorized and readable

4. **Error Handling**
   - Global error handler middleware
   - Detailed error logging with stack traces
   - Safe error messages in production

### Backend Integration Points

1. **server.js** - HTTP middleware, PayPal endpoints, error handling
2. **All API routes** - Request/response logging
3. **Error handlers** - Critical error tracking

## Production Configuration

### Environment Variables

Add to your `.env` file:

```bash
# Logging Configuration
NODE_ENV=production
LOG_LEVEL=info
```

### Vite Build Configuration

The `vite.config.ts` is already configured for production:
- Source maps disabled for security
- Minification enabled
- Code splitting optimized

### Log Aggregation Services

To send logs to external services, modify `src/utils/logger.ts`:

```typescript
private async sendLog(entry: LogEntry): Promise<void> {
  if (!this.sendToAnalytics) return;

  try {
    // Send to your logging service
    await fetch('https://your-logging-service.com/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
  } catch (error) {
    // Silent fail
  }
}
```

## Monitoring & Analysis

### Log Levels in Production

- **DEBUG**: Disabled (only in development)
- **INFO**: General operations, user actions
- **WARN**: Potential issues, performance concerns
- **ERROR**: Recoverable errors, failed requests
- **CRITICAL**: System-breaking errors, security issues

### Key Metrics to Monitor

1. **User Actions**
   - Login success/failure rates
   - Registration completion
   - Feature usage patterns

2. **Performance**
   - API response times
   - Page load times
   - Database query duration

3. **Errors**
   - Error frequency and types
   - Failed API requests
   - PayPal transaction failures

4. **Business Metrics**
   - Plan upgrades
   - Subscription activations
   - Feature usage limits

## Log Download Feature

Users and admins can download logs for debugging:

```typescript
import logger from './utils/logger';

// Download all buffered logs as JSON
logger.downloadLogs();
```

This creates a timestamped JSON file with the last 100 log entries.

## Best Practices

1. **Always include context**
   ```typescript
   logger.info('Operation completed', 'ModuleName', { relevantData });
   ```

2. **Use appropriate log levels**
   - Don't use ERROR for expected conditions
   - Use WARN for degraded performance
   - Use CRITICAL sparingly

3. **Include actionable data**
   ```typescript
   logger.error('API call failed', 'API', error, {
     endpoint: '/api/users',
     statusCode: 500,
     retryAttempt: 3
   });
   ```

4. **Avoid logging sensitive data**
   - Don't log passwords
   - Redact credit card numbers
   - Be careful with PII (Personally Identifiable Information)

5. **Use events for analytics**
   ```typescript
   logger.event('feature_used', 'Feature', {
     featureName: 'AI Assistant',
     userId: user.id
   });
   ```

## Performance Impact

- Minimal overhead in production (<1ms per log)
- Logs are asynchronous where possible
- Buffer prevents memory leaks
- JSON serialization is efficient

## Security Considerations

1. **Source Maps**: Disabled in production build
2. **Error Messages**: Sanitized in production
3. **Stack Traces**: Only logged server-side
4. **User Data**: Never log sensitive information
5. **API Keys**: Never logged

## Integration with Analytics

The logger is designed to integrate with:
- Google Analytics
- Mixpanel
- Segment
- Custom analytics platforms

Simply modify the `sendLog` method to forward events to your analytics service.

## Troubleshooting

### Logs not appearing in production

1. Check `import.meta.env.PROD` is true
2. Verify browser console shows structured logs
3. Check network requests if using remote logging

### Performance issues

1. Reduce log frequency
2. Increase buffer size
3. Implement log sampling for high-traffic events

### Missing context

Ensure all components import and use the logger:
```typescript
import logger from './utils/logger';
```

## Next Steps

1. **Set up log aggregation** - Use ELK Stack, Splunk, or cloud services
2. **Create dashboards** - Visualize key metrics
3. **Set up alerts** - Monitor critical errors
4. **Implement log rotation** - Prevent log files from growing too large
5. **Add request IDs** - Track requests across services

## Support

For issues or questions about logging:
1. Check this documentation
2. Review logger source code
3. Test in development environment first
4. Use `logger.downloadLogs()` to export debug data
