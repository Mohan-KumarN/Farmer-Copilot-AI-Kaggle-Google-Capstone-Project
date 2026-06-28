# Farmer Copilot AI

AI-powered platform for farmers to get **crop recommendations**, **disease detection**, **weather-based advisories**, **market price insights**, and **government scheme search**—all with a friendly dashboard.

> Built with **FastAPI (backend)** + **Next.js (frontend)** + **SQLite**.

---

## ✨ Key Features

- **Dashboard**
  - Combines weather + AI recommendation + market info + upcoming tasks.
- **AI Chat**
  - Conversational support tailored with farmer farm/crop context.
- **Crop Recommendation** (ML model)
  - Predicts suitable crops based on soil & weather inputs.
- **Disease Scanner** (image diagnosis)
  - Upload a leaf photo to detect disease, confidence score, and solution.
- **Weather Advisory**
  - Generates crop-specific guidance using forecast conditions.
- **Market Prices**
  - Shows live/updated market price insights.
- **Government Schemes (RAG search)**
  - Searches welfare schemes using the farmer profile context.
-  **Personalized Farmer Profile** – Manage farm details to receive accurate, personalized AI recommendations.

---
## 🧰 Tech Stack

- **Backend:** FastAPI, SQLAlchemy, SQLite, scikit-learn
- **Frontend:** Next.js (React), Tailwind CSS
- **AI/ML:** crop model (scikit-learn) + vision diagnosis services + RAG-style scheme search

---

## 🚀 How to Run Locally

### 1) Backend (FastAPI)

```bash
cd backend

# (recommended) create venv
python -m venv .venv
.
# activate venv (Windows)
.

pip install -r requirements.txt

# run server
uvicorn main:app --reload --port 8000
```

Backend default database:
- `DATABASE_URL` defaults to `sqlite:///./farmer_copilot.db` (see `backend/database/db.py`)

> If you set `DATABASE_URL`, provide it via environment variable or backend `.env`.

### 2) Frontend (Next.js)

```bash
cd frontend

npm install
npm run dev
```

Frontend dev server:
- `http://localhost:3000`

---

## 🔌 API Endpoints (High Level)

- **Auth & Profile**
  - `POST /api/auth/register`
  - `GET /api/auth/login`
  - `POST /api/auth/profile`
  - `GET /api/auth/profile/{user_id}`

- **Dashboard**
  - `GET /api/dashboard/{user_id}`

- **AI Chat**
  - `POST /api/chat`
  - `GET /api/chat/history/{user_id}`

- **Crop Recommendation**
  - `POST /api/crop-recommendation`

- **Disease Detection**
  - `POST /api/disease-detection`

- **Weather Advisory**
  - `GET /api/weather/advisory`

- **Market Prices**
  - `GET /api/market/prices`

- **Market Advisory**
  - `GET /api/market/advisory`

- **Government Schemes (RAG search)**
  - `POST /api/schemes/search`


---

## 📁 Project Structure

- `backend/`
  - `main.py` — FastAPI server + endpoints
  - `services/` — crop, disease, weather, market, schemes, AI routing
  - `models/` — SQLAlchemy DB models
  - `ml/` — ML components (crop model, datasets, etc.)

- `frontend/`
  - `app/` — Next.js routes
  - `components/` — UI components (chat, dashboard widgets, scanners)

---

## ✅ Notes

- CORS is enabled on the backend for the frontend to call APIs.
- The project uses SQLite by default for quick local setup.

---

## 📄 License

Add your license information here (e.g., MIT/Apache-2.0).

