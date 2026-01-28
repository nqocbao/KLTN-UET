# KLTN UET - Travel & Tourism Platform 🌍

Hệ thống quản lý du lịch và khách sạn với **AI Chatbot** (RASA Framework)

## 🎯 Tính năng chính

✅ Quản lý khách sạn, tour du lịch, chuyến bay  
✅ Hệ thống đặt phòng & đặt tour  
✅ **AI Chatbot tư vấn du lịch (RASA NLU/Core)**  
✅ Data Augmentation tự động với LLM  
✅ Quản lý người dùng & phân quyền  
✅ Review & Rating system  
✅ Multi-language support (VI/EN)  

---

## 📁 Cấu trúc dự án

```
KLTN UET/
├── client/          # Next.js Frontend (Port 3000)
│   ├── src/
│   │   ├── components/
│   │   │   └── common/ChatBot.tsx  # 💬 Chatbot UI
│   │   └── app/
│   ├── public/
│   └── package.json
│
├── server/          # Node.js Backend (Port 5000)
│   ├── models/      # Mongoose Models
│   │   ├── conversations.model.ts  # 💬 Chat history
│   │   ├── messages.model.ts
│   │   └── ...
│   ├── controllers/
│   │   └── chatbot.controller.ts   # 🤖 RASA webhook
│   ├── routes/
│   │   └── chatbot.routes.ts
│   └── package.json
│
├── chatbot/         # 🤖 RASA Chatbot (Python)
│   ├── data/
│   │   ├── nlu.yml              # Training data (250+ examples)
│   │   ├── stories.yml          # Dialogue flows
│   │   └── rules.yml
│   ├── actions/
│   │   └── actions.py           # Custom actions
│   ├── models/                  # Trained models
│   ├── config.yml               # RASA config (Vietnamese NLP)
│   ├── domain.yml               # Intents, entities, responses
│   ├── data_generator.py        # 🧠 AI Data Augmentation
│   ├── train.bat                # Training script
│   ├── run_rasa.bat            # RASA server launcher
│   ├── run_actions.bat         # Actions server launcher
│   └── requirements.txt
│
├── START_ALL.bat               # 🚀 Quick start all servers
├── FULL_RASA_COMPLETE.md       # 📘 Tài liệu chính
└── README.md
```

---

## 🚀 Công nghệ sử dụng

### Frontend
- **Next.js 14** - React Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Shadcn/UI** - Component Library

### Backend
- **Node.js + Express** - REST API
- **TypeScript** - Type Safety
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication
- **Axios** - HTTP Client

### AI Chatbot (NEW! 🆕)
- **RASA 3.6.13** - Open Source Conversational AI
- **DIETClassifier** - Intent Classification + Entity Extraction
- **TEDPolicy** - Transformer-based Dialogue Management
- **ChromaDB** - Vector Database for embeddings
- **Sentence Transformers** - Vietnamese SBERT
- **Google Gemini / OpenAI** - LLM for data augmentation

---

## 📦 Database Schema

### Core Collections
- **Users & Roles** - Authentication & Authorization
- **Hotels, Tours, Flights** - Travel services
- **Destinations & Reviews** - Content management
- **Addresses** - Provinces, Districts, Wards

### Chatbot Collections (NEW! 🆕)
- **Conversations** - Chat sessions
- **Messages** - Chat history
- **Intents** - User intentions
- **Entities** - Extracted information

---


## 🚀 QUICK START (Tất cả trong 1 lệnh)

### Windows
```bash
START_ALL.bat
```

Script này sẽ tự động:
1. ✅ Train RASA model (nếu chưa có)
2. ✅ Khởi động RASA Server (Port 5005)
3. ✅ Khởi động Actions Server (Port 5055)
4. ✅ Khởi động Backend Server (Port 5000)

**Sau đó**, mở terminal riêng và chạy Frontend:
```bash
cd client
npm run dev
```

→ Truy cập: http://localhost:3000

---

## 🔧 Cài đặt Chi tiết

### Prerequisites
- **Node.js** >= 18.x
- **Python** 3.8 - 3.10
- **MongoDB** (local hoặc Atlas)
- npm/yarn/pnpm

### 1️⃣ Clone Repository
```bash
git clone <repository_url>
cd "KLTN UET"
```

### 2️⃣ Setup Chatbot (RASA)
```bash
cd chatbot

# Tạo virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Sửa file .env: Thêm API keys nếu cần

# Train model (5-15 phút)
train.bat  # Windows
./train.sh # Linux/Mac
```

### 3️⃣ Setup Backend
```bash
cd server

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Sửa file .env:
# - MONGO_URI=mongodb://localhost:27017/kltn_travel
# - RASA_SERVER_URL=http://localhost:5005

# (Optional) Seed database
npm run seed
```

### 4️⃣ Setup Frontend
```bash
cd client

# Install dependencies
npm install

# Configure API URL in .env.local (if needed)
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
```

---

## 🏃 Running the Application

### Cách 1: Quick Start (Recommended)
```bash
# Root directory
START_ALL.bat  # Chạy tất cả servers

# Terminal mới
cd client
npm run dev
```

### Cách 2: Manual (Từng server)

**Terminal 1 - RASA Server**:
```bash
cd chatbot
venv\Scripts\activate
run_rasa.bat
```

**Terminal 2 - Actions Server**:
```bash
cd chatbot
venv\Scripts\activate
run_actions.bat
```

**Terminal 3 - Backend**:
```bash
cd server
npm run dev
```

