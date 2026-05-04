import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated, logout } from "../utils/auth";
import { MATCH_FRONT_URL } from "../config/externalApps";
import "../styles/Navbar.css";

export default function Navbar({ scrolled }) {
  const navigate = useNavigate();
  const auth = isAuthenticated();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    if (auth) {
      const email = localStorage.getItem("userEmail") || "Utilisateur";
      setUserEmail(email);
    }
  }, [auth]);

  const handleNavigate = (path) => {
    setUserMenuOpen(false); 
    navigate(path);         // Force la redirection
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/login");
  };

  const userInitial = userEmail.charAt(0).toUpperCase();

  return (
    <nav className={`luxury-nav ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        
        <Link to="/" className="nav-logo">
          <span className="logo-text">SIR MAROC</span>
          <span className="logo-sub">Palace Gastronomique</span>
        </Link>

        <div className="nav-links">
          <Link to="/" className="nav-link">Accueil</Link>

          <div className="nav-dropdown">
            <span className="nav-link dropdown-trigger">Destinations ▼</span>
            <div className="dropdown-content">
              <Link to="/restaurants">Restaurants</Link>
              <Link to="/hebergements">Hébergements</Link>
              <Link to="/monuments">Monuments</Link>
              <Link to="/activites">Activités & Événements</Link>
            </div>
          </div>

          <Link to="/contact" className="nav-link">Contact</Link>

          {auth && (
            <Link to="/chat" className="nav-link nav-chat-link">
              Chat
            </Link>
          )}

          <a
            href={MATCH_FRONT_URL}
            className="nav-link nav-match-link"
            target="_self"
            rel="noreferrer"
          >
            Check Matches
          </a>

          {!auth ? (
            <Link to="/login" className="nav-link nav-auth-link login-btn">
              Se connecter
            </Link>
          ) : (
            <div className="user-profile-luxury">
              <div className="user-control" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <div className="user-info-text">
                  <span className="user-welcome">Bienvenue,</span>
                  <span className="user-name-gold">{userEmail.split('@')[0]}</span>
                </div>
                <div className="user-avatar-minimal">{userInitial}</div>
              </div>

              {userMenuOpen && (
                <div className="luxury-dropdown-v2">
                  <div className="dropdown-ornament"></div>
                  
                  <button className="dropdown-item-btn" onClick={() => handleNavigate("/profile")}>
                    <i className="fas fa-user-crown"></i> Mon Compte
                  </button>
                  
                  <button className="dropdown-item-btn" onClick={() => handleNavigate("/mes-lieux")}>
                    <i className="fas fa-map-marker-alt"></i> Mes Lieux
                  </button>

                  <button className="dropdown-item-btn" onClick={() => handleNavigate("/chat")}>
                    <i className="fas fa-comments"></i> Chat
                  </button>

                  <a className="dropdown-item-link" href={MATCH_FRONT_URL} target="_self" rel="noreferrer">
                    <i className="fas fa-futbol"></i> Check Matches
                  </a>

                  <div className="dropdown-divider-gold"></div>
                  
                  <button onClick={handleLogout} className="logout-luxury">
                    <i className="fas fa-power-off"></i> Déconnexion
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
