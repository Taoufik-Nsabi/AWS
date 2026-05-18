import React from "react";
import "../../styles/Monument/MonumentDetail.css";
import { buildTourismAssetUrl } from "../../config/env";

export default function MonumentDetail({ monument, onClose }) {
  if (!monument) return null;

  const imageUrl = monument.image && monument.image.startsWith("http")
    ? monument.image
    : buildTourismAssetUrl(monument.image);

  return (
    <div className="hebergement-detail-overlay" onClick={onClose}>
      <div className="detail-card-modern" onClick={(e) => e.stopPropagation()}>
        <div className="detail-content-scroll">
          <div className="detail-visual">
            <button className="close-btn-modern" onClick={onClose}>&times;</button>
            <img
              src={imageUrl}
              alt={monument.nom}
              onError={(e) => { e.target.src = "/assets/images/default-monument.jpg"; }}
            />
            <div className="detail-price-badge">
              {monument.prix > 0 ? `${monument.prix} MAD` : "Entree Libre"}
            </div>
          </div>

          <div className="detail-text-info">
            <h2 className="detail-title">{monument.nom}</h2>
            <p className="location-bar">
              <i className="fas fa-map-marker-alt"></i> {monument.adresse}
            </p>

            <div className="detail-info-grid">
              <div className="info-item">
                <i className="fas fa-landmark"></i>
                <span>{monument.categorie || "Patrimoine Historique"}</span>
              </div>
              {monument.villeNom && (
                <div className="info-item">
                  <i className="fas fa-city"></i>
                  <span>{monument.villeNom}</span>
                </div>
              )}
              {monument.horaires && (
                <div className="info-item">
                  <i className="fas fa-clock"></i>
                  <span>{monument.horaires}</span>
                </div>
              )}
            </div>

            <div className="detail-description-box">
              <h4 className="box-title">A propos de ce monument</h4>
              <p>{monument.description || "Aucune description disponible pour ce monument historique."}</p>
            </div>

            {monument.histoire && (
              <div className="detail-description-box">
                <h4 className="box-title">Histoire</h4>
                <p>{monument.histoire}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
