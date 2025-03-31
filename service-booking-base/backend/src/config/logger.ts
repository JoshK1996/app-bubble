/**
 * Logger Configuration
 * Configures Winston logger for application-wide use
 */
import winston from 'winston';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Determine log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  const logLevel = process.env.LOG_LEVEL || 'info';
  
  return isDevelopment ? 'debug' : logLevel;
};

// Define colors for log levels
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info: winston.Logform.TransformableInfo) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define where logs should be stored
const transports = [
  // Console output
  new winston.transports.Console(),
  
  // Error logs file
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  
  // All logs file
  new winston.transports.File({ filename: 'logs/all.log' }),
];

// Create the logger
export const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

// Export for use throughout application
export default logger; 