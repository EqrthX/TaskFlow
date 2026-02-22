import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0', // เวอร์ชันของ OpenAPI
    info: {
      title: 'TaskFlow API',
      version: '1.0.0',
      description: 'API Documentation สำหรับโปรเจค TaskFlow',
    },
    servers: [
      {
        url: 'http://localhost:3231', // URL ของ Server คุณ
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // ไฟล์ที่ให้มันไปกวาดหา Comment (ปรับ path ให้ตรงกับโฟลเดอร์ Route ของคุณ)
  apis: ['./src/routes/*.ts', './src/routes/*.js', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);