import { isValidEmail } from '../../src/utils/regEx';

describe('regEx utility', () => {
  describe('isValidEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user@domain.co.uk')).toBe(true);
      expect(isValidEmail('john+label@company.org')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      expect(isValidEmail('invalid.email')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('user@.com')).toBe(false);
      expect(isValidEmail('user @example.com')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidEmail('a@b.co')).toBe(true);
      expect(isValidEmail('user+tag@example.museum')).toBe(true);
      expect(isValidEmail('123@456.789')).toBe(false);
    });
  });
});
