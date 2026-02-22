# Server Unit Tests

รวมทั้งหมด unit tests สำหรับ TaskFlow Server

## โครงสร้าง Tests

```
tests/
├── controllers/
│   ├── userController.test.ts       # Tests สำหรับ User Controller
│   └── taskController.test.ts       # Tests สำหรับ Task Controller
├── services/
│   ├── userServices.test.ts         # Tests สำหรับ User Services
│   └── taskServices.test.ts         # Tests สำหรับ Task Services
├── middlewares/
│   └── authMiddleware.test.ts       # Tests สำหรับ Auth Middleware
└── utils/
    └── regEx.test.ts                # Tests สำหรับ Utility Functions
```

## Coverage Details

### 📝 User Services (`tests/services/userServices.test.ts`)
- ✅ `RegisterServices` - ทดสอบการสมัครสมาชิก
  - Email ที่มีอยู่แล้ว
  - รหัสผ่านไม่ตรงกัน
  - การสมัครสำเร็จและ exclude password
  
- ✅ `LoginService` - ทดสอบการเข้าสู่ระบบ
  - User ไม่พบ
  - รหัสผ่านไม่ถูกต้อง
  - เข้าสู่ระบบสำเร็จพร้อม tokens
  
- ✅ `refreshTokenService` - ทดสอบการต่ออายุ Token
  - Token ไม่ถูกต้อง
  - Token ไม่ตรงกับฐานข้อมูล
  - ต่ออายุ Token สำเร็จ

### 📋 Task Services (`tests/services/taskServices.test.ts`)
- ✅ `AddTaskServices` - ทดสอบการเพิ่มงาน
  - สร้างงานใหม่สำเร็จ
  - ข้อมูลทั้งหมดส่งถูก
  - จัดการ errors ที่เกิดขึ้น
  
- ✅ `UpdateTaskStatusServices` - ทดสอบการอัพเดตสถานะงาน
  - อัพเดตสถานะสำเร็จ
  - งานไม่พบ
  
- ✅ `UpdateTaskServices` - ทดสอบการอัพเดตข้อมูลงาน
  - อัพเดตชื่อและรายละเอียด
  - Unauthorized access
  
- ✅ `DeleteTaskServices` - ทดสอบการลบงาน
  - ลบงานสำเร็จ
  - งานไม่พบ

### 👤 User Controller (`tests/controllers/userController.test.ts`)
- ✅ `Registination` - ทดสอบ endpoint สมัครสมาชิก
  - Missing required fields
  - รหัสผ่านสั้นกว่า 6 ตัว
  - Email มีอยู่แล้ว
  - สมัครสำเร็จ
  
- ✅ `Login` - ทดสอบ endpoint เข้าสู่ระบบ
  - Missing email/password
  - Invalid email format
  - Set cookies สี่เร็จ
  
- ✅ `Logout` - ทดสอบ endpoint ออกจากระบบ
  - Clear cookies และ success message
  
- ✅ `RefreshToken` - ทดสอบ endpoint ต่ออายุ Token
  - ไม่มี refresh token
  - ต่ออายุสำเร็จ
  - Invalid token error

### 📋 Task Controller (`tests/controllers/taskController.test.ts`)
- ✅ `AddTasks` - ทดสอบการเพิ่มงาน
  - Missing required fields
  - เพิ่มงานสำเร็จ
  - Database errors
  
- ✅ `showTasks` - ทดสอบการแสดงงาน
  - แสดงทั้งหมดตามลำดับ date
  - Empty tasks
  - Database errors
  
- ✅ `UpdateStatusTask` - ทดสอบอัพเดตสถานะ
  - อัพเดตสำเร็จ
  - Service errors
  
- ✅ `UpdateTask` - ทดสอบอัพเดตข้อมูลงาน
  - อัพเดตสำเร็จ
  - Handle errors

### 🔒 Auth Middleware (`tests/middlewares/authMiddleware.test.ts`)
- ✅ `authenticateToken` - ทดสอบ middleware ตรวจสอบ token
  - ไม่มี token
  - Invalid token
  - Expired token
  - Token ถูกต้อง และจะเรียก next()
  - Verify with correct secret

### 🛠️ Utility Functions (`tests/utils/regEx.test.ts`)
- ✅ `isValidEmail` - ทดสอบการตรวจสอบ email
  - Valid emails
  - Invalid emails
  - Edge cases

## การรัน Tests

### รัน tests ทั้งหมด
```bash
npm test
```

### รัน tests ในโหมด watch
```bash
npm run test:watch
```

### รัน tests พร้อม coverage
```bash
npm run test:cov
```

### รัน test เฉพาะไฟล์
```bash
npm test -- userController.test.ts
npm test -- taskServices.test.ts
```

### รัน tests ตามชื่อ test
```bash
npm test -- --testNamePattern="RegisterServices"
```

## Mocking Strategy

- **Database**: `prisma` ถูก mock เพื่อไม่ให้เรียก DB จริง
- **JWT**: `jsonwebtoken` ถูก mock สำหรับ token verification
- **Bcrypt**: `bcrypt` ถูก mock สำหรับ password hashing
- **Logger**: Logger ถูก mock เพื่อไม่ให้พิมพ์ข้อมูลระหว่าง test

## Test Coverage

ครอบคลุม:
- ✅ Happy paths - การใช้งานปกติ
- ✅ Error cases - เมื่อเกิด error
- ✅ Edge cases - กรณีพิเศษต่างๆ
- ✅ Input validation - ตรวจสอบข้อมูลเข้า
- ✅ Response format - ตรวจสอบ response ที่ถูกต้อง

## Dependencies

```json
{
  "devDependencies": {
    "jest": "^30.2.0",
    "ts-jest": "^29.4.6",
    "@types/jest": "^30.0.0",
    "supertest": "^7.2.2"
  }
}
```

## Notes

- Tests ใช้ Mock เพื่อให้ isolated จากฐานข้อมูลจริง
- ใช้ `jest.clearAllMocks()` ใน `beforeEach` เพื่อลบ mocks ระหว่าง tests
- ตรวจสอบ `expect()` assertions เพื่อ ensure ช่วง behavior
- Tests written เพื่อให้ readable และ maintainable

## ตัวอย่างการรัน Tests

```bash
# รัน และดู coverage
npm run test:cov

# Output คาดหวัง:
# PASS  tests/utils/regEx.test.ts
# PASS  tests/services/userServices.test.ts
# PASS  tests/services/taskServices.test.ts
# PASS  tests/controllers/userController.test.ts
# PASS  tests/controllers/taskController.test.ts
# PASS  tests/middlewares/authMiddleware.test.ts
#
# Test Suites: 6 passed, 6 total
# Tests: XX passed, XX total
```
