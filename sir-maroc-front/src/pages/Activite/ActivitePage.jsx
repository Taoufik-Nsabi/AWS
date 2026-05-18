import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// 1. IMPORTATION DU COMPOSANT DE DÉTAIL
import ActiviteDetail from "./ActiviteDetail"; 
import "../../styles/Activite/ActivitePage.css";
import { buildApiUrl, buildTourismAssetUrl } from "../../config/env";

import heroActivite from "../../assets/images/sports-tools.jpg"; 

const GATEWAY_URL = buildApiUrl("/api/tourism/activites");

const VILLES_LISTE = [
  { id: 1, nom: "Marrakech" }, { id: 2, nom: "Fès" }, { id: 3, nom: "Casablanca" },
  { id: 4, nom: "Agadir" }, { id: 5, nom: "Chefchaouen" }, { id: 6, nom: "Rabat" },
  { id: 7, nom: "Tanger" }, { id: 8, nom: "Oujda" }, { id: 9, nom: "Meknès" },
  { id: 11, nom: "Essaouira" }
];

const CATEGORIES_ACTIVITE = [
  { id: "sport", nom: "Sport", icon: "fa-running" },
  { id: "culture", nom: "Culture", icon: "fa-university" },
  { id: "aventure", nom: "Aventure", icon: "fa-compass" },
  { id: "detente", nom: "Détente", icon: "fa-spa" },
  { id: "gastronomie", nom: "Gastronomie", icon: "fa-utensils" },
  { id: "decouverte", nom: "Découverte", icon: "fa-binoculars" }
];

export default function ActivitePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedVille, setSelectedVille] = useState("all");
  // 2. ÉTAT POUR L'ACTIVITÉ SÉLECTIONNÉE
  const [selectedActivite, setSelectedActivite] = useState(null); 
  const [activites, setActivites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivites = async () => {
      try {
        setLoading(true);
        const response = await fetch(GATEWAY_URL);
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data = await response.json();
        setActivites(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Impossible de charger les activités.");
      } finally {
        setLoading(false);
      }
    };
    fetchActivites();
  }, []);

  const filtered = activites.filter(a => {
    const catMatch = activeCategory === "all" || a.categorie === activeCategory;
    const villeMatch = selectedVille === "all" || Number(a.villeId) === Number(selectedVille);
    return catMatch && villeMatch;
  });

  return (
    <div className="luxury-moroccan-activite activite-theme-activite">
      {/* HERO SECTION */}
      <section className="hero-luxury-activite">
        <div className="hebergment-hero-backdrop-activite"></div>
        <div className="hero-content-luxury-activite">
          <div className="container-luxury-activite">
            <div className="hero-badge-luxury-activite">
              <span className="badge-line-activite"></span>
              <span className="badge-text-activite">EXPÉRIENCES IMMERSIVES</span>
              <span className="badge-line-activite"></span>
            </div>
            <h1 className="hero-title-luxury-activite">
              <span className="title-french-activite">Aventures Marocaines</span>
            </h1>
            <div className="hero-ornament-activite">
              <div className="ornament-diamond-activite"></div>
            </div>
            <p className="hero-subtitle-luxury-activite">
              Explorez le Royaume à travers des activités uniques, du sport à la gastronomie.
            </p>
            <div className="hero-cta-group-activite">
               <Link to="/activites/add" className="btn-add-hebergement-activite">
                <i className="fas fa-plus-circle"></i> Proposer une activité
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FILTRES & GRILLE */}
      <section className="hebergements-luxury-activite">
        <div className="container-luxury-activite">
          <div className="section-header-luxury-activite">
            <span className="section-subtitle-activite">VIVEZ L'INSTANT</span>
            <h2 className="section-title-luxury-activite">Activités & Loisirs</h2>
            <div className="hero-ornament-activite"><div className="ornament-diamond-activite"></div></div>
          </div>

          <div className="category-filters-luxury-activite" style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
            {/* Sélecteurs Catégorie et Ville */}
            <div className="city-select-container-activite">
                <select className="filter-btn-luxury-activite" value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)}>
                    <option value="all">🎯 Toutes les catégories</option>
                    {CATEGORIES_ACTIVITE.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nom}</option>
                    ))}
                </select>
            </div>
            <div className="city-select-container-activite">
                <select className="filter-btn-luxury-activite" value={selectedVille} onChange={(e) => setSelectedVille(e.target.value)}>
                    <option value="all">📍 Toutes les villes</option>
                    {VILLES_LISTE.map(v => (
                        <option key={v.id} value={v.id}>{v.nom}</option>
                    ))}
                </select>
            </div>
          </div>

          <div className="hebergements-grid-luxury-activite">
            {loading ? (
              <div className="body-loader-container-activite" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0' }}>
                <div className="mandala-spinner-activite"><div className="inner-diamond-activite"></div></div>
                <p className="gold-loader-text-activite" style={{ marginTop: '20px' }}>Chargement des expériences...</p>
              </div>
            ) : filtered.length > 0 ? (
              filtered.map(item => (
                // 3. AJOUT DU ONCLICK SUR LA CARTE
                <div 
                  className="hebergement-card-luxury-activite reveal active" 
                  key={item.id}
                  onClick={() => setSelectedActivite(item)} 
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-inner-activite">
                    <div className="card-front-activite">
                      <div className="card-image-luxury-activite">
                        <img 
                          src={item.images && item.images.length > 0 ? buildTourismAssetUrl(item.images[0]) : heroActivite} 
                          alt={item.nom} 
                          onError={(e) => { e.target.src = heroActivite; }}
                        />
                        <div className="card-price-tag-activite">{item.tarif} DH</div>
                        <div className="activite-duration-badge-activite">
                            <i className="far fa-clock"></i> {item.duree} min
                        </div>
                      </div>
                      <div className="card-content-luxury-activite">
                        <span className="activite-cat-label-activite">
                          {CATEGORIES_ACTIVITE.find(c => c.id === item.categorie)?.nom || "Découverte"}
                        </span>
                        <h3 className="card-name-luxury-activite">{item.nom}</h3>
                        <div className="card-details-luxury-activite">
                          <div className="detail-luxury-activite">
                            <i className="fas fa-map-marker-alt"></i> {item.adresse}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card-hover-activite">
                      <div className="hover-content-activite">
                        <i className={`fas ${CATEGORIES_ACTIVITE.find(c => c.id === item.categorie)?.icon || 'fa-star'} fa-3x mb-3`} style={{color: '#d4af37'}}></i>
                        <button className="btn-hover-luxury-activite">Voir les détails</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-results-activite" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>Aucune activité trouvée.</p>
            )}
          </div>
        </div>
      </section>

      {/* 4. AFFICHAGE CONDITIONNEL DE LA MODALE DE DÉTAIL */}
      {selectedActivite && (
        <ActiviteDetail 
          activite={selectedActivite} 
          onClose={() => setSelectedActivite(null)} 
        />
      )}
    </div>
  );
}
