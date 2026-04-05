# MediMatch AI Agent

AI-powered medical receptionist that matches patients to doctors based on symptoms and city.

## Project Structure

```
medimatch/
├── backend/
│   ├── main.py          ← FastAPI app (all API routes)
│   ├── doctors.csv      ← Doctor database
│   ├── requirements.txt
│   └── .env.example     ← Copy to .env
│
└── frontend/            ← Your existing Vite + TypeScript project
    └── src/
        ├── api/
        │   └── medimatch.ts      ← All API calls
        ├── components/
        │   └── CityDialog.tsx    ← City selection popup
        ├── App.tsx               ← Main app component
        └── index.css             ← Styles
```

## Setup

### 1. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set your API key
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Run the server
uvicorn main:app --reload
# → Runs on http://localhost:8000
# → API docs at http://localhost:8000/docs
```

### 2. Frontend

```bash
cd frontend

# Copy env file
cp .env.example .env.local

# Install & run (assuming Vite project already set up)
npm install
npm run dev
# → Runs on http://localhost:5173
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/cities` | List all cities in DB |
| GET | `/doctors?city=Bengaluru` | List doctors (optional city filter) |
| POST | `/match` | AI matches symptoms → best doctor |
| POST | `/chat` | Multi-turn chat with AI receptionist |
| POST | `/appointment` | Book an appointment slot |

## Adding More Doctors

Edit `doctors.csv`. Columns:
- `id` — unique number
- `name` — Dr. Full Name  
- `specialization` — e.g. Cardiologist
- `diseases` — comma-separated conditions treated
- `city` — must match exactly what user selects
- `hospital` — hospital name
- `phone`, `email`
- `available_slots` — comma-separated, e.g. `Mon 10AM,Wed 2PM`

## How It Works

1. User opens app → city selection popup appears
2. User picks city → filtered doctor pool is set
3. **Quick Match**: user types symptoms → Claude AI picks best doctor + suggests medicines
4. **Chat**: conversational mode with full AI receptionist
5. User selects slot + enters name → appointment is confirmed
