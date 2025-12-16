/**
 * Production Logger Utility
 * Provides structured logging for production environments
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  error?: Error;
  userAgent?: string;
  url?: string;
  userId?: string;
}

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 100;
  private sendToAnalytics: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.isProduction = import.meta.env.PROD;
    this.sendToAnalytics = this.isProduction;
    
    // Log initialization
    if (this.isProduction) {
      this.info('Logger initialized in production mode', 'Logger');
    }
  }

  /**
   * Create a structured log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: string,
    data?: any,
    error?: Error
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
      error,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userId: this.getUserId()
    };
  }

  /**
   * Get current user ID from localStorage
   */
  private getUserId(): string | undefined {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const parsed = JSON.parse(user);
        return parsed.id;
      }
    } catch (error) {
      // Silent fail
    }
    return undefined;
  }

  /**
   * Add log to buffer and manage buffer size
   */
  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    
    // Keep buffer size manageable
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer = this.logBuffer.slice(-this.maxBufferSize);
    }
  }

  /**
   * Send logs to analytics/monitoring service
   */
  private async sendLog(entry: LogEntry): Promise<void> {
    if (!this.sendToAnalytics) return;

    try {
      // In production, send to your analytics service
      // For now, we'll log to console in a structured format
      if (this.isProduction && entry.level !== LogLevel.DEBUG) {
        // You can replace this with actual API call to your logging service
        // Example: await fetch('/api/logs', { method: 'POST', body: JSON.stringify(entry) });
        
        // For now, use structured console logging
        const structuredLog = {
          '@timestamp': entry.timestamp,
          'log.level': entry.level,
          message: entry.message,
          context: entry.context,
          user_id: entry.userId,
          url: entry.url,
          ...entry.data
        };
        
        console.log(JSON.stringify(structuredLog));
      }
    } catch (error) {
      // Silent fail to prevent logging errors from breaking the app
    }
  }

  /**
   * Log debug message (only in development)
   */
  debug(message: string, context?: string, data?: any): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context, data);
    this.addToBuffer(entry);
    
    if (this.isDevelopment) {
      console.debug(`[${context || 'App'}] ${message}`, data || '');
    }
  }

  /**
   * Log info message
   */
  info(message: string, context?: string, data?: any): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, context, data);
    this.addToBuffer(entry);
    
    if (this.isDevelopment) {
      console.info(`[${context || 'App'}] ${message}`, data || '');
    }
    
    this.sendLog(entry);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: string, data?: any): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, context, data);
    this.addToBuffer(entry);
    
    console.warn(`[${context || 'App'}] ${message}`, data || '');
    this.sendLog(entry);
  }

  /**
   * Log error message
   */
  error(message: string, context?: string, error?: Error, data?: any): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message, context, data, error);
    this.addToBuffer(entry);
    
    console.error(`[${context || 'App'}] ${message}`, error || '', data || '');
    this.sendLog(entry);
  }

  /**
   * Log critical error (system-breaking)
   */
  critical(message: string, context?: string, error?: Error, data?: any): void {
    const entry = this.createLogEntry(LogLevel.CRITICAL, message, context, data, error);
    this.addToBuffer(entry);
    
    console.error(`[CRITICAL][${context || 'App'}] ${message}`, error || '', data || '');
    this.sendLog(entry);
  }

  /**
   * Log performance metrics
   */
  performance(metricName: string, duration: number, context?: string, data?: any): void {
    const message = `Performance: ${metricName} took ${duration}ms`;
    const entry = this.createLogEntry(
      LogLevel.INFO, 
      message, 
      context || 'Performance',
      { ...data, metricName, duration }
    );
    
    this.addToBuffer(entry);
    
    if (this.isDevelopment) {
      console.info(`[Performance][${context || 'App'}] ${metricName}: ${duration}ms`, data || '');
    }
    
    this.sendLog(entry);
  }

  /**
   * Log user action/event
   */
  event(eventName: string, context?: string, data?: any): void {
    const message = `Event: ${eventName}`;
    const entry = this.createLogEntry(
      LogLevel.INFO,
      message,
      context || 'Event',
      { ...data, eventName }
    );
    
    this.addToBuffer(entry);
    
    if (this.isDevelopment) {
      console.info(`[Event][${context || 'App'}] ${eventName}`, data || '');
    }
    
    this.sendLog(entry);
  }

  /**
   * Get all logs from buffer
   */
  getLogs(): LogEntry[] {
    return [...this.logBuffer];
  }

  /**
   * Clear log buffer
   */
  clearLogs(): void {
    this.logBuffer = [];
  }

  /**
   * Download logs as JSON file
   */
  downloadLogs(): void {
    try {
      const logsJson = JSON.stringify(this.logBuffer, null, 2);
      const blob = new Blob([logsJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `app-logs-${new Date().toISOString()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      this.info('Logs downloaded successfully', 'Logger');
    } catch (error) {
      this.error('Failed to download logs', 'Logger', error as Error);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export a hook for React components
export const useLogger = () => logger;

export default logger;