**Terminal 4 - Frontend**:
```bash
cd client
npm run dev
```

### URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **RASA Server**: http://localhost:5005
- **Actions Server**: http://localhost:5055

---

## 🧪 Testing Chatbot

### Test trong UI
1. Mở http://localhost:3000
2. Click icon chat (góc phải dưới)
3. Thử các câu:
   - "Tìm khách sạn ở Hà Nội"
   - "Có tour nào hay không"
   - "Giá phòng bao nhiêu"

### Test qua RASA Shell
```bash
cd chatbot
rasa shell
```

### Test API trực tiếp
```bash
curl -X POST http://localhost:5005/webhooks/rest/webhook \
  -H "Content-Type: application/json" \
  -d '{"sender":"test","message":"Xin chào"}'
```

---

## 📚 Tài liệu

- **[FULL_RASA_COMPLETE.md](./FULL_RASA_COMPLETE.md)** - Tổng quan hệ thống
- **[chatbot/MIGRATION_GUIDE.md](./chatbot/MIGRATION_GUIDE.md)** - Hướng dẫn triển khai
- **[chatbot/DATA_GENERATOR_README.md](./chatbot/DATA_GENERATOR_README.md)** - Data Augmentation
- **[chatbot/README.md](./chatbot/README.md)** - RASA setup

---

## 🔥 Data Augmentation (Tăng cường dữ liệu)

### Tính năng
Tự động sinh training data chất lượng cao bằng AI:
- 🤖 Sử dụng LLM (Gemini/OpenAI)
- 📊 Reward Function (Semantic + Diversity Score)
- 🎯 Từ 5 câu seed → 50-100 câu tự động

### Sử dụng
```bash
cd chatbot
run_data_generator.bat

# Kết quả: data/nlu_generated.yml
# Review và merge vào data/nlu.yml
```

**Chi tiết**: [chatbot/DATA_GENERATOR_README.md](./chatbot/DATA_GENERATOR_README.md)

---

## 🤖 RASA Chatbot - Chi tiết

### Intents hỗ trợ
- `greet` - Chào hỏi
- `search_hotel` - Tìm khách sạn
- `search_flight` - Tìm chuyến bay
- `search_tour` - Tìm tour
- `ask_hotel_price` - Hỏi giá
- `book_hotel` - Đặt phòng
- `help` - Trợ giúp

### Custom Actions
- `action_search_hotels` - Query hotels từ MongoDB
- `action_search_tours` - Query tours
- `action_get_hotel_details` - Chi tiết khách sạn
- `action_save_conversation` - Lưu lịch sử chat

### Architecture
```
User → Frontend ChatBot
         ↓
    Backend API (/api/chatbot/message)
         ↓
    RASA Server (NLU + Dialogue)
         ↓
    Actions Server (Custom Actions)
         ↓
    Backend API (Hotels, Tours data)
         ↓
    MongoDB
```

---

## 🛠️ Development

### API Endpoints

**Chatbot**:
```
POST   /api/chatbot/message            # Send message
POST   /api/chatbot/conversations      # Create conversation
GET    /api/chatbot/conversations      # List conversations
GET    /api/chatbot/conversations/:id  # Get conversation
PUT    /api/chatbot/conversations/:id/end # End conversation
```

**Client**:
```
GET    /api/client/hotels     # List hotels
GET    /api/client/tours      # List tours
GET    /api/client/destinations # List destinations
```

### Environment Variables

**Backend (.env)**:
```env
MONGO_URI=mongodb://localhost:27017/kltn_travel
PORT=5000
JWT_SECRET=your_secret
RASA_SERVER_URL=http://localhost:5005
```

**Chatbot (.env)**:
```env
BACKEND_API_URL=http://localhost:5000
LLM_PROVIDER=gemini
LLM_API_KEY=your_api_key
```

---

## 📈 Performance

### RASA Model
- **Training time**: 5-15 phút (CPU)
- **Response time**: < 500ms
- **Accuracy**: ~85-90% (sau khi train đủ data)

### System Requirements
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB cho models + dependencies
- **CPU**: Multi-core recommended cho training

---

## 🐛 Troubleshooting

### Chatbot không hoạt động
1. ✅ Kiểm tra RASA server đang chạy (port 5005)
2. ✅ Kiểm tra Actions server đang chạy (port 5055)
3. ✅ Kiểm tra Backend server đang chạy (port 5000)
4. ✅ Kiểm tra model đã train (`models/travel_chatbot.tar.gz`)

### Model not found
```bash
cd chatbot
train.bat  # Train lại model
```

### RASA server error
```bash
# Check logs trong terminal RASA
# Thường do thiếu dependencies hoặc config sai
pip install -r requirements.txt
```

---

## 🤝 Contributing

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License

---

## 👥 Team

KLTN UET - Travel & Tourism Platform Development Team

---

## 📞 Support

- **Email**: support@example.com
- **Documentation**: [Wiki](./docs)
- **Issues**: [GitHub Issues](./issues)

---

**Made with ❤️ by KLTN UET Team**

### Server Setup

```bash
cd server
npm install
npm run dev
```

### Chatbot Setup (RASA)

Xem chi tiết: **[CHATBOT_SETUP.md](./CHATBOT_SETUP.md)**

```bash
cd chatbot
# Windows:
setup.bat
# Mac/Linux:
./setup.sh

# Train model
rasa train

# Run RASA (Terminal 1)
rasa run --enable-api --cors "*"

# Run Actions Server (Terminal 2)
rasa run actions
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
