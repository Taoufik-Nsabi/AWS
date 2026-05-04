import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { parseError } from "../../../utils/apiError";
import "../../../styles/admin/AdminUsers.css";

const API_BASE = "http://localhost:8080";

export default function UserAnnonces() {
  const { id } = useParams();
  const [lieux, setLieux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLieux = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE}/api/tourism/lieux/user/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(await parseError(response));
        }

        const data = await response.json();
        setLieux(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchLieux();
  }, [id]);

  return (
    <div className="admin-page-container users-page">
      <div className="admin-page-header">
        <h1 className="admin-title">Annonces de l'utilisateur #{id}</h1>
        <p className="admin-subtitle">Tous les lieux publiés par cet utilisateur.</p>
      </div>

      <div className="users-toolbar users-toolbar-inline">
        <Link to="/admin/users/list" className="users-back-link">
          Retour à la liste des utilisateurs
        </Link>
      </div>

      {error && <div className="users-alert error">{error}</div>}

      <div className="users-card">
        {loading ? (
          <div className="users-empty">Chargement...</div>
        ) : lieux.length === 0 ? (
          <div className="users-empty">Aucune annonce trouvée pour cet utilisateur.</div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Type</th>
                <th>Ville</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {lieux.map((lieu) => (
                <tr key={lieu.id}>
                  <td>{lieu.id}</td>
                  <td>{lieu.nom}</td>
                  <td>{lieu.type}</td>
                  <td>{lieu.villeNom || "—"}</td>
                  <td>{lieu.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
