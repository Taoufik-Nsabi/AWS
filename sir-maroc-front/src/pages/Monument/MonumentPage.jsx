import { useState, useEffect } from "react";
import MonumentDetail from "./MonumentDetail";
import "../../styles/Monument/MonumentPage.css";

// Assets par défaut
import heroImageDefault from "../../assets/images/palaisbahia.jpg";

// 1. CONFIGURATION DU BACKEND
const API_BASE_URL = "http://localhost:8081"; 
const GATEWAY_URL = "http://localhost:8080/api/tourism/monuments"; // Ton point d'accès Gateway

// Liste des villes (Identique aux autres pages pour la cohérence)
const VILLES_LISTE = [
  { id: 1, nom: "Marrakech" }, { id: 2, nom: "Fès" }, { id: 3, nom: "Casablanca" },
  { id: 4, nom: "Agadir" }, { id: 5, nom: "Chefchaouen" }, { id: 6, nom: "Rabat" },
  { id: 7, nom: "Tanger" }, { id: 8, nom: "Oujda" }, { id: 9, nom: "Meknès" },
  { id: 11, nom: "Essaouira" }
];

export default function MonumentPage() {
  const [selectedVille, setSelectedVille] = useState("all");
  const [selectedMonument, setSelectedMonument] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  
  const [monuments, setMonuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. RÉCUPÉRATION DES DONNÉES DEPUIS L'API
  useEffect(() => {
    const fetchMonuments = async () => {
      try {
        setLoading(true);
        const response = await fetch(GATEWAY_URL);
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data = await response.json();
        setMonuments(data);
        setError(null);
      } catch (err) {
        console.error("Erreur chargement monuments:", err);
        setError("Impossible de charger les monuments historiques.");
      } finally {
        setLoading(false);
      }
    };
    fetchMonuments();
  }, []);

  // 3. ANIMATIONS AU SCROLL
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
  }, [monuments, loading]);

  // FILTRAGE PAR VILLE UNIQUEMENT
  const filtered = monuments.filter(m => {
    return selectedVille === "all" ? true : (m.villeId === parseInt(selectedVille));
  });

  return (
    <div className="luxury-moroccan">
      {/* SECTION HERO */}
      <section className="hero-luxury" >
        <div className="hero-backdrop-monument"></div>
        <div className="hero-content-luxury">
          <div className="container-luxury">
            <div className="hero-badge-luxury">
              <span className="badge-line"></span>
              <span className="badge-text">PATRIMOINE NATIONAL</span>
              <span className="badge-line"></span>
            </div>
            <h1 className="hero-title-luxury">
              <span className="title-french">Trésors du Temps</span>
            </h1>
            <div className="hero-ornament">
              <div className="ornament-diamond"></div>
            </div>
            <p className="hero-subtitle-luxury">
              Explorez les joyaux architecturaux et l'histoire millénaire du Royaume.
            </p>
            <div className="hero-cta-group">
              <a href="#monuments" className="btn-primary-luxury">
                <span>Explorer</span>
                <i className="fas fa-arrow-down"></i>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="restaurants-luxury" id="monuments">
        <div className="bg-marocain"></div>
        <div className="restaurant-zellij-overlay"></div>
        
        <div className="container-luxury">
          {error && <div className="error-message">{error}</div>}

          <div className="section-header-luxury">
            <span className="section-subtitle">DÉCOUVREZ</span>
            <h2 className="section-title-luxury">Monuments Historiques</h2>
            
            <div className="hero-image-container">
              <div className="hero-circle-frame">
                <div className="hero-circle-border">
                  <img src={heroImageDefault} alt="Patrimoine" className="hero-restaurant-image" />
                </div>
              </div>
            </div> 
          </div>

          {/* FILTRE PAR VILLE */}
          <div className="category-filters-luxury" style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
            <div className="city-select-container" style={{ position: 'relative', width: '300px' }}>
                <select 
                  className="filter-btn-luxury"
                  style={{ appearance: 'none', paddingRight: '40px', cursor: 'pointer', width: '100%' }}
                  value={selectedVille}
                  onChange={(e) => setSelectedVille(e.target.value)}
                >
                  <option value="all">📍 Toutes les villes du Maroc</option>
                  {VILLES_LISTE.map(v => (
                    <option key={v.id} value={v.id}>{v.nom}</option>
                  ))}
                </select>
                <i className="fas fa-map-marked-alt" style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#d4af37' }}></i>
            </div>
          </div>

          <div className="restaurants-grid-luxury">
            {loading ? (
              <div className="body-loader-container" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0' }}>
                <div className="mandala-spinner"><div className="inner-diamond"></div></div>
                <p className="gold-loader-text">Ouverture des portes de l'histoire...</p>
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((monument) => (
                <div 
                  className="restaurant-card-luxury reveal" 
                  key={monument.id}
                  onClick={() => setSelectedMonument(monument)}
                >
                  <div className="card-inner">
                    <div className="card-front">
                      <div className="card-image-luxury">
                        <img 
                          src={monument.image && monument.image.startsWith('http') 
                            ? monument.image 
                            : `${API_BASE_URL}/${monument.image}`} 
                          alt={monument.nom}
                          onError={(e) => { e.target.src = heroImageDefault; }}
                        />
                        <div className="card-price-tag">
                          {monument.prix > 0 ? `${monument.prix} MAD` : "Gratuit"}
                        </div>
                      </div>
                      <div className="card-content-luxury">
                        <h3 className="card-name-luxury">{monument.nom}</h3>
                        <div className="card-details-luxury">
                          <div className="detail-luxury">
                            <i className="fas fa-map-marker-alt"></i> 
                            <span>{monument.adresse}</span>
                          </div>
                          <div className="detail-luxury">
                            <i className="fas fa-landmark"></i> 
                            <span>{monument.categorie || "Patrimoine Historique"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card-hover">
                      <div className="hover-content">
                        <h3>L'Histoire vous attend</h3>
                        <button className="btn-hover-luxury">Voir les Détails</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-results" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: '#d4af37' }}>
                Aucun monument répertorié dans cette ville pour le moment.
              </p>
            )}
          </div>
        </div>
      </section>

      {selectedMonument && (
        <MonumentDetail 
          monument={selectedMonument} 
          onClose={() => setSelectedMonument(null)} 
        />
      )}
    </div>
  );
}
