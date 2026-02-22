"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const regEx_1 = require("../../src/utils/regEx");
describe('regEx utility', () => {
    describe('isValidEmail', () => {
        it('should return true for valid email addresses', () => {
            expect((0, regEx_1.isValidEmail)('user@example.com')).toBe(true);
            expect((0, regEx_1.isValidEmail)('test.user@domain.co.uk')).toBe(true);
            expect((0, regEx_1.isValidEmail)('john+label@company.org')).toBe(true);
        });
        it('should return false for invalid email addresses', () => {
            expect((0, regEx_1.isValidEmail)('invalid.email')).toBe(false);
            expect((0, regEx_1.isValidEmail)('user@')).toBe(false);
            expect((0, regEx_1.isValidEmail)('@example.com')).toBe(false);
            expect((0, regEx_1.isValidEmail)('')).toBe(false);
            expect((0, regEx_1.isValidEmail)('user@.com')).toBe(false);
            expect((0, regEx_1.isValidEmail)('user @example.com')).toBe(false);
        });
        it('should handle edge cases', () => {
            expect((0, regEx_1.isValidEmail)('a@b.co')).toBe(true);
            expect((0, regEx_1.isValidEmail)('user+tag@example.museum')).toBe(true);
            expect((0, regEx_1.isValidEmail)('123@456.789')).toBe(false);
        });
    });
});
