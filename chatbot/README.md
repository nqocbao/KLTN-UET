# KLTN Travel Chatbot - RASA Integration

Chatbot tích hợp với RASA Framework cho hệ thống du lịch

## 🚀 Tính năng

- ✅ Tìm kiếm khách sạn theo địa điểm, giá cả
- ✅ Tìm kiếm tour du lịch
- ✅ Gợi ý điểm đến
- ✅ Hỏi đáp về thông tin khách sạn
- ✅ Lưu trữ conversation vào database
- ✅ Tích hợp với Node.js backend

## 📋 Yêu cầu

- Python 3.8 - 3.10 (RASA không support 3.11+)
- Node.js >= 18.x
- MongoDB

## 🔧 Cài đặt

### 1. Setup Python Environment

```bash
# Tạo virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Cấu hình Environment

```bash
# Copy file .env.example
cp .env.example .env

# Chỉnh sửa file .env với thông tin của bạn
```

### 3. Train RASA Model

```bash
# Train model
rasa train

# Nếu gặp lỗi, thử train với CPU:
rasa train --num-threads 2
```

## 🏃 Chạy Chatbot

### Chạy RASA Server

```bash
# Terminal 1: Run RASA server
rasa run --cors "*"
# Hoặc run trong debug mode:
rasa run --cors "*" --debug
```

### Chạy Actions Server

```bash
# Terminal 2: Run custom actions server
rasa run actions
```

### Chạy Node.js Backend

```bash
# Terminal 3: Run Node.js server
cd ../server
npm run dev
```

## 🧪 Test Chatbot

### Test trong shell

```bash
rasa shell
```

### Test qua HTTP API

```bash
curl -X POST http://localhost:5005/webhooks/rest/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "test_user",
    "message": "Tìm khách sạn ở Hà Nội"
  }'
```

### Test qua Node.js Proxy

```bash
curl -X POST http://localhost:5000/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "user123",
    "message": "Xin chào"
  }'
```

## 📁 Cấu trúc thư mục

```
chatbot/
├── actions/              # Custom Actions
│   ├── __init__.py
│   └── actions.py        # Actions gọi Backend API
├── data/                 # Training Data
│   ├── nlu.yml          # NLU examples
│   ├── rules.yml        # Conversation rules
│   └── stories.yml      # Conversation stories
├── models/              # Trained models (tự tạo sau khi train)
├── config.yml           # RASA configuration
├── domain.yml           # Domain definition
├── endpoints.yml        # Endpoints configuration
├── requirements.txt     # Python dependencies
└── README.md
```
