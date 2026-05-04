import React from "react";
import { Link } from "react-router-dom";
import "../../styles/admin/Lieutable.css";

export default function TableHebergements({
  data,
  status,
  onUpdateStatus,
  emptyMessage = "Aucun element disponible dans cette categorie.",
  detailsPath = null,
  editPath = null,
}) {
  return (
    <div className="admin-table-container">
      <div className="table-actions-header">
        <Link to="/admin" className="back-link-luxury">
          <i className="fas fa-arrow-left"></i> Retour au Tableau de Bord
        </Link>
      </div>

      <table className="luxury-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Type</th>
            <th>Ville</th>
            <th>Contact</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.length > 0 ? (
            data.map((item) => (
              <tr key={item.id}>
                <td>#{item.id}</td>
                <td className="bold-name">{item.nom}</td>
                <td>{item.type || "-"}</td>
                <td>
                  <span className="city-tag">
                    <i className="fas fa-map-marker-alt"></i>{" "}
                    {item.villeNom || item.ville?.nom || "Non definie"}
                  </span>
                </td>
                <td>{item.telephone || "N/A"}</td>

                <td className="actions-cell">
                  {detailsPath ? (
                    <Link to={`${detailsPath}/${item.id}`} className="btn-text-action view">
                      Details
                    </Link>
                  ) : null}

                  {editPath ? (
                    <Link to={`${editPath}/${item.id}`} className="btn-text-action edit">
                      Modifier
                    </Link>
                  ) : null}

                  {status === "en_attente" && onUpdateStatus ? (
                    <div className="status-actions">
                      <button
                        className="btn-action approve"
                        onClick={() => onUpdateStatus(item.id, "approuve")}
                        title="Approuver"
                      >
                        <i className="fas fa-check"></i>
                      </button>

                      <button
                        className="btn-action reject"
                        onClick={() => onUpdateStatus(item.id, "rejete")}
                        title="Refuser"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ) : null}

                  {status === "approuve" && onUpdateStatus ? (
                    <div className="status-actions">
                      <button
                        className="btn-action reject"
                        onClick={() => onUpdateStatus(item.id, "rejete")}
                        title="Refuser"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ) : null}

                  {status === "rejete" && onUpdateStatus ? (
                    <div className="status-actions">
                      <button
                        className="btn-action view"
                        onClick={() => onUpdateStatus(item.id, "en_attente")}
                        title="Remettre en attente"
                      >
                        <i className="fas fa-rotate-left"></i>
                      </button>
                      <button
                        className="btn-action approve"
                        onClick={() => onUpdateStatus(item.id, "approuve")}
                        title="Approuver"
                      >
                        <i className="fas fa-check"></i>
                      </button>
                    </div>
                  ) : null}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="empty-table-msg">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
