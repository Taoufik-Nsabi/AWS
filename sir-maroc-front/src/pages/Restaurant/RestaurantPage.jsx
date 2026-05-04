import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import RestaurantDetail from "./RestaurantDetail";
import "../../styles/Restaurant/RestaurantPage.css";

// Assets par défaut
import heroImage from "../../assets/images/res.jpeg";
import marocainFood from "../../assets/images/tajin.jpg";
import italienFood from "../../assets/images/pizza.jpg";
import asiatiqueFood from "../../assets/images/sushi.webp";

// 1. CONFIGURATION DU BACKEND
const API_BASE_URL = "http://localhost:8081"; 
const GATEWAY_URL = "http://localhost:8080/api/tourism/restaurants";

// Liste des villes (Cohérence avec Hebergement)
const VILLES_LISTE = [
  { id: 1, nom: "Marrakech" }, { id: 2, nom: "Fès" }, { id: 3, nom: "Casablanca" },
  { id: 4, nom: "Agadir" }, { id: 5, nom: "Chefchaouen" }, { id: 6, nom: "Rabat" },
  { id: 7, nom: "Tanger" }, { id: 8, nom: "Oujda" }, { id: 9, nom: "Meknès" },
  { id: 11, nom: "Essaouira" }
];

// Types basés sur ton Enum PHP (Valeurs en minuscules pour correspondre au JSON)
const TYPES_CUISINE = [
  { id: "marocaine", nom: "Marocain" },
  { id: "italienne", nom: "Italien" },
  { id: "asiatique", nom: "Asiatique" },
  { id: "cafe", nom: "Café / Snack" }
];

export default function RestaurantPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedVille, setSelectedVille] = useState("all");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. RÉCUPÉRATION DES DONNÉES
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await fetch(GATEWAY_URL);
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data = await response.json();
        setRestaurants(data);
        setError(null);
      } catch (err) {
        console.error("Erreur chargement:", err);
        setError("Impossible de charger les restaurants. Vérifiez la connexion au serveur.");
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
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
  }, [restaurants, loading]);

  // LOGIQUE DU HERO DYNAMIQUE
  const getHeroImage = () => {
    switch(activeCategory) {
      case 'marocaine': return marocainFood;
      case 'italienne': return italienFood;
      case 'asiatique': return asiatiqueFood;
      default: return heroImage;
    }
  };

  const getHeroTitle = () => {
    switch(activeCategory) {
      case 'marocaine': return "Cuisine Marocaine";
      case 'italienne': return "Cuisine Italienne";
      case 'asiatique': return "Cuisine Asiatique";
      default: return "L'Art de la Table Royale";
    }
  };

  // FILTRAGE CROISÉ CORRIGÉ (Utilisation de "categorie" et "villeId" du JSON)
  const filtered = restaurants.filter(r => {
    const catMatch = activeCategory === "all" ? true : r.categorie === activeCategory;
    const villeMatch = selectedVille === "all" ? true : (r.villeId === parseInt(selectedVille));
    return catMatch && villeMatch;
  });

  return (
    <div className="luxury-moroccan">
      {/* SECTION HERO */}
      <section className="hero-luxury" id="home">
        <div className="hero-backdrop"></div>
        <div className="hero-content-luxury">
          <div className="container-luxury">
            <div className="hero-badge-luxury">
              <span className="badge-line"></span>
              <span className="badge-text">L'EXCELLENCE CULINAIRE</span>
              <span className="badge-line"></span>
            </div>
            <h1 className="hero-title-luxury">
              <span className="title-french">{getHeroTitle()}</span>
            </h1>
            <div className="hero-ornament">
              <div className="ornament-diamond"></div>
            </div>
            <p className="hero-subtitle-luxury">
              Découvrez une sélection exceptionnelle des meilleures tables du Royaume.
            </p>
            <div className="hero-cta-group">
              <a href="#restaurants" className="btn-primary-luxury">
                <span>Découvrir</span>
                <i className="fas fa-arrow-down"></i>
              </a>
              <Link to="/restaurants/add" className="btn-add-hebergement">
                <i className="fas fa-plus-circle"></i> Ajouter
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="restaurants-luxury" id="restaurants">
        <div className="bg-marocain"></div>
        <div className="restaurant-zellij-overlay"></div>
        
        <div className="container-luxury">
          {error && <div className="error-message">{error}</div>}

          <div className="section-header-luxury">
            <span className="section-subtitle">NOTRE SÉLECTION</span>
            <h2 className="section-title-luxury">Tables d'Exception</h2>
            <div className="hero-image-container">
              <div className="hero-circle-frame">
                <div className="hero-circle-border">
                  <img src={getHeroImage()} alt="Hero" className="hero-restaurant-image" />
                </div>
              </div>
            </div> 
          </div>

          {/* FILTRES */}
          <div className="category-filters-luxury" style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
            <div className="city-select-container" style={{ position: 'relative' }}>
                <select 
                  className="filter-btn-luxury"
                  style={{ appearance: 'none', paddingRight: '40px', cursor: 'pointer' }}
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                >
                  <option value="all">🍽️ Tous les types</option>
                  {TYPES_CUISINE.map(type => (
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

          <div className="restaurants-grid-luxury">
            {loading ? (
              <div className="body-loader-container" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0' }}>
                <div className="mandala-spinner">
                   <div className="inner-diamond"></div>
                </div>
                <p className="gold-loader-text" style={{ color: '#d4af37', marginTop: '20px', fontStyle: 'italic' }}>
                  Préparation de votre table royale...
                </p>
              </div>
            ) : filtered.length > 0 ? (
              filtered.map((restaurant) => (
                <div 
                  className="restaurant-card-luxury reveal" 
                  key={restaurant.id}
                  onClick={() => setSelectedRestaurant(restaurant)}
                >
                  <div className="card-inner">
                    <div className="card-front">
                      <div className="card-image-luxury">
                        <img 
                          src={restaurant.images && restaurant.images.length > 0 
                            ? (restaurant.images[0].startsWith('http') 
                                ? restaurant.images[0] 
                                : `${API_BASE_URL}/${restaurant.images[0]}`) 
                            : heroImage} 
                          alt={restaurant.nom}
                          onError={(e) => { e.target.src = heroImage; }}
                        />
                        <div className="card-price-tag">
                          {restaurant.prixMoyen ? `${restaurant.prixMoyen} DH` : "--- DH"}
                        </div>
                        <div className="card-rating-luxury">
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className={`fas fa-star ${i < (restaurant.note || 5) ? 'active' : ''}`}></i>
                          ))}
                        </div>
                      </div>
                      <div className="card-content-luxury">
                        <h3 className="card-name-luxury">{restaurant.nom}</h3>
                        <div className="card-details-luxury">
                          <div className="detail-luxury">
                            <i className="fas fa-map-marker-alt"></i> 
                            <span>{restaurant.adresse}</span>
                          </div>
                          <div className="detail-luxury">
                            <i className="fas fa-utensils"></i> 
                            <span style={{ textTransform: 'capitalize' }}>
                              {restaurant.categorie || "Gastronomie"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card-hover">
                      <div className="hover-content">
                        <h3>Découvrir</h3>
                        <button className="btn-hover-luxury">Détails & Avis</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-results" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: '#d4af37' }}>
                Aucun restaurant ne correspond à votre recherche.
              </p>
            )}
          </div>
        </div>
      </section>

      {selectedRestaurant && (
        <RestaurantDetail 
          restaurant={selectedRestaurant} 
          onClose={() => setSelectedRestaurant(null)} 
        />
      )}
    </div>
  );
}