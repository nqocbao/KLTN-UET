# KLTN UET - Travel & Tourism Platform

Hệ thống quản lý du lịch và khách sạn

## 📁 Cấu trúc dự án

```
KLTN UET/
├── client/          # Next.js Frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/          # Node.js Backend (TypeScript)
│   ├── models/      # Mongoose Models
│   ├── controllers/ # API Controllers
│   ├── routes/      # API Routes
│   ├── middlewares/ # Authentication & Validation
│   ├── types/       # TypeScript Type Definitions
│   ├── config/      # Database & App Config
│   └── package.json
│
└── README.md
```

## 🚀 Công nghệ sử dụng

### Frontend

- **Next.js** - React Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling

### Backend

- **Node.js** - Runtime
- **Express.js** - Web Framework
- **TypeScript** - Type Safety
- **MongoDB** - Database
- **Mongoose** - ODM

## 📦 Database Schema

- Users & Roles Management
- Guides & Travel Services
- Hotels, Restaurants, Airlines, Transport
- Destinations & Reviews
- Chatbot Support System
- Address Management (Provinces, Districts, Wards)

## 🔧 Cài đặt

### Prerequisites

- Node.js >= 18.x
- MongoDB
- npm/yarn/pnpm

### Client Setup

```bash
cd client
npm install
npm run dev
```

### Server Setup

```bash
cd server
npm install
npm run dev
```

## 🌐 Environment Variables

### Server (.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kltn_uet
JWT_SECRET=your_secret_key
```

### Client (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 👥 Team

KLTN - UET

## 📄 License

Private Project
