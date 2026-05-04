import React, { useState, useEffect } from "react";
import "../../styles/auth/ProfilePage.css";
import { Link } from "react-router-dom";

export default function ProfilePage() {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    phone: "",
    city: "Oujda",
    memberSince: "2026"
  });

  useEffect(() => {
    const email = localStorage.getItem("userEmail") || "invite@sirmaroc.com";
    setUserData(prev => ({
      ...prev,
      email: email,
      username: email.split('@')[0]
    }));
  }, []);

  return (
    <div className="profile-auth-wrapper">
      <div className="profile-container-horizontal">
        
        {/* Partie Gauche : Titre et Avatar */}
        <div className="profile-sidebar-brand">
          <div className="profile-avatar-circle">
            {userData.username.charAt(0).toUpperCase()}
          </div>
          <span className="profile-logo-text">Mon Profil</span>
          <div className="profile-line"></div>
          <p className="profile-subtitle">Espace Membre Privé</p>
          
          <div className="profile-meta">
            <span>Membre depuis : {userData.memberSince}</span>
          </div>
        </div>

        {/* Partie Droite : Formulaire Horizontal */}
        <div className="profile-form-content">
          <form className="profile-form-grid">
            
            <div className="profile-input-group">
              <label>Nom d'utilisateur</label>
              <input 
                type="text" 
                value={userData.username} 
                onChange={(e) => setUserData({...userData, username: e.target.value})}
              />
            </div>

            <div className="profile-input-group">
              <label>Adresse Email</label>
              <input type="email" value={userData.email} readOnly />
            </div>

            <div className="profile-input-group">
              <label>Téléphone</label>
              <input 
                type="text" 
                placeholder="+212 6..."
                value={userData.phone}
                onChange={(e) => setUserData({...userData, phone: e.target.value})}
              />
            </div>

            <div className="profile-input-group">
              <label>Ville</label>
              <input 
                type="text" 
                value={userData.city}
                onChange={(e) => setUserData({...userData, city: e.target.value})}
              />
            </div>

            <div className="profile-actions-full">
              <button type="button" className="profile-save-btn">
                Mettre à jour mes informations
              </button>
              <Link to="/" className="profile-back-link">
                ← Retour à l'accueil
              </Link>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}