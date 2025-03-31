/**
 * Logger Configuration (Winston)
 * Sets up a centralized logger for the application.
 */
import winston from 'winston';
import config from './config';

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
  const env = config.nodeEnv || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn'; // Log more in dev, less in prod
};

// Define colors for different log levels (optional, for console readability)
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Define the log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  // Use colorize only for console transport in development
  config.nodeEnv === 'development' ? winston.format.colorize({ all: true }) : winston.format.uncolorize(),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define transports (where logs should go)
const transports = [
  // Console transport - always active
  new winston.transports.Console({
    format: format, // Apply the combined format
  }),
  // Optional: File transports for error and combined logs (more common in production)
  // new winston.transports.File({
  //   filename: 'logs/error.log',
  //   level: 'error',
  // }),
  // new winston.transports.File({ filename: 'logs/all.log' }),
];

// Create the logger instance
const logger = winston.createLogger({
  level: level(),
  levels,
  format: format, // Default format applied if not overridden by transport
  transports,
});

// Export the configured logger
export { logger }; 