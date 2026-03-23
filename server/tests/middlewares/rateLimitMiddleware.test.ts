import { globalLimiter, authLimiter } from '../../src/middlewares/rateLimitMiddleware';

describe('Rate Limit Middleware', () => {
    it('ควรมีการกำหนด globalLimiter', () => {
        expect(globalLimiter).toBeDefined();
        expect(typeof globalLimiter).toBe('function'); // middleware ต้องเป็นฟังก์ชัน
    });

    it('ควรมีการกำหนด authLimiter', () => {
        expect(authLimiter).toBeDefined();
        expect(typeof authLimiter).toBe('function');
    });
});