import { useEffect, useMemo, useState } from "react";
import "../../styles/Matchs/MatchsPage.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function formatDate(value) {
  return new Date(value).toISOString().slice(0, 10);
}

async function parseJsonSafe(response) {
  const raw = await response.text();
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(raw || `Erreur API (${response.status})`);
  }
}

export default function MatchsPage() {
  const today = useMemo(() => formatDate(new Date()), []);

  const [matchDate, setMatchDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [matches, setMatches] = useState([]);

  const statusPriority = (status) => {
    const s = (status || "").toUpperCase();
    if (["LIVE", "1H", "HT", "2H", "ET", "BT", "P", "SUSP", "INT"].includes(s)) return 0;
    if (["NS", "TBD", "PROGRAMME"].includes(s)) return 1;
    if (["FT", "AET", "PEN", "TERMINE"].includes(s)) return 2;
    return 3;
  };

  const sortMatches = (items) => {
    return [...items].sort((a, b) => {
      const byStatus = statusPriority(a.status) - statusPriority(b.status);
      if (byStatus !== 0) return byStatus;
      return (a.utcDate || "").localeCompare(b.utcDate || "");
    });
  };

  const loadLiveMatches = async (dateValue) => {
    setLoading(true);
    setError("");

    try {
      const requestUrl = `${API_BASE_URL}/api/matches/external?dateFrom=${dateValue}&dateTo=${dateValue}&limit=20`;
      const response = await fetch(requestUrl, { cache: "no-store" });
      const payload = await parseJsonSafe(response);

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || `Erreur API (${response.status})`);
      }

      const data = Array.isArray(payload?.data) ? payload.data : [];
      const mapped = data.map((item) => ({
        id: item.id,
        competition: item.competition || "Competition",
        status: item.status || "LIVE",
        utcDate: item.utcDate || "",
        venue: item.venue || "Non communique",
        stage: item.stage || "-",
        matchday: item.matchday || "-",
        homeTeam: item.homeTeam || "Equipe locale",
        awayTeam: item.awayTeam || "Equipe visiteur",
        score: item.score || "- - -",
      }));
      setMatches(sortMatches(mapped));
    } catch (e) {
      setMatches([]);
      setError(e instanceof Error ? e.message : "Erreur de chargement des matchs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveMatches(today);
  }, [today]);

  return (
    <div className="luxury-moroccan matchs-page">
      <section className="matchs-hero">
        <div className="matchs-overlay"></div>
        <div className="container-luxury matchs-hero-content">
          <span className="section-subtitle">LIVE</span>
          <h1 className="matchs-title">Matchs En Direct</h1>
          <p className="matchs-subtitle">LIVE en premier, puis les autres matchs de la date selectionnee.</p>
        </div>
      </section>

      <section className="matchs-content">
        <div className="container-luxury">
          <div className="matchs-filters">
            <div className="matchs-filter-item">
              <label>Date du match</label>
              <input type="date" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} />
            </div>

            <button className="auth-btn matchs-search-btn" onClick={() => loadLiveMatches(matchDate)} disabled={loading}>
              {loading ? "Chargement..." : "Filtrer"}
            </button>
          </div>

          {error && <div className="error-box matchs-status">{error}</div>}
          {loading && <div className="matchs-status">Chargement en cours...</div>}
          {!loading && !error && matches.length === 0 && (
            <div className="matchs-status">Matchs aujourd'hui non disponibles.</div>
          )}

          <div className="matchs-grid">
            {matches.map((m) => (
              <article className="match-card reveal active" key={m.id}>
                <div className="match-card-head">
                  <h3>{m.competition || "Competition"}</h3>
                  <span className="match-status">{m.status || "LIVE"}</span>
                </div>
                <p className="match-teams">
                  {m.homeTeam} vs {m.awayTeam}
                </p>
                <p className="match-meta">Date UTC: {m.utcDate || "-"}</p>
                <p className="match-meta">Stade: {m.venue || "Non communique"}</p>
                <p className="match-meta">
                  Stage: {m.stage || "-"} | Journee: {m.matchday || "-"}
                </p>
                <p className="match-score">Score: {m.score || "- - -"}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
