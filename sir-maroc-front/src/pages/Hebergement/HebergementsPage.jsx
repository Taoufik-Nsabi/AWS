import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HebergementDetail from "./HebergementDetail";
import "../../styles/Hebergement/HebergementPage.css";
import { buildApiUrl, buildTourismAssetUrl } from "../../config/env";

// Assets par défaut
import heroImage from "../../assets/images/hotel.jpg";
import riadImage from "../../assets/images/hotel.jpg";
import villaImage from "../../assets/images/hotel.jpg";
import appartementImage from "../../assets/images/Mosquer.jpg";

const GATEWAY_URL = buildApiUrl("/api/tourism/hebergements");

// Liste des villes pour le sélecteur
const VILLES_LISTE = [
  { id: 1, nom: "Marrakech" }, { id: 2, nom: "Fès" }, { id: 3, nom: "Casablanca" },
  { id: 4, nom: "Agadir" }, { id: 5, nom: "Chefchaouen" }, { id: 6, nom: "Rabat" },
  { id: 7, nom: "Tanger" }, { id: 8, nom: "Oujda" }, { id: 9, nom: "Meknès" },
  { id: 11, nom: "Essaouira" }
];

// Types basés sur votre Enum PHP
const TYPES_ENUM = [
  { id: "hotel", nom: "Hôtel" },
  { id: "chambre", nom: "Chambre" },
  { id: "studio", nom: "Studio" },
  { id: "maison", nom: "Maison" },
  { id: "appartement", nom: "Appartement" }
];

