// src/components/CityDialog.tsx
import { useState, useEffect } from "react";
import { fetchCities } from "../api/medimatch";

interface Props {
  onSelect: (city: string) => void;
}

export default function CityDialog({ onSelect }: Props) {
  const [cities, setCities] = useState<string[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCities()
      .then(setCities)
      .catch(() => setError("Could not load cities. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  const handleConfirm = () => {
    if (!selected) return;
    onSelect(selected);
  };

  return (
    <div className="city-dialog-overlay">
      <div className="city-dialog">
        <div className="dialog-icon">🏥</div>
        <h2>Welcome to MediMatch</h2>
        <p>Select your city to find the best doctors near you</p>

        {loading && <p className="loading-text">Loading cities…</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && (
          <>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="city-select"
            >
              <option value="">— Choose your city —</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              onClick={handleConfirm}
              disabled={!selected}
              className="confirm-btn"
            >
              Find Doctors →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
