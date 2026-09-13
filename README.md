# MealFit Backend API

[![Download Companion Android APK](https://img.shields.io/badge/Companion%20App-Download%20APK-00E599?style=for-the-badge&logo=android&logoColor=white)](https://drive.google.com/file/d/10Dea2nUxYs5ntmRBtK4Wr0ydxXs1Pkft/view?usp=sharing)
[![Backend Live](https://img.shields.io/badge/Live%20API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://mealfitbackend.onrender.com/api/health)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://cloud.mongodb.com/)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

Production REST API and real-time backend engine powering the **MealFit** mobile ecosystem. Built with a modular architecture in Node.js, Express, and TypeScript, connected to MongoDB Atlas and deployed on Render.

---

## 📱 Mobile Companion App (Android APK)

To test the live mobile experience connected to this backend, download the latest standalone Android APK:

- **Google Drive (Direct)**: [**Download MealFit APK**](https://drive.google.com/file/d/10Dea2nUxYs5ntmRBtK4Wr0ydxXs1Pkft/view?usp=sharing)
- **Expo EAS Build Portal**: [**View EAS Build & Artifacts**](https://expo.dev/accounts/govindxsharma/projects/mealfit/builds/07ffe7fd-ee9c-4f95-a3d0-2edbcdc3b8f5)

---

## ⚡ Core API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Fast liveness probe for cloud load balancers |
| `/api/health/details` | `GET` | Deep diagnostics (MongoDB latency, memory, uptime) |
| `/api/auth/register` | `POST` | User registration & biometric baseline initialization |
| `/api/auth/login` | `POST` | Secure token authentication |
| `/api/nutrition/optimize` | `POST` | Linear budget-to-protein optimizer for Indian diets |
| `/api/users/metrics` | `GET` | Super Admin aggregated user telemetry & active counts |

---

## 🛠️ Local Development

```bash
# 1. Install dependencies
npm install

# 2. Environment setup
cp .env.example .env
# Fill in your MONGODB_URI, JWT_SECRET, etc.

# 3. Start development server
npm run dev
# Running on http://localhost:5050
```

---

## 🚀 Cloud Production Deployment (Render)

- **Production Endpoint**: `https://mealfitbackend.onrender.com/api`
- Connected to MongoDB Atlas cluster with TLS encryption.
- Managed via `render.yaml`.