export default function HebergementPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedVille, setSelectedVille] = useState("all");
  const [selectedHebergement, setSelectedHebergement] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  
  const [hebergements, setHebergements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. RÉCUPÉRATION DES DONNÉES
  useEffect(() => {
    const fetchHebergements = async () => {
      try {
        setLoading(true);
        const response = await fetch(GATEWAY_URL);
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data = await response.json();
        setHebergements(data);
        setError(null);
      } catch (err) {
        console.error("Erreur chargement:", err);
        setError("Impossible de charger les résidences. Vérifiez la connexion au serveur.");
      } finally {
        setLoading(false);
      }
    };
    fetchHebergements();
  }, []);

  // 3. GESTION DU SCROLL ET ANIMATIONS
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    const reveal = () => {
      const reveals = document.querySelectorAll(".reveal");
      reveals.forEach(el => {
        const windowHeight = window.innerHeight;
        const elementTop = el.getBoundingClientRect().top;
        if (elementTop < windowHeight - 100) el.classList.add("active");
      });
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener("scroll", reveal);
    reveal();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener("scroll", reveal);
    };
  }, [hebergements, loading]); 

  // LOGIQUE DU HERO
  const getHeroImage = () => {
    switch(activeCategory) {
      case 'Riad': return riadImage;
      case 'Villa': return villaImage;
      case 'appartement': return appartementImage;
      default: return heroImage;
    }
  };

  const getHeroTitle = () => {
    switch(activeCategory) {
      case 'Riad': return "Riad Traditionnel";
      case 'Villa': return "Villa de Luxe";
      case 'appartement': return "Appartement Moderne";
      default: return "L'Art de l'Hospitalité";
    }
  };

  // FILTRAGE CROISÉ
  const filtered = hebergements.filter(h => {
    const catMatch = activeCategory === "all" ? true : h.categories === activeCategory;
    const villeMatch = selectedVille === "all" ? true : h.villeId === parseInt(selectedVille);
    return catMatch && villeMatch;
  });

  return (
    <div className="luxury-moroccan">
      {/* SECTION HERO - TOUJOURS VISIBLE */}
      <section className="hero-luxury" id="home">
        <div className="hebergment-hero-backdrop"></div>
        <div className="hero-content-luxury">
          <div className="container-luxury">
            <div className="hero-badge-luxury">
              <span className="badge-line"></span>
              <span className="badge-text">L'EXCELLENCE DE L'HOSPITALITÉ</span>
              <span className="badge-line"></span>
            </div>
            <h1 className="hero-title-luxury">
              <span className="title-french">{getHeroTitle()}</span>
            </h1>
            <div className="hero-ornament">
              <div className="ornament-diamond"></div>
            </div>
            <p className="hero-subtitle-luxury">
              Découvrez une sélection exceptionnelle des plus belles résidences du Royaume.
            </p>
            <div className="hero-cta-group">
              <a href="#hebergements" className="btn-primary-luxury">
                <span>Découvrir</span>
                <i className="fas fa-arrow-down"></i>
              </a>
              <Link to="/hebergements/add" className="btn-add-hebergement">
                <i className="fas fa-plus-circle"></i> Ajouter
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="hebergements-luxury" id="hebergements">
        <div className="container-luxury">
          {error && <div className="error-message">{error}</div>}

          <div className="section-header-luxury">
            <span className="section-subtitle">NOTRE SÉLECTION</span>
            <h2 className="section-title-luxury">Résidences Royales</h2>
            <div className="hero-image-container">
              <div className="hero-circle-frame">
                <div className="hero-circle-border">
                  <img src={getHeroImage()} alt="Hero" className="hero-hebergement-image" />
                </div>
              </div>
            </div>
          </div>

          {/* FILTRES - TOUJOURS VISIBLES */}
          <div className="category-filters-luxury" style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div className="city-select-container" style={{ position: 'relative' }}>
                <select 
                    className="filter-btn-luxury"
                    style={{ appearance: 'none', paddingRight: '40px', cursor: 'pointer' }}
                    value={activeCategory}
                    onChange={(e) => setActiveCategory(e.target.value)}
                >
                    <option value="all">🏠 Tous les types</option>
                    {TYPES_ENUM.map(type => (
                        <option key={type.id} value={type.id}>{type.nom}</option>
                    ))}
                </select>
                <i className="fas fa-chevron-down" style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#d4af37' }}></i>
            </div>

            <div className="city-select-container" style={{ position: 'relative' }}>
                <select 
                    className="filter-btn-luxury"
                    style={{ appearance: 'none', paddingRight: '40px', cursor: 'pointer' }}
                    value={selectedVille}
                    onChange={(e) => setSelectedVille(e.target.value)}
                >
                    <option value="all">📍 Toutes les villes</option>
                    {VILLES_LISTE.map(v => (
                        <option key={v.id} value={v.id}>{v.nom}</option>
                    ))}
                </select>
                <i className="fas fa-chevron-down" style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#d4af37' }}></i>
            </div>
          </div>

          {/* GRILLE DYNAMIQUE - LOADER ICI SEULEMENT */}
          <div className="hebergements-grid-luxury">
            {loading ? (
              /* LOADER DANS LE CORPS DE LA GRILLE */
              <div className="body-loader-container" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0' }}>
                <div className="mandala-spinner">
                   <div className="inner-diamond"></div>
                </div>
                <p className="gold-loader-text" style={{ color: '#d4af37', marginTop: '20px', fontStyle: 'italic' }}>
                  Préparation de votre séjour royal...
                </p>
              </div>
            ) : filtered.length > 0 ? (
              filtered.map(item => (
                <div 
                  className="hebergement-card-luxury reveal" 
                  key={item.id} 
                  onClick={() => setSelectedHebergement(item)}
                >
                  <div className="card-inner">
                    <div className="card-front">
                      <div className="card-image-luxury">
                        <img 
                          src={
                            item.images && item.images.length > 0 
                              ? (item.images[0].startsWith('http') 
                                  ? item.images[0] 
                                  : buildTourismAssetUrl(item.images[0])) 
                              : heroImage
                          } 
                          alt={item.nom} 
                          onError={(e) => { e.target.src = heroImage; }}
                        />
                        <div className="card-price-tag">{item.prix} DH</div>
                      </div>
                      <div className="card-content-luxury">
                        <h3 className="card-name-luxury">{item.nom}</h3>
                        <div className="card-details-luxury">
                          <div className="detail-luxury">
                            <i className="fas fa-map-marker-alt"></i> {item.adresse}
                          </div>
                          <div className="detail-luxury">
                            <i className="fas fa-home"></i> {item.categories || "Hébergement"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card-hover">
                      <div className="hover-content">
                        <h3>Explorer</h3>
                        <button className="btn-hover-luxury">Détails & Avis</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-results" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                Aucun hébergement trouvé pour ces critères.
              </p>
            )}
          </div>
        </div>
      </section>

      {selectedHebergement && (
        <HebergementDetail 
          hebergement={selectedHebergement} 
          onClose={() => setSelectedHebergement(null)} 
        />
      )}
    </div>
  );
}
