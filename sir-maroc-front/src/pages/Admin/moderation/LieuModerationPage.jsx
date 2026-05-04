import React, { useEffect, useMemo, useState } from "react";
import LieuTable from "../../../components/admin/TableHebergements";
import { fetchAdminLieux, updateLieuStatus } from "../../../utils/adminModerationApi";
import "../../../styles/admin/AdminUsers.css";

const STATUS_LABELS = {
  en_attente: "En attente",
  approuve: "Approuves",
  rejete: "Refuses",
};

export default function LieuModerationPage({
  type,
  title,
  status,
  subtitle,
  detailsPath = null,
  editPath = null,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchAdminLieux(type, status);
        if (!cancelled) {
          setItems(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Erreur de chargement");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [type, status]);

  const emptyMessage = useMemo(() => {
    const label = STATUS_LABELS[status] || "Cette categorie";
    return `Aucun element dans ${label.toLowerCase()}.`;
  }, [status]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateLieuStatus(type, id, newStatus);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message || "Erreur lors de la mise a jour du statut");
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h1 className="admin-title">
          {title} <span className={`status-pill ${status}`}>{STATUS_LABELS[status] || status}</span>
        </h1>
        <p className="admin-subtitle">{subtitle}</p>
      </div>

      {error && <div className="users-alert error">{error}</div>}

      {loading ? (
        <div className="admin-loader">Chargement...</div>
      ) : (
        <LieuTable
          data={items}
          status={status}
          type={type}
          detailsPath={detailsPath}
          editPath={editPath}
          onUpdateStatus={handleStatusChange}
          emptyMessage={emptyMessage}
        />
      )}
    </div>
  );
}
