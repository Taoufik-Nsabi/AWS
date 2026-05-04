import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAdminLieux } from "../../utils/adminModerationApi";
import { logout } from "../../utils/auth";
import "../../styles/admin/AdminNavbar.css";

export default function AdminNavbar({ onToggle, isOpen }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState({
    name: "",
    email: "",
    role: "",
  });
  const [quickStats, setQuickStats] = useState({
    pendingHebergements: 0,
    pendingRestaurants: 0,
    pendingActivites: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const role = localStorage.getItem("userRole");

    const isAdmin =
      (role === "Admin" || role === "ADMIN" || role === "ROLE_ADMIN") &&
      email === "admin@sirmaroc.com";

    if (!isAdmin) {
      navigate("/");
      return;
    }

    const nameFromEmail = email ? email.split("@")[0] : "Admin";

    setUser({
      name: nameFromEmail,
      email: email || "",
      role: role || "Admin",
    });
  }, [navigate]);

  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        const [hebergements, restaurants, activites] = await Promise.all([
          fetchAdminLieux("hebergements", "en_attente"),
          fetchAdminLieux("restaurants", "en_attente"),
          fetchAdminLieux("activites", "en_attente"),
        ]);

        setQuickStats({
          pendingHebergements: hebergements.length,
          pendingRestaurants: restaurants.length,
          pendingActivites: activites.length,
        });
      } catch {
        // Leave dropdown usable even if stats fail.
      }
    };

    fetchQuickStats();
  }, []);

  const totalPendingDemandes = useMemo(
    () =>
      quickStats.pendingHebergements +
      quickStats.pendingRestaurants +
      quickStats.pendingActivites,
    [quickStats]
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleProfileAccess = () => {
    setShowDropdown(false);
    navigate("/admin/profile");
  };

  return (
    <nav className="admin-navbar">
      <div className="navbar-left">
        <button className="sidebar-toggle-btn" onClick={onToggle}>
          <i className={`fas ${isOpen ? "fa-times" : "fa-bars"}`}></i>
        </button>
        <h2 className="nav-page-title">Tableau de Bord</h2>
      </div>

      <div className="navbar-right">
        <div className="nav-notifications">
          <i className="far fa-bell"></i>
          <span className="badge">{totalPendingDemandes}</span>
        </div>

        <div
          className="admin-profile-section"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div className="admin-info">
            <span className="admin-name">{user.name}</span>
            <span className="admin-role">Administrateur</span>
          </div>

          <div className="admin-avatar-wrapper">
            <img
              src={`https://ui-avatars.com/api/?name=${user.name}&background=3d0a0c&color=fff`}
              alt={user.name}
              className="admin-avatar-img"
            />
            <div className="online-indicator"></div>
          </div>

          <i className={`fas fa-chevron-down arrow-icon ${showDropdown ? "rotate" : ""}`}></i>

          {showDropdown && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
                <small className="dropdown-role-badge">{user.role || "Admin"}</small>
              </div>

              <div className="dropdown-divider"></div>

              <button className="profile-access-btn" onClick={handleProfileAccess}>
                <i className="fas fa-user-circle"></i> Mon profil admin
              </button>

              <div className="dropdown-divider"></div>

              <button className="logout-btn" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i> Deconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
