import { formatMessageTime } from '../../../utiles/dateFormat';

describe('dateFormat utilities', () => {
  beforeEach(() => {
    // Mock the current time for consistent testing
    jest.spyOn(Date, 'now').mockImplementation(() => 
      new Date('2024-01-15T12:00:00Z').getTime()
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('formatMessageTime', () => {
    it('should format recent timestamp as "just now"', () => {
      const recentTime = new Date('2024-01-15T11:59:30Z'); // 30 seconds ago
      const result = formatMessageTime(recentTime);
      expect(result).toBe('just now');
    });

    it('should format minutes ago correctly', () => {
      const fiveMinutesAgo = new Date('2024-01-15T11:55:00Z');
      const result = formatMessageTime(fiveMinutesAgo);
      expect(result).toBe('5m ago');
    });

    it('should format hours ago correctly', () => {
      const twoHoursAgo = new Date('2024-01-15T10:00:00Z');
      const result = formatMessageTime(twoHoursAgo);
      expect(result).toBe('2h ago');
    });

    it('should format yesterday correctly', () => {
      const yesterday = new Date('2024-01-14T12:00:00Z');
      const result = formatMessageTime(yesterday);
      expect(result).toBe('yesterday');
    });

    it('should format days ago correctly', () => {
      const threeDaysAgo = new Date('2024-01-12T12:00:00Z');
      const result = formatMessageTime(threeDaysAgo);
      expect(result).toBe('3d ago');
    });

    it('should format weeks ago correctly', () => {
      const twoWeeksAgo = new Date('2024-01-01T12:00:00Z');
      const result = formatMessageTime(twoWeeksAgo);
      expect(result).toBe('2w ago');
    });

    it('should format months ago correctly', () => {
      const twoMonthsAgo = new Date('2023-11-15T12:00:00Z');
      const result = formatMessageTime(twoMonthsAgo);
      expect(result).toBe('2mo ago');
    });

    it('should format years ago correctly', () => {
      const twoYearsAgo = new Date('2022-01-15T12:00:00Z');
      const result = formatMessageTime(twoYearsAgo);
      expect(result).toBe('2y ago');
    });

    it('should handle invalid date input', () => {
      const result = formatMessageTime(null);
      expect(result).toBe('');
    });

    it('should handle undefined input', () => {
      const result = formatMessageTime(undefined);
      expect(result).toBe('');
    });

    it('should handle string timestamp', () => {
      const stringTime = '2024-01-15T11:55:00Z';
      const result = formatMessageTime(stringTime);
      expect(result).toBe('5m ago');
    });

    it('should handle timestamp number', () => {
      const timestampNumber = new Date('2024-01-15T11:55:00Z').getTime();
      const result = formatMessageTime(timestampNumber);
      expect(result).toBe('5m ago');
    });

    it('should handle Firestore timestamp object', () => {
      const firestoreTimestamp = {
        seconds: new Date('2024-01-15T11:55:00Z').getTime() / 1000,
        nanoseconds: 0,
        toDate: function() {
          return new Date(this.seconds * 1000);
        }
      };
      const result = formatMessageTime(firestoreTimestamp);
      expect(result).toBe('5m ago');
    });

    it('should handle edge case of exactly 1 minute', () => {
      const oneMinuteAgo = new Date('2024-01-15T11:59:00Z');
      const result = formatMessageTime(oneMinuteAgo);
      expect(result).toBe('1m ago');
    });

    it('should handle edge case of exactly 1 hour', () => {
      const oneHourAgo = new Date('2024-01-15T11:00:00Z');
      const result = formatMessageTime(oneHourAgo);
      expect(result).toBe('1h ago');
    });

    it('should handle edge case of exactly 1 day', () => {
      const oneDayAgo = new Date('2024-01-14T12:00:00Z');
      const result = formatMessageTime(oneDayAgo);
      expect(result).toBe('yesterday');
    });

    it('should handle future timestamps gracefully', () => {
      const futureTime = new Date('2024-01-15T13:00:00Z');
      const result = formatMessageTime(futureTime);
      expect(result).toBe('just now'); // Should default to "just now" for future times
    });
  });
}); 