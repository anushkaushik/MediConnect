// src/api/medimatch.ts
// All API calls to the FastAPI backend

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface Doctor {
  id: number;
  name: string;
  specialization: string;
  diseases: string;
  city: string;
  hospital: string;
  phone: string;
  email: string;
  available_slots: string;
}

export interface MatchResult {
  doctor_id: number;
  doctor_name: string;
  specialization: string;
  hospital: string;
  phone: string;
  available_slots: string;
  reason: string;
  suggested_medicines: string[];
  precautions: string;
}

export interface AppointmentDetails {
  patient: string;
  doctor: string;
  specialization: string;
  hospital: string;
  slot: string;
  phone: string;
  symptoms: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ── Fetch available cities ────────────────────────────────────────────────────
export async function fetchCities(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/cities`);
  if (!res.ok) throw new Error("Failed to fetch cities");
  const data = await res.json();
  return data.cities;
}

// ── Fetch all doctors (optionally by city) ────────────────────────────────────
export async function fetchDoctors(city?: string): Promise<Doctor[]> {
  const url = city
    ? `${BASE_URL}/doctors?city=${encodeURIComponent(city)}`
    : `${BASE_URL}/doctors`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch doctors");
  const data = await res.json();
  return data.doctors;
}

// ── AI: Match symptoms to best doctor ────────────────────────────────────────
export async function matchDoctor(
  symptoms: string,
  city: string
): Promise<MatchResult> {
  const res = await fetch(`${BASE_URL}/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symptoms, city }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Matching failed");
  }
  return res.json();
}

// ── AI: Chat with receptionist agent ─────────────────────────────────────────
export async function chatWithAgent(
  message: string,
  city: string,
  conversation_history: ChatMessage[]
): Promise<{ reply: string; updated_history: ChatMessage[] }> {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, city, conversation_history }),
  });
  if (!res.ok) throw new Error("Chat request failed");
  return res.json();
}

// ── Book appointment ──────────────────────────────────────────────────────────
export async function bookAppointment(
  doctor_id: number,
  patient_name: string,
  slot: string,
  symptoms: string
): Promise<{ success: boolean; message: string; details: AppointmentDetails }> {
  const res = await fetch(`${BASE_URL}/appointment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ doctor_id, patient_name, slot, symptoms }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Booking failed");
  }
  return res.json();
}
