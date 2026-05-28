/**
 * Logger Utility
 *
 * A lightweight, environment-aware structured logger for the Playwright
 * automation framework. Replaces direct `console.log()` calls with
 * levelled output that can be suppressed in CI environments.
 *
 * Usage:
 *   import { Logger } from './logger.util';
 *   Logger.info('[Navigation] Navigating to login page');
 *   Logger.debug('[Auto-Detect] Flow Step 1: Current Page = LOGIN');
 *   Logger.warn('[Config] BASE_URL env variable not set, using default');
 *   Logger.error('[Auth] Login failed unexpectedly', error);
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

const IS_CI = Boolean(process.env.CI);

const LOG_COLORS: Record<LogLevel, string> = {
  DEBUG: '\x1b[36m', // Cyan
  INFO:  '\x1b[32m', // Green
  WARN:  '\x1b[33m', // Yellow
  ERROR: '\x1b[31m', // Red
};

const RESET = '\x1b[0m';

function formatMessage(level: LogLevel, message: string): string {
  const timestamp = new Date().toISOString();
  const color = LOG_COLORS[level];
  return `${color}[${timestamp}] [${level}]${RESET} ${message}`;
}

export class Logger {
  /**
   * Debug-level: emitted locally only. Suppressed in CI.
   * Use for step-by-step diagnostic flow information.
   */
  static debug(message: string): void {
    if (!IS_CI) {
      console.debug(formatMessage('DEBUG', message));
    }
  }

  /**
   * Info-level: emitted locally only. Suppressed in CI.
   * Use for high-level flow milestones.
   */
  static info(message: string): void {
    if (!IS_CI) {
      console.info(formatMessage('INFO', message));
    }
  }

  /**
   * Warn-level: always emitted.
   * Use for configuration issues or non-critical unexpected states.
   */
  static warn(message: string): void {
    console.warn(formatMessage('WARN', message));
  }

  /**
   * Error-level: always emitted.
   * Use for caught exceptions or critical failures.
   */
  static error(message: string, error?: unknown): void {
    console.error(formatMessage('ERROR', message));
    if (error instanceof Error) {
      console.error(`${LOG_COLORS['ERROR']}  ↳ ${error.message}${RESET}`);
    }
  }
}
