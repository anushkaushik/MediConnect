from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import pandas as pd
import json
import os

import google.generativeai as genai


genai.configure(api_key=' your gemini key')

app = FastAPI(title="MediMatch AI Agent", version="1.0.0")

# ── CORS (allow Vite dev server) ──────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load CSV database ─────────────────────────────────────────────────────────
CSV_PATH = os.path.join(os.path.dirname(__file__), "doctors.csv")
df = pd.read_csv(CSV_PATH)

# ── Pydantic models ───────────────────────────────────────────────────────────
class MatchRequest(BaseModel):
    symptoms: str
    city: str

class AppointmentRequest(BaseModel):
    doctor_id: int
    patient_name: str
    slot: str
    symptoms: str

class ChatRequest(BaseModel):
    message: str
    city: str
    conversation_history: Optional[list] = []

# ── Helper: get doctors by city ───────────────────────────────────────────────
def get_doctors_for_city(city: str) -> list[dict]:
    city_df = df[df["city"].str.lower() == city.lower()]
    return city_df.to_dict(orient="records")

# ── Helper: build doctor context string for the AI ───────────────────────────
def build_doctor_context(doctors: list[dict]) -> str:
    if not doctors:
        return "No doctors found in this city."
    lines = []
    for d in doctors:
        lines.append(
            f"ID:{d['id']} | {d['name']} | {d['specialization']} | "
            f"Treats: {d['diseases']} | Hospital: {d['hospital']} | "
            f"Slots: {d['available_slots']} | Phone: {d['phone']}"
        )
    return "\n".join(lines)

# ── GET /cities ───────────────────────────────────────────────────────────────
@app.get("/cities")
def get_cities():
    """Return unique cities from the database."""
    cities = sorted(df["city"].unique().tolist())
    return {"cities": cities}

# ── GET /doctors ──────────────────────────────────────────────────────────────
@app.get("/doctors")
def get_doctors(city: Optional[str] = None):
    """Return all doctors, optionally filtered by city."""
    if city:
        result = df[df["city"].str.lower() == city.lower()]
    else:
        result = df
    return {"doctors": result.to_dict(orient="records")}

# ── POST /match ───────────────────────────────────────────────────────────────
@app.post("/match")
def match_doctor(req: MatchRequest):
    """Use gemini AI to match patient symptoms to best doctor in city."""
    doctors = get_doctors_for_city(req.city)
    if not doctors:
        raise HTTPException(status_code=404, detail=f"No doctors found in {req.city}")

    doctor_context = build_doctor_context(doctors)


    prompt = f"""You are a smart medical receptionist AI. A patient has described their issue.
Your job: pick the BEST matching doctor from the list below and respond ONLY with valid JSON.

Patient symptoms/issue: "{req.symptoms}"
City: {req.city}

Available doctors:
{doctor_context}

Rules:
- Match based on specialization and diseases treated
- Pick exactly ONE best doctor
- If no good match, pick a General Physician

Respond ONLY with this JSON (no extra text):
{{
  "doctor_id": <number>,
  "doctor_name": "<name>",
  "specialization": "<specialization>",
  "hospital": "<hospital>",
  "phone": "<phone>",
  "available_slots": "<slots>",
  "reason": "<one sentence why this doctor>",
  "suggested_medicines": ["<medicine1>", "<medicine2>"],
  "precautions": "<one line precaution advice>"
}}"""

    model = genai.GenerativeModel("gemini-flash-latest")
    message = model.generate_content(prompt)
    raw = message.text.strip()
    # Strip markdown fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    result = json.loads(raw.strip())
    return result
    print(result)

# ── POST /chat ────────────────────────────────────────────────────────────────
@app.post("/chat")
def chat_with_agent(req: ChatRequest):
    """Multi-turn conversational AI receptionist."""
    doctors = get_doctors_for_city(req.city)
    doctor_context = build_doctor_context(doctors)

    system_prompt = f"""You are MediMatch, a friendly and efficient AI medical receptionist.
Your role: help patients find the right doctor in {req.city} based on their symptoms.

Available doctors in {req.city}:
{doctor_context}

Guidelines:
- Be warm, professional and concise
- Ask clarifying questions if symptoms are vague
- Recommend ONE best-matched doctor with their details
- Suggest over-the-counter medicines if appropriate (only common ones like paracetamol, antacids)
- Always remind them you are not a substitute for professional medical advice
- Mention available appointment slots
- Format doctor recommendations clearly with name, hospital, phone, and slot times"""

    messages = req.conversation_history + [
        {"role": "user", "content": req.message}
    ]

    gemini_history = []
    for m in messages[:-1]:
        gemini_history.append({
            "role": "user" if m["role"] == "user" else "model",
            "parts": [m["content"]]
        })
    model = genai.GenerativeModel(
        model_name="gemini-flash-latest",
        system_instruction=system_prompt
    )
    chat = model.start_chat(history=gemini_history)
    response = chat.send_message(messages[-1]["content"])
    reply = response.text
    return {
        "reply": reply,
        "updated_history": messages + [{"role": "assistant", "content": reply}]
    }

# ── POST /appointment ─────────────────────────────────────────────────────────
@app.post("/appointment")
def book_appointment(req: AppointmentRequest):
    """Book an appointment slot for a patient."""
    doctor_row = df[df["id"] == req.doctor_id]
    if doctor_row.empty:
        raise HTTPException(status_code=404, detail="Doctor not found")

    doctor = doctor_row.iloc[0]
    slots = [s.strip() for s in str(doctor["available_slots"]).split(",")]

    if req.slot not in slots:
        raise HTTPException(
            status_code=400,
            detail=f"Slot '{req.slot}' unavailable. Available: {slots}"
        )

    # In production: save to DB, send email/SMS here
    return {
        "success": True,
        "message": f"Appointment confirmed!",
        "details": {
            "patient": req.patient_name,
            "doctor": doctor["name"],
            "specialization": doctor["specialization"],
            "hospital": doctor["hospital"],
            "slot": req.slot,
            "phone": doctor["phone"],
            "symptoms": req.symptoms,
        }
    }

# ── GET / (health check) ──────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "MediMatch API running", "docs": "/docs"}
