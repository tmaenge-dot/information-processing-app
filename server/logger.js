/**
 * Production Logger for Node.js Backend
 * Structured logging with different levels
 */

const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL'
};

class BackendLogger {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  /**
   * Create structured log entry
   */
  createLogEntry(level, message, context, data, error) {
    return {
      '@timestamp': new Date().toISOString(),
      'log.level': level,
      message,
      context: context || 'Backend',
      environment: process.env.NODE_ENV || 'development',
      ...(data && { data }),
      ...(error && {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        }
      })
    };
  }

  /**
   * Format and output log
   */
  output(entry) {
    if (this.isProduction) {
      // In production, output structured JSON logs
      console.log(JSON.stringify(entry));
    } else {
      // In development, use more readable format
      const color = {
        DEBUG: '\x1b[36m',   // Cyan
        INFO: '\x1b[32m',    // Green
        WARN: '\x1b[33m',    // Yellow
        ERROR: '\x1b[31m',   // Red
        CRITICAL: '\x1b[35m' // Magenta
      };
      const reset = '\x1b[0m';
      
      console.log(
        `${color[entry['log.level']] || ''}[${entry['log.level']}]${reset} ` +
        `${entry['@timestamp']} ` +
        `[${entry.context}] ` +
        `${entry.message}`,
        entry.data || entry.error || ''
      );
    }
  }

  /**
   * Debug level logging (development only)
   */
  debug(message, context, data) {
    if (this.isDevelopment) {
      const entry = this.createLogEntry(LogLevel.DEBUG, message, context, data);
      this.output(entry);
    }
  }

  /**
   * Info level logging
   */
  info(message, context, data) {
    const entry = this.createLogEntry(LogLevel.INFO, message, context, data);
    this.output(entry);
  }

  /**
   * Warning level logging
   */
  warn(message, context, data) {
    const entry = this.createLogEntry(LogLevel.WARN, message, context, data);
    this.output(entry);
  }

  /**
   * Error level logging
   */
  error(message, context, error, data) {
    const entry = this.createLogEntry(LogLevel.ERROR, message, context, data, error);
    this.output(entry);
  }

  /**
   * Critical level logging
   */
  critical(message, context, error, data) {
    const entry = this.createLogEntry(LogLevel.CRITICAL, message, context, data, error);
    this.output(entry);
  }

  /**
   * Log performance metrics
   */
  performance(metricName, duration, context, data) {
    const message = `Performance: ${metricName} took ${duration}ms`;
    const entry = this.createLogEntry(
      LogLevel.INFO,
      message,
      context || 'Performance',
      { ...data, metricName, duration }
    );
    this.output(entry);
  }

  /**
   * Log HTTP request
   */
  request(req, res, duration) {
    const entry = this.createLogEntry(
      LogLevel.INFO,
      `${req.method} ${req.path}`,
      'HTTP',
      {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: duration || 0,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent')
      }
    );
    this.output(entry);
  }
}

// Export singleton instance
const logger = new BackendLogger();

export default logger;
