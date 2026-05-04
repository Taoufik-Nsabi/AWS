import React, { useState, useEffect } from 'react';
import AddAvis from '../../components/AddAvis'; 
import AvisList from '../../components/AvisList';
import "../../styles/Hebergement/HebergementDetail.css";

// Configuration du backend pour les images
const API_BASE_URL = "http://localhost:8081";

export default function HebergementDetail({ hebergement, onClose }) {
  const [loading, setLoading] = useState(true);
  const [refreshAvis, setRefreshAvis] = useState(0); // État pour rafraîchir AvisList

  // Simulation d'un petit temps de chargement pour l'élégance
  useEffect(() => {
    if (hebergement) {
      const timer = setTimeout(() => setLoading(false), 800); 
      return () => clearTimeout(timer);
    }
  }, [hebergement]);

  // Fonction pour déclencher le rafraîchissement des avis
  const handleAvisAdded = () => {
    setRefreshAvis(prev => prev + 1);
  };

  if (!hebergement) return null;

  // Gestion de l'URL de l'image
  const getImageUrl = () => {
    if (hebergement.images && hebergement.images.length > 0) {
      const firstImage = hebergement.images[0];
      return firstImage.startsWith('http') ? firstImage : `${API_BASE_URL}/${firstImage}`;
    }
    return "/assets/images/hotel.jpg"; 
  };

  return (
    <div className="hebergement-detail-overlay" onClick={onClose}>
      <div className="detail-card-modern" onClick={(e) => e.stopPropagation()}>
        
        {loading ? (
          <div className="detail-loader-container">
            <div className="mandala-spinner">
               <div className="inner-diamond"></div>
            </div>
            <p>Ouverture de la suite royale...</p>
          </div>
        ) : (
          <div className="detail-content-scroll reveal active">
            <div className="detail-visual">
              <button className="close-btn-modern" onClick={onClose}>&times;</button>
              <img src={getImageUrl()} alt={hebergement.nom} />
            </div>

            <div className="detail-header-royal">
              <span className="royal-badge">Évasion Marocaine Privée</span>
            </div>

            <div className="detail-text-info">
              <h2 className="detail-title">{hebergement.nom}</h2>
              <div className="location-bar">
                <i className="fas fa-map-marker-alt"></i> {hebergement.adresse}
              </div>

              <div className="detail-description-box">
                <h3>L'âme de votre séjour</h3>
                <p>{hebergement.description || "Aucune description disponible."}</p>
                
                <div className="contact-price-zone">
                  <span className="detail-price">{hebergement.prix} DH / Nuit</span>
                  <span className="detail-phone">
                    <i className="fas fa-phone-alt"></i> {hebergement.telephone || "Non communiqué"}
                  </span>
                  
                  {hebergement.reseauSociaux && (
                    <a href={hebergement.reseauSociaux} target="_blank" rel="noopener noreferrer" className="detail-website">
                      <i className="fas fa-globe"></i> Site Officiel
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION DES AVIS DYNAMIQUE */}
            <div className="reviews-section-modern">
              <h4>Témoignages de nos voyageurs</h4>
              
              {/* On utilise AvisList pour charger les avis depuis l'API */}
              <AvisList lieuId={hebergement.id} refreshTrigger={refreshAvis} />
              
              {/* Formulaire pour ajouter un avis */}
              <div className="add-avis-container" style={{ marginTop: '30px' }}>
                <AddAvis lieuId={hebergement.id} onAvisAdded={handleAvisAdded} />
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}