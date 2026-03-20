# 📋 TaskFlow

> โปรเจกต์นี้สร้างขึ้นเพื่อฝึก **DevOps** โดยใช้ Azure Student สำหรับ Cloud Deployment พร้อม CI/CD pipeline ผ่าน GitHub Actions

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React / Next.js |
| Backend | Node.js / Express |
| Database | PostgreSQL |
| Container | Docker / Docker Compose |
| CI/CD | GitHub Actions |
| Cloud | Microsoft Azure (Student) |

---

## 🗂️ Project Structure

```
TaskFlow/
├── frontend/          # React / Next.js
├── backend/           # Node.js / Express API
├── docker-compose.yml # รัน services พร้อมกันทั้งหมด
└── .github/
    └── workflows/     # GitHub Actions CI/CD pipeline
```

---

## 🚀 Getting Started

### Prerequisites

ต้องติดตั้งก่อนใช้งาน:

- [Node.js](https://nodejs.org/) >= 18
- [Docker](https://www.docker.com/) & Docker Compose
- [Git](https://git-scm.com/)

### 1. Clone โปรเจกต์

```bash
git clone https://github.com/EqrthX/TaskFlow.git
cd TaskFlow
```

### 2. ตั้งค่า Environment Variables

```bash
cp .env.example .env
# แก้ไขค่าต่างๆ ใน .env ให้ตรงกับ environment ของตัวเอง
```

ตัวอย่างค่าที่ต้องตั้ง:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/taskflow
PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. รันด้วย Docker Compose (แนะนำ)

```bash
docker compose up --build
```

จากนั้นเปิด browser ที่ `http://localhost:3000`

### 4. รันแบบ Manual (Development)

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (terminal ใหม่)
cd frontend
npm install
npm run dev
```

---

## ⚙️ CI/CD Pipeline (GitHub Actions)

> **สิ่งที่ได้เรียนรู้:** CI/CD คือการทำให้กระบวนการ build, test, และ deploy เกิดขึ้นอัตโนมัติ ทุกครั้งที่ push code ขึ้น GitHub

### Flow ของ Pipeline

```
Push code to GitHub
        │
        ▼
┌───────────────┐
│  CI - Build   │  ← ติดตั้ง dependencies, build โปรเจกต์
│   & Test      │  ← รัน automated tests
└───────┬───────┘
        │ (ถ้าผ่านทุก step)
        ▼
┌───────────────┐
│  CD - Deploy  │  ← Build Docker image
│  to Azure     │  ← Push ไป Azure Container Registry
└───────────────┘  ← Deploy ขึ้น Azure App Service
```

### GitHub Secrets ที่ต้องตั้งใน Repository

ไปที่ `Settings → Secrets and variables → Actions` แล้วเพิ่ม:

| Secret | คืออะไร |
|--------|---------|
| `AZURE_IP` | JSON credentials สำหรับ login Azure |
| `AZURE_KEY` | ชื่อ Azure Container Registry |
| `DATABASE_URL` | Connection string ของ PostgreSQL บน Azure |

---

## ☁️ Azure Deployment

โปรเจกต์นี้ deploy บน **Microsoft Azure** ผ่าน Azure for Students (ฟรี $100 credit)

### Services ที่ใช้

- **Azure App Service** — Host ตัว application (Backend + Frontend)
- **Azure Container Registry (ACR)** — เก็บ Docker images
- **Azure Database for PostgreSQL** — Managed database

### Architecture บน Azure

```
GitHub Actions
      │
      │ push Docker image
      ▼
Azure Container Registry
      │
      │ pull & deploy
      ▼
Azure App Service ──────── Azure PostgreSQL
(Backend + Frontend)       (Database)
```

---

## 🐳 Docker

### Build & Run ด้วย Docker Compose

```bash
# Start ทุก services
docker compose up -d

# ดู logs
docker compose logs -f

# Stop ทุก services
docker compose down
```

### ตัวอย่าง `docker-compose.yml`

```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3231:3231"
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/taskflow
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: taskflow
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 📚 สิ่งที่ได้เรียนรู้ (Learning Notes)

### DevOps Concepts

| Concept | ความเข้าใจ |
|---------|-----------|
| **CI (Continuous Integration)** | ทุกครั้งที่ push code → GitHub Actions จะ build และ test อัตโนมัติ ช่วยให้รู้ทันทีว่า code พัง |
| **CD (Continuous Deployment)** | ถ้า CI ผ่าน → deploy ขึ้น Azure อัตโนมัติ ไม่ต้อง deploy เอง |
| **Docker** | แพ็ก app + dependencies ลง container ทำให้รันได้เหมือนกันทุกเครื่อง |
| **Docker Compose** | จัดการหลาย container (frontend, backend, db) ให้รันพร้อมกันด้วยคำสั่งเดียว |
| **GitHub Actions** | เครื่องมือ CI/CD ที่อยู่ใน GitHub ไม่ต้องติดตั้ง server เพิ่ม |

### สิ่งที่ยังต้องเรียนเพิ่ม

- [ ] Rollback strategy เมื่อ deploy แล้วมีปัญหา
- [ ] Environment separation (dev / staging / production)
- [ ] Monitoring & Logging บน Azure
- [ ] Secret management ที่ดีกว่า (Azure Key Vault)

---

## 🤝 Contributing

โปรเจกต์นี้เป็น personal learning project แต่ถ้าอยากแนะนำอะไร ยินดีรับ PR หรือ Issue เสมอ

1. Fork โปรเจกต์
2. สร้าง feature branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m 'Add some feature'`
4. Push: `git push origin feature/your-feature`
5. เปิด Pull Request

---

## 📄 License

MIT License — ใช้งานได้อย่างอิสระ

---

*Made with ❤️ for learning DevOps*
