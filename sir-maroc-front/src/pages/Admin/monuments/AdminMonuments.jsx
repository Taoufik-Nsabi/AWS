import React, { useEffect, useMemo, useState } from "react";
import { parseError } from "../../../utils/apiError";
import MonumentDetail from "../../Monument/MonumentDetail";
import "../../../styles/admin/AdminUsers.css";
import { buildApiUrl } from "../../../config/env";

export default function AdminMonuments() {
  const [monuments, setMonuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedVille, setSelectedVille] = useState("all");
  const [selectedMonument, setSelectedMonument] = useState(null);

  useEffect(() => {
    const fetchMonuments = async () => {
      try {
        const response = await fetch(buildApiUrl("/api/tourism/monuments"));

        if (!response.ok) {
          throw new Error(await parseError(response));
        }

        const data = await response.json();
        setMonuments(Array.isArray(data) ? data : []);
        setError("");
      } catch (err) {
        setError(err.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchMonuments();
  }, []);

  const villes = useMemo(() => {
    const mapped = monuments
      .map((monument) => ({
        id: monument.villeId,
        nom: monument.villeNom,
      }))
      .filter((ville) => ville.id && ville.nom);

    const unique = mapped.filter(
      (ville, index, array) =>
        array.findIndex((item) => item.id === ville.id) === index
    );

    return unique.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
  }, [monuments]);

  const filteredMonuments = monuments.filter((monument) => {
    const search = query.trim().toLowerCase();
    const matchesVille =
      selectedVille === "all" || String(monument.villeId) === selectedVille;

    if (!search) {
      return matchesVille;
    }

    const haystack = [
      monument.nom,
      monument.villeNom,
      monument.categorie,
      monument.description,
      monument.histoire,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return matchesVille && haystack.includes(search);
  });

  return (
    <div className="admin-page-container users-page">
      <div className="admin-page-header">
        <h1 className="admin-title">Monuments</h1>
        <p className="admin-subtitle">
          Catalogue statique des lieux iconiques des villes du Maroc.
        </p>
      </div>

      <div className="users-toolbar users-toolbar-filters">
        <input
          type="search"
          className="users-search"
          placeholder="Rechercher par nom, ville ou categorie"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select
          className="users-select"
          value={selectedVille}
          onChange={(e) => setSelectedVille(e.target.value)}
        >
          <option value="all">Toutes les villes</option>
          {villes.map((ville) => (
            <option key={ville.id} value={String(ville.id)}>
              {ville.nom}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="users-alert error">{error}</div>}

      <div className="users-card">
        {loading ? (
          <div className="users-empty">Chargement...</div>
        ) : filteredMonuments.length === 0 ? (
          <div className="users-empty">Aucun monument trouve.</div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Monument</th>
                <th>Ville</th>
                <th>Categorie</th>
                <th>Prix</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMonuments.map((monument) => (
                <tr key={monument.id}>
                  <td>{monument.id}</td>
                  <td>{monument.nom}</td>
                  <td>{monument.villeNom || "-"}</td>
                  <td>{monument.categorie || "-"}</td>
                  <td>{monument.prix > 0 ? `${monument.prix} MAD` : "Gratuit"}</td>
                  <td>
                    <button
                      type="button"
                      className="users-action-btn"
                      onClick={() => setSelectedMonument(monument)}
                    >
                      Voir details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedMonument && (
        <MonumentDetail
          monument={selectedMonument}
          onClose={() => setSelectedMonument(null)}
        />
      )}
    </div>
  );
}
