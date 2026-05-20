import { useState, useRef, useEffect } from "react";
import "../../styles/Tourism/TourismPage.css";
import { buildApiUrl } from "../../config/env";

const API_URL = buildApiUrl("/api/transport");

const vehicleEmoji = { car: "🚗", moto: "🏍️", bike: "🚲", train: "🚆" };
const vehicleLabel = { car: "Voiture", moto: "Moto", bike: "Vélo", train: "Train" };
const weatherIcon = {
  Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Drizzle: "🌦️",
  Thunderstorm: "⛈️", Snow: "❄️", Mist: "🌫️", Fog: "🌫️",
};

// ─── Debounce hook ────────────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Nominatim helpers ────────────────────────────────────────────────────────
async function searchCity(query) {
  if (!query || query.length < 2) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&accept-language=fr`
    );
    return await res.json();
  } catch { return []; }
}

async function getCoords(name) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(name)}&limit=1`
  );
  const data = await res.json();
  if (!data.length) throw new Error(`Ville "${name}" introuvable`);
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
}

// ─── CityInput ────────────────────────────────────────────────────────────────
function CityInput({ label, dot, placeholder, value, onChange, onSelect }) {
  const [suggestions, setSuggestions] = useState([]);
  const [focused, setFocused] = useState(false);
  const [loadingSug, setLoadingSug] = useState(false);
  const debounced = useDebounce(value, 320);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!debounced || debounced.length < 2) { setSuggestions([]); return; }
    setLoadingSug(true);
    searchCity(debounced).then(d => { setSuggestions(d); setLoadingSug(false); });
  }, [debounced]);

  useEffect(() => {
    const fn = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setSuggestions([]); setFocused(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const select = (s) => {
    onSelect(s.display_name, parseFloat(s.lat), parseFloat(s.lon));
    setSuggestions([]); setFocused(false);
  };

  const showDrop = focused && (suggestions.length > 0 || (loadingSug && value.length >= 2));

  return (
    <div className={`ci-wrap ${focused ? "ci-focused" : ""} ${showDrop ? "ci-open" : ""}`} ref={wrapRef}>
      <div className="ci-label">
        <span className={`ci-dot ${dot}`} />
        {label}
      </div>
      <div className="ci-field">
        <input
          className="ci-input"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          autoComplete="off"
          spellCheck={false}
        />
        <div className="ci-suffix">
          {loadingSug
            ? <span className="ci-spin" />
            : value
            ? <button className="ci-clear" onClick={() => { onChange(""); setSuggestions([]); }}>✕</button>
            : <span className="ci-search-icon">⌕</span>
          }
        </div>
      </div>

      {showDrop && (
        <div className="ci-dropdown">
          {loadingSug && !suggestions.length && (
            <div className="ci-sug-loading">Recherche…</div>
          )}
          {suggestions.map((s, i) => {
            const parts = s.display_name.split(",");
            const main = parts[0].trim();
            const sub  = parts.slice(1).join(",").trim();
            return (
              <div key={i} className="ci-sug-item" onMouseDown={() => select(s)}>
                <span className="ci-sug-pin">📍</span>
                <span className="ci-sug-text">
                  <span className="ci-sug-main">{main}</span>
                  <span className="ci-sug-sub">{sub}</span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Result cards ─────────────────────────────────────────────────────────────
function StatCard({ icon, accent, label, value, unit, delay }) {
  return (
    <div className="rcard" style={{ animationDelay: `${delay}ms` }}>
      <div className={`rcard-icon ${accent}`}>{icon}</div>
      <div className="rcard-label">{label}</div>
      <div className="rcard-value">{value}</div>
      <div className="rcard-unit">{unit}</div>
    </div>
  );
}

function WeatherCard({ weather, delay }) {
  return (
    <div className="rcard" style={{ animationDelay: `${delay}ms` }}>
      <div className="rcard-icon or">{weatherIcon[weather.condition] || "🌡️"}</div>
      <div className="rcard-label">MÉTÉO AU DÉPART</div>
      <div className="rcard-value">{weather.temp?.toFixed(1)}°C</div>
      <div className="rcard-unit">{weather.condition}</div>
      <div className="weather-pills">
        {weather.humidity !== undefined && <span>💧 {weather.humidity}%</span>}
        {weather.wind !== undefined && <span>🌬 {weather.wind} m/s</span>}
      </div>
    </div>
  );
}

function MLCard({ prediction, delay }) {
  return (
    <div className="rcard rcard-ml" style={{ animationDelay: `${delay}ms` }}>
      <div className="ml-tag">IA</div>
      <div className="ml-emoji">{vehicleEmoji[prediction] || "🚌"}</div>
      <div className="rcard-label" style={{ color: "var(--or)" }}>RECOMMANDATION IA</div>
      <div className="ml-name">{vehicleLabel[prediction] || prediction}</div>
      <div className="ml-hint">Meilleur choix pour ce trajet</div>
    </div>
  );
}

function PricesCard({ prices, best, delay }) {
  const sorted = Object.entries(prices).sort((a, b) => a[1] - b[1]);
  return (
    <div className="rcard rcard-wide" style={{ animationDelay: `${delay}ms` }}>
      <div className="rcard-label" style={{ marginBottom: 20 }}>💰 TARIFS ESTIMÉS</div>
      {sorted.map(([mode, price]) => (
        <div key={mode} className={`prow ${mode === best ? "prow-best" : ""}`}>
          <span className="prow-left">
            <span className="prow-emoji">{vehicleEmoji[mode] || "🚌"}</span>
            <span className="prow-name">{vehicleLabel[mode] || mode}</span>
            {mode === best && <span className="prow-badge">Recommandé</span>}
          </span>
          <span className="prow-price">{Number(price).toFixed(2)} <small>MAD</small></span>
        </div>
      ))}
    </div>
  );
}

function PoisCard({ pois, delay }) {
  const items = (pois?.features || []).map((f, i) => ({
    id: i,
    name: f.properties?.name || f.properties?.osm_tags?.name || "Point d'intérêt",
    type: f.properties?.category_ids
      ? Object.values(f.properties.category_ids).map(c => c.category_name).filter(Boolean).join(", ")
      : "Lieu",
  }));

  return (
    <div className="rcard rcard-full" style={{ animationDelay: `${delay}ms` }}>
      <div className="rcard-label" style={{ marginBottom: 20 }}>
        📍 POINTS D'INTÉRÊT À PROXIMITÉ
        {items.length > 0 && <span className="poi-count-badge">{items.length}</span>}
      </div>
      {items.length === 0
        ? <div className="poi-empty">Aucun point d'intérêt trouvé dans ce périmètre.</div>
        : <div className="pois-grid">
            {items.map(p => (
              <div key={p.id} className="poi-chip">
                <div className="poi-chip-name">{p.name}</div>
                <div className="poi-chip-type">{p.type}</div>
              </div>
            ))}
          </div>
      }
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function TourismPage() {
  const [city1, setCity1] = useState("");
  const [city2, setCity2] = useState("");
  const [coords1, setCoords1] = useState(null);
  const [coords2, setCoords2] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const resultRef = useRef(null);

  const handleSubmit = async () => {
    if (!city1 || !city2) { setError("Veuillez sélectionner les deux villes."); return; }
    setLoading(true); setError(null); setResult(null);

    try {
      const start = coords1 || await getCoords(city1);
      const end   = coords2 || await getCoords(city2);

      const res = await fetch(`${API_URL}/best-transport`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat1: start.lat, lon1: start.lon, lat2: end.lat, lon2: end.lon }),
      });

      if (!res.ok) throw new Error(`Erreur serveur ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setResult(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    } catch (err) {
      setError(err.message || "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tp">

      {/* ═══ HERO ═══ */}
      <section className="tp-hero">
        <div className="tp-hero-zellige" />
        <div className="tp-hero-orb tp-orb-1" />
        <div className="tp-hero-orb tp-orb-2" />

        <div className="tp-hero-inner">
          <div className="tp-badge">
            <span className="tp-badge-line" />
            TOURISME INTELLIGENT MAROC
            <span className="tp-badge-line" />
          </div>

          <h1 className="tp-title">
            Découvrez le Maroc<br />
            <em>à votre rythme</em>
          </h1>

          <p className="tp-sub">
            Entrez vos villes — notre IA calcule le meilleur trajet, les prix et la météo.
          </p>

          {/* Form card */}
          <div className="tp-form">
            <div className="tp-form-cities">
              <CityInput
                label="Ville de départ"
                dot="dot-green"
                placeholder="Ex: Casablanca"
                value={city1}
                onChange={v => { setCity1(v); setCoords1(null); }}
                onSelect={(name, lat, lon) => { setCity1(name); setCoords1({ lat, lon }); }}
              />
              <div className="tp-route-connector">
                <div className="tp-route-line" />
                <div className="tp-route-icon">⬩</div>
                <div className="tp-route-line" />
              </div>
              <CityInput
                label="Ville de destination"
                dot="dot-red"
                placeholder="Ex: Marrakech"
                value={city2}
                onChange={v => { setCity2(v); setCoords2(null); }}
                onSelect={(name, lat, lon) => { setCity2(name); setCoords2({ lat, lon }); }}
              />
            </div>

            {error && <div className="tp-error">⚠️ {error}</div>}

            <button
              className={`tp-submit ${loading ? "tp-submit-loading" : ""}`}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading
                ? <><span className="tp-loader" /> Analyse en cours…</>
                : <>Analyser le trajet <span className="tp-arrow">→</span></>
              }
            </button>

            <div className="tp-form-footer">
              Propulsé par OpenRouteService · OpenWeatherMap · Machine Learning
            </div>
          </div>
        </div>
      </section>

      {/* ═══ RÉSULTATS ═══ */}
      <section className="tp-results" ref={resultRef}>
        {result && (
          <>
            <div className="tp-results-header">
              <div className="tp-results-route">
                <span>{city1.split(",")[0]}</span>
                <span className="tp-results-arrow">→</span>
                <span>{city2.split(",")[0]}</span>
              </div>
              <h2>Analyse de votre trajet</h2>
              <div className="tp-results-ornament"><span />✦<span /></div>
            </div>

            <div className="tp-results-grid">
              <StatCard icon="📏" accent="rouge" label="DISTANCE" value={result.distance_km?.toFixed(1)} unit="kilomètres" delay={0} />
              <StatCard icon="⏱" accent="vert" label="DURÉE" value={result.duration_min?.toFixed(0)} unit="minutes" delay={80} />
              {result.weather && <WeatherCard weather={result.weather} delay={160} />}
              {result.ml_prediction && <MLCard prediction={result.ml_prediction} delay={240} />}
              {result.prices && <PricesCard prices={result.prices} best={result.ml_prediction} delay={320} />}
              {result.pois && <PoisCard pois={result.pois} delay={400} />}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
