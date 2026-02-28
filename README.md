# ServiceFlow

An AI workflow builder application.

## Project Structure

```
serviceflow/
├── frontend/          # React + Vite + TypeScript
└── backend/           # Python + FastAPI
```

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:5173

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at http://localhost:8000

API docs available at http://localhost:8000/docs

