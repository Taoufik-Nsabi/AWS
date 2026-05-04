import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated, logout } from "../utils/auth";
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
    navigate(path);
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
            <span className="nav-link dropdown-trigger">Destinations</span>
            <div className="dropdown-content">
              <Link to="/restaurants">Restaurants</Link>
              <Link to="/hebergements">Hebergements</Link>
              <Link to="/monuments">Monuments</Link>
              <Link to="/activites">Activites & Evenements</Link>
              <Link to="/vols">Vols</Link>
              <Link to="/matchs">Matchs</Link>
               <Link to="/tourism">Trajet tourism</Link>
            </div>
          </div>

          <Link to="/chat" className="nav-link">Chat</Link>

          <Link to="/contact" className="nav-link">Contact</Link>

          {!auth ? (
            <Link to="/login" className="nav-link nav-auth-link login-btn">
              Se connecter
            </Link>
          ) : (
            <div className="user-profile-luxury">
              <div className="user-control" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <div className="user-info-text">
                  <span className="user-welcome">Bienvenue,</span>
                  <span className="user-name-gold">{userEmail.split("@")[0]}</span>
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

                  <div className="dropdown-divider-gold"></div>

                  <button onClick={handleLogout} className="logout-luxury">
                    <i className="fas fa-power-off"></i> Deconnexion
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
