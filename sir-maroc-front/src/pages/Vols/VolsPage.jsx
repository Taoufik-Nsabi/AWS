import { useMemo, useState } from "react";
import "../../styles/Vols/VolsPage.css";

import { API_BASE_URL } from "../../config/env";

const MOROCCO_AIRPORTS = [
  { city: "Casablanca", iata: "CMN" },
  { city: "Marrakech", iata: "RAK" },
  { city: "Rabat", iata: "RBA" },
  { city: "Tanger", iata: "TNG" },
  { city: "Fes", iata: "FEZ" },
  { city: "Agadir", iata: "AGA" },
  { city: "Oujda", iata: "OUD" },
  { city: "Nador", iata: "NDR" },
  { city: "Laayoune", iata: "EUN" },
  { city: "Dakhla", iata: "VIL" }
];

const DEPARTURE_CITY_TO_IATA = {
  paris: "CDG",
  lyon: "LYS",
  marseille: "MRS",
  madrid: "MAD",
  barcelona: "BCN",
  lisbonne: "LIS",
  lisbon: "LIS",
  londres: "LHR",
  london: "LHR",
  bruxelles: "BRU",
  brussels: "BRU",
  amsterdam: "AMS",
  rome: "FCO",
  roma: "FCO",
  milan: "MXP",
  milano: "MXP",
  berlin: "BER",
  dubai: "DXB",
  istanbul: "IST",
  montreal: "YUL",
  toronto: "YYZ",
  newyork: "JFK",
  "new york": "JFK",
  casablanca: "CMN",
  rabat: "RBA",
  marrakech: "RAK",
  tanger: "TNG",
  fes: "FEZ",
  agadir: "AGA"
};

function toIsoDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function resolveDepartureIata(input) {
  const raw = (input || "").trim();
  if (!raw) return "CDG";

  if (/^[a-z]{3}$/i.test(raw)) return raw.toUpperCase();

  const normalized = raw.toLowerCase().replace(/\s+/g, " ");
  const compact = normalized.replace(/\s+/g, "");
  return DEPARTURE_CITY_TO_IATA[normalized] || DEPARTURE_CITY_TO_IATA[compact] || "";
}

function extractFlights(payload) {
  const directLists = [payload?.best_flights, payload?.other_flights, payload?.flights_results, payload?.flights];
  for (const list of directLists) {
    if (Array.isArray(list) && list.length > 0) return list;
  }
  return [];
}

function normalizeFlight(item) {
  const legs = Array.isArray(item?.flights) ? item.flights : [];
  const firstLeg = legs[0] || {};
  const lastLeg = legs[legs.length - 1] || firstLeg;

  const departureAirport =
    firstLeg?.departure_airport?.name ||
    firstLeg?.departure_airport ||
    item?.departure_airport?.name ||
    item?.departure ||
    "-";

  const arrivalAirport =
    lastLeg?.arrival_airport?.name ||
    lastLeg?.arrival_airport ||
    item?.arrival_airport?.name ||
    item?.arrival ||
    "-";

  const departureTime =
    firstLeg?.departure_airport?.time ||
    firstLeg?.departure_time ||
    item?.departure_time ||
    item?.date ||
    "-";

  const arrivalTime =
    lastLeg?.arrival_airport?.time ||
    lastLeg?.arrival_time ||
    item?.arrival_time ||
    "-";

  const carrier = firstLeg?.airline || item?.airline || "Compagnie";
  const flightNumber = firstLeg?.flight_number || item?.flight_number || "-";
  const duration = item?.total_duration || item?.duration || "-";
  const price = item?.price || item?.price_raw || "Prix indisponible";
  const stops = item?.layovers?.length || item?.stops || 0;

  return {
    carrier,
    departureAirport,
    arrivalAirport,
    departureTime,
    arrivalTime,
    flightNumber,
    duration,
    price,
    stops
  };
}

