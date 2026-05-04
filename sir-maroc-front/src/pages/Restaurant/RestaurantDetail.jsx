import React, { useState, useEffect } from 'react';
import AddAvis from '../../components/AddAvis';
import AvisList from '../../components/AvisList';
import "../../styles/Restaurant/RestaurantDetail.css";

// Configuration pour les images stockées sur le serveur
const API_BASE_URL = "http://localhost:8081";

export default function RestaurantDetail({ restaurant, onClose }) {
  const [loading, setLoading] = useState(true);
  
  // CORRECTION : État pour synchroniser la liste des avis
  const [refreshAvis, setRefreshAvis] = useState(0);

  // Effet de chargement pour l'élégance de l'UI
  useEffect(() => {
    if (restaurant) {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 800);
      return () => clearTimeout(timer);
    }
  }, [restaurant]);

  if (!restaurant) return null;

  // CORRECTION : Fonction pour déclencher le rafraîchissement
  const handleAvisAdded = () => {
    setRefreshAvis(prev => prev + 1);
  };

  // Reconstruction de l'URL de l'image
  const getImageUrl = () => {
    if (restaurant.image) {
      return restaurant.image.startsWith('http') 
        ? restaurant.image 
        : `${API_BASE_URL}/${restaurant.image}`;
    }
    return "/assets/images/default-restaurant.jpg"; 
  };

  return (
    <div className="restaurant-detail-overlay" onClick={onClose}>
      <div className="detail-card-restaurant" onClick={(e) => e.stopPropagation()}>
        
        {loading ? (
          <div className="detail-loader-container">
            <div className="mandala-spinner">
               <div className="inner-diamond"></div>
            </div>
            <p className="gold-loader-text">Dressage de votre table d'exception...</p>
          </div>
        ) : (
          <div className="detail-content-scroll reveal active">
            <div className="detail-visual">
              <button className="close-btn-restaurant" onClick={onClose}>&times;</button>
              <img src={getImageUrl()} alt={restaurant.name} />
              {restaurant.michelin && (
                <div className="michelin-badge-detail">
                  <i className="fas fa-star"></i>
                  <span>MICHELIN</span>
                </div>
              )}
            </div>

            <div className="detail-header-royal">
              <span className="royal-badge">GASTRONOMIE D'EXCEPTION</span>
            </div>

            <div className="detail-text-info">
              <h2 className="detail-title">{restaurant.name}</h2>
              <div className="location-bar">
                <i className="fas fa-map-marker-alt"></i> {restaurant.location || restaurant.adresse}
              </div>

              <div className="detail-rating">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className={`fas fa-star ${i < (restaurant.rating || 5) ? 'active' : ''}`}></i>
                ))}
                <span className="rating-text">{restaurant.rating || 5}.0 / 5</span>
              </div>

              <div className="detail-description-box">
                <h3>L'Âme du Chef</h3>
                <p>{restaurant.description || "Une expérience culinaire unique au cœur du Royaume."}</p>
                
                <div className="info-grid-luxury">
                  <div className="info-item">
                    <i className="fas fa-user-tie"></i>
                    <span><strong>Chef :</strong> {restaurant.chef || "Non renseigné"}</span>
                  </div>

                  <div className="info-item">
                    <i className="fas fa-utensils"></i>
                    <span><strong>Spécialité :</strong> {restaurant.speciality || "Cuisine du Marché"}</span>
                  </div>

                  <div className="info-item">
                    <i className="fas fa-clock"></i>
                    <span><strong>Horaires :</strong> {restaurant.hours || "12h00 - 23h00"}</span>
                  </div>
                </div>

                <div className="contact-price-zone">
                  <span className="detail-price">
                    <i className="fas fa-tag"></i> {restaurant.price || "---"} DH / personne
                  </span>
                  
                  <span className="detail-phone">
                    <i className="fas fa-phone-alt"></i> {restaurant.telephone || "Contact non disponible"}
                  </span>
                  
                  {restaurant.reseauSociaux && (
                    <a href={restaurant.reseauSociaux} target="_blank" rel="noopener noreferrer" className="detail-website">
                      <i className="fas fa-globe"></i> Site officiel
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* CORRECTION : Section des avis unifiée */}
            <div className="reviews-section-restaurant">
              <h4>Avis des Gourmets</h4>
              
              {/* Liste dynamique qui récupère les emails et les nouveaux avis */}
              <AvisList lieuId={restaurant.id} refreshTrigger={refreshAvis} />
              
              {/* Formulaire d'ajout d'avis */}
              <AddAvis lieuId={restaurant.id} onAvisAdded={handleAvisAdded} />
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}