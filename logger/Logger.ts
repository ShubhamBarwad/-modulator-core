import * as fs from 'fs';
import * as path from 'path';
import { ILogger } from 'core/types/logger';

/**
 * Options for configuring the Logger.
 * @property {boolean} [console] - Enable console logging (default: true)
 * @property {boolean} [file] - Enable file logging (default: false)
 * @property {string} [logFileName] - Name of the log file
 */
export interface LoggerOptions {
  console?: boolean;
  file?: boolean;
  logFileName?: string;
}

/**
 * Logger provides centralized logging to console and/or file with log levels.
 *
 * Example usage:
 *   const logger = new Logger({ console: true, file: true });
 *   logger.info('App started');
 */
export class Logger implements ILogger {
  private logToConsole: boolean;
  private logToFile: boolean;
  private logFile: string;

  private LOGS_PATH = path.join(process.cwd(), 'logs');

  /**
   * Create a new Logger instance.
   * @param {LoggerOptions} options - Logger configuration options.
   */
  constructor(options: LoggerOptions = {}) {
    this.logToConsole = options.console !== false; // default true
    this.logToFile = !!options.file;
    this.logFile = path.join(this.LOGS_PATH, options.logFileName || 'app.log');
    // Ensure the logs directory (or any parent directory) exists
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  /**
   * Write a log entry to the enabled outputs.
   * @param {string} level - Log level (INFO, WARN, ERROR, DEBUG)
   * @param {string} message - Log message
   * @param {any} [meta] - Optional metadata to log
   */
  private write(level: string, message: string, meta?: any) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] [${level}] ${message}` + (meta ? ` ${JSON.stringify(meta)}` : '');
    if (this.logToConsole) {
      // Colorize output for console
      let colorFn = (x: string) => x;
      if (level === 'ERROR') colorFn = (x) => `\x1b[31m${x}\x1b[0m`;
      if (level === 'WARN') colorFn = (x) => `\x1b[33m${x}\x1b[0m`;
      if (level === 'INFO') colorFn = (x) => `\x1b[32m${x}\x1b[0m`;
      if (level === 'DEBUG') colorFn = (x) => `\x1b[36m${x}\x1b[0m`;
      console.log(colorFn(logLine));
    }
    if (this.logToFile) {
      fs.appendFileSync(this.logFile, logLine + '\n');
    }
  }

  /**
   * Log an informational message.
   * @param {string} message - The message to log.
   * @param {any} [meta] - Optional metadata.
   */
  info(message: string, meta?: any) {
    this.write('INFO', message, meta);
  }

  /**
   * Log a warning message.
   * @param {string} message - The message to log.
   * @param {any} [meta] - Optional metadata.
   */
  warn(message: string, meta?: any) {
    this.write('WARN', message, meta);
  }

  /**
   * Log an error message.
   * @param {string} message - The message to log.
   * @param {any} [meta] - Optional metadata.
   */
  error(message: string, meta?: any) {
    this.write('ERROR', message, meta);
  }

  /**
   * Log a debug message (only in non-production environments).
   * @param {string} message - The message to log.
   * @param {any} [meta] - Optional metadata.
   */
  debug(message: string, meta?: any) {
    if (process.env.NODE_ENV !== 'production') {
      this.write('DEBUG', message, meta);
    }
  }
} 