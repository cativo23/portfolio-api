import { trimEnvQuotes, parseEnvInt, parseEnvBoolean } from './env.utils';

describe('env.utils', () => {
  describe('trimEnvQuotes', () => {
    it('should return empty string for undefined', () => {
      expect(trimEnvQuotes(undefined)).toBe('');
    });

    it('should return empty string for null', () => {
      expect(trimEnvQuotes(null as any)).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(trimEnvQuotes('')).toBe('');
    });

    it('should remove double quotes from value', () => {
      expect(trimEnvQuotes('"hello"')).toBe('hello');
    });

    it('should remove single quotes from value', () => {
      expect(trimEnvQuotes("'hello'")).toBe('hello');
    });

    it('should trim whitespace', () => {
      expect(trimEnvQuotes('  hello  ')).toBe('hello');
    });

    it('should remove quotes from start and end, then trim', () => {
      // Note: function removes quotes first, then trims
      // So '  "hello"  ' becomes '"hello"' (quotes at start/end removed, then trimmed)
      expect(trimEnvQuotes('  "hello"  ')).toBe('"hello"');
      expect(trimEnvQuotes('"  hello  "')).toBe('hello');
    });

    it('should return value without quotes if no quotes present', () => {
      expect(trimEnvQuotes('hello')).toBe('hello');
    });

    it('should handle quoted values with spaces inside', () => {
      expect(trimEnvQuotes('"hello world"')).toBe('hello world');
    });
  });

  describe('parseEnvInt', () => {
    it('should return fallback for undefined value', () => {
      expect(parseEnvInt(undefined, 42)).toBe(42);
    });

    it('should return fallback for empty string', () => {
      expect(parseEnvInt('', 42)).toBe(42);
    });

    it('should parse valid integer', () => {
      expect(parseEnvInt('100', 42)).toBe(100);
    });

    it('should parse integer with quotes', () => {
      expect(parseEnvInt('"300"', 42)).toBe(300);
      expect(parseEnvInt("'300'", 42)).toBe(300);
    });

    it('should return fallback for non-numeric string', () => {
      expect(parseEnvInt('abc', 42)).toBe(42);
    });

    it('should parse leading numeric portion of string', () => {
      // parseInt returns the leading numeric portion
      expect(parseEnvInt('123abc', 42)).toBe(123);
    });

    it('should handle negative numbers', () => {
      expect(parseEnvInt('-50', 42)).toBe(-50);
    });

    it('should handle zero', () => {
      expect(parseEnvInt('0', 42)).toBe(0);
    });

    it('should handle quoted zero', () => {
      expect(parseEnvInt('"0"', 42)).toBe(0);
    });
  });

  describe('parseEnvBoolean', () => {
    it('should return false for undefined', () => {
      expect(parseEnvBoolean(undefined)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(parseEnvBoolean('')).toBe(false);
    });

    it('should return true for "1"', () => {
      expect(parseEnvBoolean('1')).toBe(true);
    });

    it('should return true for "true" (case insensitive)', () => {
      expect(parseEnvBoolean('true')).toBe(true);
      expect(parseEnvBoolean('TRUE')).toBe(true);
      expect(parseEnvBoolean('True')).toBe(true);
    });

    it('should return true for "yes" (case insensitive)', () => {
      expect(parseEnvBoolean('yes')).toBe(true);
      expect(parseEnvBoolean('YES')).toBe(true);
      expect(parseEnvBoolean('Yes')).toBe(true);
    });

    it('should return false for "0"', () => {
      expect(parseEnvBoolean('0')).toBe(false);
    });

    it('should return false for "false"', () => {
      expect(parseEnvBoolean('false')).toBe(false);
    });

    it('should return false for "no"', () => {
      expect(parseEnvBoolean('no')).toBe(false);
    });

    it('should return false for any other string', () => {
      expect(parseEnvBoolean('random')).toBe(false);
    });

    it('should handle quoted values', () => {
      expect(parseEnvBoolean('"true"')).toBe(true);
      expect(parseEnvBoolean("'yes'")).toBe(true);
    });
  });
});
