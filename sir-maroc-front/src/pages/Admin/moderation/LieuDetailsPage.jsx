import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchLieuById, updateLieuStatus } from "../../../utils/adminModerationApi";
import "../../../styles/admin/AdminDetails.css";
import { buildTourismAssetUrl } from "../../../config/env";

const STATUS_LABELS = {
  en_attente: "En attente",
  approuve: "Approuve",
  rejete: "Refuse",
};

const STATUS_ROUTES = {
  en_attente: "pending",
  approuve: "approved",
  rejete: "rejected",
};

function formatPrice(item) {
  if (item.prix) return `${item.prix} DH / nuit`;
  if (item.prixMoyen) return `${item.prixMoyen} DH / moyenne`;
  if (item.tarif) return `${item.tarif} DH`;
  return null;
}

function getBadges(item) {
  if (Array.isArray(item.services) && item.services.length) return item.services;
  if (Array.isArray(item.categories) && item.categories.length) return item.categories;
  if (typeof item.categories === "string" && item.categories.trim()) {
    return item.categories.split(",").map((value) => value.trim()).filter(Boolean);
  }
  if (typeof item.categorie === "string" && item.categorie.trim()) {
    return item.categorie.split(",").map((value) => value.trim()).filter(Boolean);
  }
  return [];
}

function normalizeImageUrl(image) {
  const rawValue = typeof image === "string" ? image : image?.url || image?.path || image?.nomFichier || "";

  if (!rawValue) {
    return "";
  }

  if (/^https?:\/\//i.test(rawValue)) {
    return rawValue;
  }

  return buildTourismAssetUrl(rawValue);
}

export default function LieuDetailsPage({ type, title, editPath = null }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchLieuById(type, id);
        if (!cancelled) {
          setItem(data);
          setImageError(false);
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
  }, [id, type]);

  const statusLabel = STATUS_LABELS[item?.status] || "Inconnu";
  const originalImageUrl = normalizeImageUrl(item?.images?.[0]);
  const hasImageReference = Boolean(originalImageUrl);
  const primaryImage =
    (!imageError && originalImageUrl) ||
    "https://placehold.co/1200x700/f5f1ea/3d0a0c?text=Sir+Maroc";
  const badges = useMemo(() => getBadges(item || {}), [item]);
  const priceLabel = useMemo(() => formatPrice(item || {}), [item]);

  const handleStatusChange = async (newStatus) => {
    try {
      setSubmitting(true);
      setError("");
      await updateLieuStatus(type, id, newStatus);
      setItem((prev) => ({ ...prev, status: newStatus }));
      navigate(`/admin/${type}/${STATUS_ROUTES[newStatus]}`);
    } catch (err) {
      setError(err.message || "Erreur lors de la mise a jour du statut");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="admin-loader">Chargement...</div>;
  }

  if (!item) {
    return <div className="users-alert error">Element introuvable.</div>;
  }

  return (
    <div className="admin-page-content">
      <div className="admin-top-nav">
        <div className="breadcrumb">
          <span onClick={() => navigate("/admin")}>Admin</span>
          <i className="fas fa-chevron-right"></i>
          <span onClick={() => navigate(-1)}>{title}</span>
          <i className="fas fa-chevron-right"></i>
          <span className="current">Details #{id}</span>
        </div>

        <button className="btn-close-details" onClick={() => navigate(-1)} title="Fermer">
          <i className="fas fa-times"></i>
        </button>
      </div>

      {error && <div className="users-alert error">{error}</div>}

      <div className="details-grid">
        <div className="details-main">
          <div className="details-card gallery-card">
            <img
              src={primaryImage}
              alt={item.nom}
              className="main-image"
              onError={() => setImageError(true)}
            />
            {imageError && hasImageReference ? (
              <p className="image-warning">
                L'image referencee existe en base, mais le fichier est introuvable sur le serveur.
              </p>
            ) : null}
            {!hasImageReference ? (
              <p className="image-warning">Aucune image n'est enregistree pour cette annonce.</p>
            ) : null}
          </div>

          <div className="details-card info-card">
            <h3>
              <i className="fas fa-info-circle"></i> Description
            </h3>
            <p>{item.description || "Aucune description disponible."}</p>
          </div>
        </div>

        <div className="details-sidebar">
          <div className="details-card summary-card">
            <h1 className="luxury-title">{item.nom}</h1>
            <p className="type-tag">{item.type || title}</p>
            <span className={`status-badge-large ${item.status || "unknown"}`}>{statusLabel}</span>

            <div className="contact-info">
              <p>
                <i className="fas fa-map-marker-alt"></i> {item.adresse || "Adresse non definie"}
                {item.villeNom ? `, ${item.villeNom}` : ""}
              </p>
              {item.telephone ? (
                <p>
                  <i className="fas fa-phone"></i> {item.telephone}
                </p>
              ) : null}
              {item.email ? (
                <p>
                  <i className="fas fa-envelope"></i> {item.email}
                </p>
              ) : null}
              {priceLabel ? (
                <p className="price-tag">
                  <i className="fas fa-tag"></i> {priceLabel}
                </p>
              ) : null}
            </div>
          </div>

          {badges.length ? (
            <div className="details-card services-card">
              <h3>Services</h3>
              <div className="services-list">
                {badges.map((value, index) => (
                  <span key={`${value}-${index}`} className="service-pill">
                    {value}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="action-buttons-vertical">
            {item.status === "en_attente" ? (
              <>
                <button
                  className="btn-huge approve"
                  disabled={submitting}
                  onClick={() => handleStatusChange("approuve")}
                >
                  <i className="fas fa-check"></i> Approuver la demande
                </button>
                <button
                  className="btn-huge reject"
                  disabled={submitting}
                  onClick={() => handleStatusChange("rejete")}
                >
                  <i className="fas fa-times"></i> Rejeter le dossier
                </button>
              </>
            ) : null}

            {item.status === "approuve" ? (
              <button
                className="btn-huge reject"
                disabled={submitting}
                onClick={() => handleStatusChange("rejete")}
              >
                <i className="fas fa-times"></i> Deplacer vers Refuses
              </button>
            ) : null}

            {item.status === "rejete" ? (
              <>
                <button
                  className="btn-huge pending"
                  disabled={submitting}
                  onClick={() => handleStatusChange("en_attente")}
                >
                  <i className="fas fa-rotate-left"></i> Remettre en attente
                </button>
                <button
                  className="btn-huge approve"
                  disabled={submitting}
                  onClick={() => handleStatusChange("approuve")}
                >
                  <i className="fas fa-check"></i> Approuver maintenant
                </button>
              </>
            ) : null}

            {editPath ? (
              <button className="btn-huge edit" onClick={() => navigate(`${editPath}/${id}`)}>
                <i className="fas fa-edit"></i> Modifier les infos
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
