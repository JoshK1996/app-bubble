/**
 * Logger Configuration (Winston)
 */
import winston from 'winston';
import config from './config';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  return config.logLevel || (config.nodeEnv === 'development' ? 'debug' : 'info');
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};
winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  // Colorize only in development for console readability
  config.nodeEnv === 'development' ? winston.format.colorize({ all: true }) : winston.format.uncolorize(),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

const transports = [
  new winston.transports.Console({
    format: format, 
    stderrLevels: ['error'], // Ensure errors go to stderr
  }),
  // Optional: Add file transports for production logging
  // new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  // new winston.transports.File({ filename: 'logs/all.log' }),
];

const logger = winston.createLogger({
  level: level(),
  levels,
  format: format, // Default format
  transports,
  exitOnError: false, // Do not exit on handled exceptions
});

export { logger }; 