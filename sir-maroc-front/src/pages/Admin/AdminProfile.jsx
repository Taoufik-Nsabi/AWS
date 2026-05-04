import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../../styles/admin/AdminProfile.css";

export default function AdminProfile() {
  const navigate = useNavigate();

  const [adminData, setAdminData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "+212 600-000000",
    role: "Administrateur Principal",
    bio: "Administrateur de la plateforme SIR MAROC."
  });

  // 🔥 VERIFICATION + DATA
  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const role = localStorage.getItem("userRole");

    const isAdmin =
      (role === "Admin" || role === "ADMIN" || role === "ROLE_ADMIN") &&
      email === "admin@sirmaroc.com";

    // ❌ PAS ADMIN → REDIRECTION
    if (!isAdmin) {
      navigate("/");
      return;
    }

    // 🔥 EXTRAIRE NOM DEPUIS EMAIL
    const name = email ? email.split("@")[0] : "Admin";

    setAdminData({
      firstName: name,
      lastName: "",
      email: email,
      phone: "+212 600-000000",
      role: "Administrateur Principal",
      bio: "Administrateur officiel de la plateforme SIR MAROC."
    });

  }, [navigate]);

  return (
    <div className="admin-profile-container">

      {/* 🔙 RETOUR */}
      <div className="profile-actions-top">
        <Link to="/admin" className="back-to-admin">
          <i className="fas fa-arrow-left"></i> Retour au Tableau de Bord
        </Link>
      </div>

      {/* 🧑 HEADER */}
      <div className="profile-header-banner">
        <div className="profile-main-info">
          <div className="profile-avatar-big">
            <img 
              src={`https://ui-avatars.com/api/?name=${adminData.firstName}&background=3d0a0c&color=fff&size=128`} 
              alt="Admin" 
            />
            <div className="status-indicator-online"></div>
          </div>

          <div className="profile-name-role">
            <h1>{adminData.firstName}</h1>
            <span className="role-tag">{adminData.role}</span>
          </div>
        </div>
      </div>

      {/* 📄 INFOS */}
      <div className="profile-single-content">
        <div className="profile-card info-card">
          <div className="card-header-luxury">
            <h3>
              <i className="fas fa-user-shield"></i> Profil Administrateur
            </h3>
            <div className="header-line"></div>
          </div>
          
          <div className="card-body-grid">
            <div className="info-item">
              <label>Email</label>
              <p>{adminData.email}</p>
            </div>

            <div className="info-item">
              <label>Téléphone</label>
              <p>{adminData.phone}</p>
            </div>

            <div className="info-item full-width">
              <label>Biographie & Parcours</label>
              <p className="bio-text">{adminData.bio}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
