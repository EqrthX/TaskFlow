# 🚀 TaskFlow - Modern Task Management System

![TaskFlow Banner](https://img.shields.io/badge/Status-Production_Ready-success)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue?logo=docker)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?logo=github-actions)
![Azure](https://img.shields.io/badge/Cloud-Microsoft_Azure-0089D6?logo=microsoft-azure)

TaskFlow is a production-grade, full-stack task management application designed for speed, scalability, and seamless user experience. It features robust image handling, ultra-fast data retrieval through in-memory caching, and a fully automated deployment pipeline.

## ✨ Key Features

- **User Authentication:** Secure user registration and login with JWT and refresh tokens.
- **Task Management:** Full CRUD operations (Create, Read, Update, Delete) for daily tasks.
- **Image Attachments:** Seamlessly upload and manage task images using **Azure Blob Storage**.
- **High-Performance Caching:** Integrated **Redis** to cache user tasks, drastically reducing database load and API latency.
- **Responsive UI:** Modern, mobile-first interface built with React and Tailwind CSS.
- **Reverse Proxy & Payload Management:** Configured **Nginx** to handle large payload sizes (up to 20MB) for high-resolution image uploads.
- **Automated CI/CD:** Fully automated pipeline using **GitHub Actions** to build, push, and deploy Docker containers to an Azure Virtual Machine.

## 🛠️ Technology Stack

### Frontend (Client)
- **Framework:** React 18 (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **HTTP Client:** Axios

### Backend (Server)
- **Environment:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Caching:** Redis
- **File Uploads:** Multer

### Cloud & Infrastructure
- **Containerization:** Docker & Docker Compose
- **Web Server:** Nginx (Alpine)
- **Cloud Storage:** Azure Blob Storage
- **Hosting:** Microsoft Azure Virtual Machine (Ubuntu)
- **CI/CD:** GitHub Actions

---

## ⚙️ Environment Variables

To run this project, you will need to create a `.env` file in the root directory (and potentially in `/server` and `/client` depending on your setup) with the following variables:

**Backend (`server/.env`):**
```env
DATABASE_URL="postgresql://user:password@host:5432/taskflow_db"
JWT_SECRET="your_super_secret_jwt_key"
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=...;AccountKey=..."
REDIS_URL="redis://redis:6379" # Or your local redis url
