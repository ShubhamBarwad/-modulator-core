"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Logger provides centralized logging to console and/or file with log levels.
 *
 * Example usage:
 *   const logger = new Logger({ console: true, file: true });
 *   logger.info('App started');
 */
class Logger {
    /**
     * Create a new Logger instance.
     * @param {LoggerOptions} options - Logger configuration options.
     */
    constructor(options = {}) {
        this.LOGS_PATH = path.join(process.cwd(), 'logs');
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
    write(level, message, meta) {
        const timestamp = new Date().toISOString();
        const logLine = `[${timestamp}] [${level}] ${message}` + (meta ? ` ${JSON.stringify(meta)}` : '');
        if (this.logToConsole) {
            // Colorize output for console
            let colorFn = (x) => x;
            if (level === 'ERROR')
                colorFn = (x) => `\x1b[31m${x}\x1b[0m`;
            if (level === 'WARN')
                colorFn = (x) => `\x1b[33m${x}\x1b[0m`;
            if (level === 'INFO')
                colorFn = (x) => `\x1b[32m${x}\x1b[0m`;
            if (level === 'DEBUG')
                colorFn = (x) => `\x1b[36m${x}\x1b[0m`;
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
    info(message, meta) {
        this.write('INFO', message, meta);
    }
    /**
     * Log a warning message.
     * @param {string} message - The message to log.
     * @param {any} [meta] - Optional metadata.
     */
    warn(message, meta) {
        this.write('WARN', message, meta);
    }
    /**
     * Log an error message.
     * @param {string} message - The message to log.
     * @param {any} [meta] - Optional metadata.
     */
    error(message, meta) {
        this.write('ERROR', message, meta);
    }
    /**
     * Log a debug message (only in non-production environments).
     * @param {string} message - The message to log.
     * @param {any} [meta] - Optional metadata.
     */
    debug(message, meta) {
        if (process.env.NODE_ENV !== 'production') {
            this.write('DEBUG', message, meta);
        }
    }
}
exports.Logger = Logger;
