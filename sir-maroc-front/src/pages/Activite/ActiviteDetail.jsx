import React, { useState, useEffect } from 'react';
import AddAvis from '../../components/AddAvis'; 
import AvisList from '../../components/AvisList'; // Correction : Import manquant
import "../../styles/Activite/ActiviteDetail.css";
import { buildTourismAssetUrl } from "../../config/env";

export default function ActiviteDetail({ activite, onClose }) {
  const [loading, setLoading] = useState(true);
  
  // Correction : État pour rafraîchir la liste dynamiquement
  const [refreshAvis, setRefreshAvis] = useState(0);

  useEffect(() => {
    if (activite) {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 600); 
      return () => clearTimeout(timer);
    }
  }, [activite]);

  if (!activite) return null;

  // Correction : Fonction callback pour l'ajout d'avis
  const handleAvisAdded = () => {
    setRefreshAvis(prev => prev + 1);
  };

  const getImageUrl = () => {
    if (activite.images && activite.images.length > 0) {
      const firstImage = activite.images[0];
      return firstImage.startsWith('http') ? firstImage : buildTourismAssetUrl(firstImage);
    }
    return "/assets/images/activite-default.jpg"; 
  };

  return (
    <div className="activite-detail-overlay-activite" onClick={onClose}>
      <div className="detail-card-modern-activite" onClick={(e) => e.stopPropagation()}>
        
        {loading ? (
          <div className="detail-loader-container-activite">
            <div className="mandala-spinner-activite">
                <div className="inner-diamond-activite"></div>
            </div>
            <p className="gold-loader-text-activite">Préparation de votre expérience...</p>
          </div>
        ) : (
          <div className="detail-content-scroll-activite active-activite">
            <div className="detail-visual-activite">
              <button className="close-btn-modern-activite" onClick={onClose}>&times;</button>
              <img src={getImageUrl()} alt={activite.nom} />
              <div className="category-tag-activite">{activite.categorie}</div>
            </div>

            <div className="detail-header-royal-activite">
              <span className="royal-badge-activite">Expérience Exclusive</span>
            </div>

            <div className="detail-text-info-activite">
              <h2 className="detail-title-activite">{activite.nom}</h2>
              
              <div className="info-grid-activite">
                <div className="location-bar-activite">
                  <i className="fas fa-map-marker-alt"></i> {activite.adresse}
                </div>
                <div className="duration-bar-activite">
                  <i className="fas fa-clock"></i> {activite.duree} min
                </div>
              </div>

              <div className="detail-description-box-activite">
                <h3>À propos</h3>
                <p>{activite.description || "Une immersion unique vous attend."}</p>
                
                <div className="contact-price-zone-activite">
                  <span className="detail-price-activite">
                    {activite.tarif > 0 ? `${activite.tarif} DH` : "Gratuit"}
                  </span>
                </div>
              </div>
            </div>

            {/* Correction : Section Avis unifiée et dynamique */}
            <div className="reviews-section-modern-activite">
              <h4>Témoignages des participants</h4>
              
              {/* Liste qui se recharge via refreshAvis */}
              <AvisList lieuId={activite.id} refreshTrigger={refreshAvis} />
              
              {/* Formulaire avec le message UX amélioré */}
              <AddAvis lieuId={activite.id} onAvisAdded={handleAvisAdded} />
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
