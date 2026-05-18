import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/Profile/LieuDetails.css";
import { buildApiUrl, buildTourismAssetUrl } from "../../config/env";

export default function LieuDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lieu, setLieu] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLieu = async () => {
      setLoading(true);

      try {
        const token = localStorage.getItem("token");

        const res = await fetch(buildApiUrl(`/api/tourism/lieux/${id}`), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Erreur API détail lieu");

        const data = await res.json();
        setLieu(data);
      } catch (error) {
        console.error("Erreur fetch detail:", error);
        setLieu(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLieu();
  }, [id]);

  
  const getImageUrl = (img) => {
    if (!img) return "/default.jpg";

    if (img.startsWith("http")) return img;

    return buildTourismAssetUrl(img);
  };


  if (loading)
    return (
      <div className="body-loader-container" style={{ textAlign: "center", padding: "100px 0" }}>
        <div className="mandala-spinner">
          <div className="inner-diamond"></div>
        </div>
        <p className="gold-loader-text">Chargement du lieu...</p>
      </div>
    );

  if (!lieu) return <div>Lieu introuvable.</div>;

  return (
    <div className="profile-auth-wrapper">
      <div className="details-container">

        {/* HERO */}
        <div className="details-hero">
          <img
            src={getImageUrl(lieu.images?.[0])}
            alt={lieu.nom}
            className="hero-img"
          />

        <button className="back-btn-luxury" onClick={() => navigate(-1)}>
        <i className="fas fa-arrow-left"></i>
        </button>

          <div className="hero-overlay">
            <span className="details-badge">{lieu.type}</span>
            <h1>{lieu.nom}</h1>
            <p>
              <i className="fas fa-map-marker-alt"></i>{" "}
              {lieu.adresse} {lieu.villeNom && `, ${lieu.villeNom}`}
            </p>
          </div>
        </div>

        <div className="details-content-grid">

          {/* LEFT */}
          <div className="details-main">

            {lieu.description && (
              <section className="info-section">
                <h2>À propos</h2>
                <p className="description-text">{lieu.description}</p>
              </section>
            )}

            {/* GALERIE (même logique hébergement) */}
            {lieu.images?.length > 0 && (
              <section className="info-section">
                <h2>Galerie Photos</h2>
                <div className="details-gallery">
                  {lieu.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={getImageUrl(img)}
                      alt={`img-${idx}`}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT */}
          <div className="details-sidebar">
            <div className="sticky-card">
              <h3>Informations</h3>

              {lieu.categorie && (
                <div className="info-item">
                  <i className="fas fa-tag"></i>
                  <div>
                    <strong>Catégorie</strong>
                    <span>{lieu.categorie}</span>
                  </div>
                </div>
              )}

              {(lieu.prix || lieu.prixMoyen) && (
                <div className="info-item">
                  <i className="fas fa-wallet"></i>
                  <div>
                    <strong>Prix</strong>
                    <span>{lieu.prix ?? lieu.prixMoyen} DH</span>
                  </div>
                </div>
              )}

              {lieu.duree && (
                <div className="info-item">
                  <i className="fas fa-clock"></i>
                  <div>
                    <strong>Durée</strong>
                    <span>{lieu.duree} min</span>
                  </div>
                </div>
              )}

              {lieu.telephone && (
                <div className="info-item">
                  <i className="fas fa-phone"></i>
                  <div>
                    <strong>Contact</strong>
                    <span>{lieu.telephone}</span>
                  </div>
                </div>
              )}

              {lieu.reseauSociaux && (
                <div className="sidebar-actions">
                  <a
                    href={lieu.reseauSociaux}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-social-full"
                  >
                    Voir sur les réseaux <i className="fab fa-instagram"></i>
                  </a>
                </div>
              )}

              <div className="sidebar-actions">
                <button
                  className="btn-edit-full"
                  onClick={() => navigate(`/LieuUpdate/${lieu.id}`)}
                >
                  Modifier
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
