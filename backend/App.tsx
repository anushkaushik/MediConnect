// src/App.tsx
import { useState } from "react";
import CityDialog from "./components/CityDialog";
import {
  matchDoctor,
  chatWithAgent,
  bookAppointment,
  MatchResult,
  ChatMessage,
} from "./api/medimatch";

export default function App() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [city, setCity] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState("");
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState("");

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const [bookingSlot, setBookingSlot] = useState("");
  const [patientName, setPatientName] = useState("");
  const [bookingResult, setBookingResult] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<"match" | "chat">("match");

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleMatch = async () => {
    if (!symptoms.trim() || !city) return;
    setMatchLoading(true);
    setMatchError("");
    setMatchResult(null);
    setBookingResult(null);
    try {
      const result = await matchDoctor(symptoms, city);
      setMatchResult(result);
    } catch (e: any) {
      setMatchError(e.message);
    } finally {
      setMatchLoading(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim() || !city) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatLoading(true);
    try {
      const { reply, updated_history } = await chatWithAgent(
        userMsg,
        city,
        chatHistory
      );
      setChatHistory(updated_history);
    } catch {
      setChatHistory((h) => [
        ...h,
        { role: "user", content: userMsg },
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleBook = async () => {
    if (!matchResult || !bookingSlot || !patientName.trim()) return;
    setBookingLoading(true);
    try {
      const res = await bookAppointment(
        matchResult.doctor_id,
        patientName,
        bookingSlot,
        symptoms
      );
      setBookingResult(
        `✅ Confirmed! ${res.details.patient} → ${res.details.doctor} at ${res.details.hospital} | Slot: ${res.details.slot}`
      );
    } catch (e: any) {
      setBookingResult(`❌ ${e.message}`);
    } finally {
      setBookingLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (!city) return <CityDialog onSelect={setCity} />;

  const slots = matchResult?.available_slots
    ? matchResult.available_slots.split(",").map((s) => s.trim())
    : [];

  return (
    <div className="app">
      <header className="app-header">
        <span className="logo">🏥 MediMatch</span>
        <button className="city-badge" onClick={() => setCity(null)}>
          📍 {city} ▾
        </button>
      </header>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "match" ? "tab active" : "tab"}
          onClick={() => setActiveTab("match")}
        >
          🔍 Quick Match
        </button>
        <button
          className={activeTab === "chat" ? "tab active" : "tab"}
          onClick={() => setActiveTab("chat")}
        >
          💬 Chat with Receptionist
        </button>
      </div>

      {/* ── QUICK MATCH TAB ── */}
      {activeTab === "match" && (
        <div className="section">
          <h2>Describe your symptoms</h2>
          <textarea
            className="symptom-input"
            rows={3}
            placeholder="e.g. I have severe chest pain and shortness of breath for the past 2 days…"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
          <button
            className="primary-btn"
            onClick={handleMatch}
            disabled={matchLoading || !symptoms.trim()}
          >
            {matchLoading ? "Finding doctor…" : "Find Best Doctor"}
          </button>

          {matchError && <p className="error-text">⚠ {matchError}</p>}

          {matchResult && (
            <div className="result-card">
              <div className="result-header">
                <span className="doctor-icon">👨‍⚕️</span>
                <div>
                  <h3>{matchResult.doctor_name}</h3>
                  <p className="specialization">{matchResult.specialization}</p>
                </div>
              </div>

              <div className="result-grid">
                <div><b>🏥 Hospital</b><br />{matchResult.hospital}</div>
                <div><b>📞 Phone</b><br />{matchResult.phone}</div>
                <div className="reason-box"><b>💡 Why this doctor?</b><br />{matchResult.reason}</div>
              </div>

              {matchResult.suggested_medicines.length > 0 && (
                <div className="medicines">
                  <b>💊 Suggested Medicines:</b>{" "}
                  {matchResult.suggested_medicines.join(", ")}
                </div>
              )}

              {matchResult.precautions && (
                <div className="precautions">
                  ⚠️ <b>Precaution:</b> {matchResult.precautions}
                </div>
              )}

              {/* Booking section */}
              <div className="booking-section">
                <h4>📅 Book Appointment</h4>
                <input
                  className="text-input"
                  type="text"
                  placeholder="Your full name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
                <select
                  className="slot-select"
                  value={bookingSlot}
                  onChange={(e) => setBookingSlot(e.target.value)}
                >
                  <option value="">— Select a slot —</option>
                  {slots.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button
                  className="book-btn"
                  onClick={handleBook}
                  disabled={bookingLoading || !bookingSlot || !patientName.trim()}
                >
                  {bookingLoading ? "Booking…" : "Confirm Appointment"}
                </button>
                {bookingResult && <p className="booking-result">{bookingResult}</p>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CHAT TAB ── */}
      {activeTab === "chat" && (
        <div className="section chat-section">
          <div className="chat-window">
            {chatHistory.length === 0 && (
              <div className="chat-placeholder">
                👋 Hi! I'm your AI receptionist. Tell me what's bothering you and I'll find the right doctor in {city}.
              </div>
            )}
            {chatHistory.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.role}`}>
                <span className="bubble-label">{msg.role === "user" ? "You" : "MediMatch"}</span>
                <p>{msg.content}</p>
              </div>
            ))}
            {chatLoading && (
              <div className="chat-bubble assistant typing">
                <span className="typing-dots">● ● ●</span>
              </div>
            )}
          </div>
          <div className="chat-input-row">
            <input
              className="chat-input"
              type="text"
              placeholder="Describe your symptoms…"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleChat()}
            />
            <button
              className="send-btn"
              onClick={handleChat}
              disabled={chatLoading || !chatInput.trim()}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
