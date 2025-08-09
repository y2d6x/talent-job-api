import { Request, Response } from 'express';

export interface LogData {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
  userAgent?: string;
  ip?: string;
  userId?: string;
  error?: any;
}

class Logger {
  private formatMessage(data: LogData): string {
    const { timestamp, level, message, method, url, statusCode, responseTime, userAgent, ip, userId, error } = data;
    
    let logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    
    if (method && url) {
      logMessage += ` | ${method} ${url}`;
    }
    
    if (statusCode) {
      logMessage += ` | Status: ${statusCode}`;
    }
    
    if (responseTime) {
      logMessage += ` | Response Time: ${responseTime}ms`;
    }
    
    if (ip) {
      logMessage += ` | IP: ${ip}`;
    }
    
    if (userId) {
      logMessage += ` | User: ${userId}`;
    }
    
    if (userAgent) {
      logMessage += ` | User-Agent: ${userAgent}`;
    }
    
    if (error) {
      logMessage += ` | Error: ${error.message || error}`;
    }
    
    return logMessage;
  }

  info(data: Omit<LogData, 'level'>) {
    console.log(this.formatMessage({ ...data, level: 'info' }));
  }

  warn(data: Omit<LogData, 'level'>) {
    console.warn(this.formatMessage({ ...data, level: 'warn' }));
  }

  error(data: Omit<LogData, 'level'>) {
    console.error(this.formatMessage({ ...data, level: 'error' }));
  }

  debug(data: Omit<LogData, 'level'>) {
    if (process.env.NODE_ENV === 'development') {
      console.log(this.formatMessage({ ...data, level: 'debug' }));
    }
  }

  // Environment-specific logging
  logEnvironment() {
    const env = process.env.NODE_ENV || 'development';
    console.log(`🌍 Environment: ${env}`);
    console.log(`🔧 Debug mode: ${env === 'development' ? 'ON' : 'OFF'}`);
    console.log(`📊 Error details: ${env === 'development' ? 'FULL' : 'MINIMAL'}`);
  }

  // Request logging middleware
  logRequest(req: Request, res: Response, next: Function) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      
      this.info({
        timestamp: new Date().toISOString(),
        message: 'HTTP Request',
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTime: duration,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        userId: (req as any).user?._id
      });
    });
    
    next();
  }
}

export const logger = new Logger(); 