export default function VolsPage() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [flights, setFlights] = useState([]);
  const [searched, setSearched] = useState(false);

  const [departureQuery, setDepartureQuery] = useState("Paris");
  const [flightDate, setFlightDate] = useState(today);
  const [arrivalIata, setArrivalIata] = useState("CMN");

  const selectedArrival = useMemo(
    () => MOROCCO_AIRPORTS.find((airport) => airport.iata === arrivalIata) || MOROCCO_AIRPORTS[0],
    [arrivalIata]
  );

  const searchFlights = async () => {
    setError("");
    setLoading(true);
    setSearched(true);

    const safeDeparture = resolveDepartureIata(departureQuery);
    const safeDate = toIsoDate(flightDate) || today;

    if (!safeDeparture) {
      setError("Ville de depart non reconnue. Essayez une grande ville (ex: Paris, Madrid, Londres) ou un code IATA (ex: CDG).");
      setFlights([]);
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      params.set("departure", safeDeparture);
      params.set("arrival", selectedArrival.iata);
      params.set("date", safeDate);

      const response = await fetch(`${API_BASE_URL}/api/flights/search?${params.toString()}`);
      const payload = await response.json();

      if (!response.ok || payload?.error) {
        const apiMessage = payload?.error || payload?.message || `Erreur API (${response.status})`;
        setError(typeof apiMessage === "string" ? apiMessage : "Erreur SerpApi.");
        setFlights([]);
        return;
      }

      const rawFlights = extractFlights(payload);
      setFlights(rawFlights.map(normalizeFlight));
    } catch (err) {
      const technicalMessage = err instanceof Error ? err.message : "";
      setError(
        technicalMessage
          ? `Impossible de contacter le service des vols pour le moment (${technicalMessage}).`
          : "Impossible de contacter le service des vols pour le moment."
      );
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="luxury-moroccan vols-page">
      <section className="vols-hero">
        <div className="vols-overlay"></div>
        <div className="container-luxury vols-hero-content">
          <span className="section-subtitle">NOUVEAU SERVICE</span>
          <h1 className="vols-title">Vols vers le Maroc</h1>
          <p className="vols-subtitle">Consultez les vols disponibles vers les principales villes du Royaume.</p>
        </div>
      </section>

      <section className="vols-content">
        <div className="container-luxury">
          <div className="vols-filters">
            <div className="vols-filter-item">
              <label>Ville de depart</label>
              <input
                type="text"
                value={departureQuery}
                onChange={(e) => setDepartureQuery(e.target.value)}
                placeholder="Ex: Paris ou CDG"
              />
            </div>

            <div className="vols-filter-item">
              <label>Date de vol</label>
              <input type="date" value={flightDate} onChange={(e) => setFlightDate(e.target.value)} />
            </div>

            <div className="vols-filter-item">
              <label>Ville d'arrivee (Maroc)</label>
              <select value={arrivalIata} onChange={(e) => setArrivalIata(e.target.value)}>
                {MOROCCO_AIRPORTS.map((airport) => (
                  <option key={airport.iata} value={airport.iata}>
                    {airport.city} ({airport.iata})
                  </option>
                ))}
              </select>
            </div>

            <button className="auth-btn vols-search-btn" onClick={searchFlights} disabled={loading}>
              {loading ? "Recherche..." : "Rechercher"}
            </button>
          </div>

          {!searched && !loading && !error && (
            <div className="vols-status vols-empty-hint">
              Renseignez votre ville de depart, la date et la destination, puis cliquez sur Rechercher pour afficher les vols.
            </div>
          )}

          {error && <div className="error-box vols-status">{error}</div>}
          {!error && loading && <div className="vols-status">Chargement des vols...</div>}
          {!loading && searched && flights.length === 0 && <div className="vols-status">Aucun vol trouve pour ces criteres.</div>}

          <div className="vols-grid">
            {flights.map((flight, idx) => (
              <article className="vol-card reveal active" key={`${flight.flightNumber}-${idx}`}>
                <div className="vol-card-head">
                  <h3>{flight.carrier}</h3>
                  <span className="vol-status active">Disponible</span>
                </div>

                <div className="vol-route">
                  <div>
                    <p className="vol-airport">{flight.departureAirport}</p>
                    <p className="vol-meta">Depart</p>
                    <p className="vol-time">{flight.departureTime}</p>
                  </div>
                  <div className="vol-arrow">-&gt;</div>
                  <div>
                    <p className="vol-airport">{flight.arrivalAirport}</p>
                    <p className="vol-meta">Arrivee</p>
                    <p className="vol-time">{flight.arrivalTime}</p>
                  </div>
                </div>

                <div className="vol-footer">
                  <span>Vol: {flight.flightNumber}</span>
                  <span>Duree: {flight.duration}</span>
                  <span>{flight.stops === 0 ? "Direct" : `${flight.stops} escale(s)`}</span>
                  <span>Prix: {flight.price}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
