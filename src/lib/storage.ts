import { toast } from 'sonner';
import { logger } from './logger';

export class StorageError extends Error {
  constructor(
    message: string,
    public operation: 'read' | 'write' | 'delete'
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

export const safeLocalStorage = {
  getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item) as T;
    } catch (error) {
      logger.error(`Failed to read from localStorage (${key}):`, error);

      if (error instanceof Error && error.name === 'QuotaExceededError') {
        toast.error('Storage full. Please clear some space.');
      }

      return defaultValue;
    }
  },

  setItem<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error(`Failed to write to localStorage (${key}):`, error);

      if (error instanceof Error && error.name === 'QuotaExceededError') {
        toast.error('Storage full. Clearing old data...');

        // Clear old sessions
        this.clearOldSessions();

        // Try again after clearing
        try {
          localStorage.setItem(key, JSON.stringify(value));
          toast.success('Storage cleared, data saved successfully');
          return true;
        } catch (retryError) {
          toast.error('Failed to save. Please free up storage space.');
          return false;
        }
      }

      toast.error('Failed to save progress');
      return false;
    }
  },

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      logger.error(`Failed to delete from localStorage (${key}):`, error);
    }
  },

  clearOldSessions(): void {
    try {
      const keys = Object.keys(localStorage);
      const sessionKeys = keys.filter((k) => k.startsWith('wizard_'));

      // Keep only the most recent 3 sessions
      const sorted = sessionKeys
        .map((key) => {
          const data = this.getItem(key, { timestamp: 0 });
          return {
            key,
            timestamp:
              typeof data === 'object' && data !== null && 'timestamp' in data
                ? (data.timestamp as number)
                : 0,
          };
        })
        .sort((a, b) => b.timestamp - a.timestamp);

      // Remove sessions beyond the 3 most recent
      sorted.slice(3).forEach(({ key }) => {
        localStorage.removeItem(key);
      });

      logger.log(`Cleared ${Math.max(0, sorted.length - 3)} old sessions`);
    } catch (error) {
      logger.error('Failed to clear old sessions:', error);
    }
  },

  isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },
};
