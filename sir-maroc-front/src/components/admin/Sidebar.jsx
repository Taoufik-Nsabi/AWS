import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/admin/AdminSidebar.css";

export default function Sidebar({ isOpen }) {
  const [openMenus, setOpenMenus] = useState({
    users: false,
    hebergements: true,
    restaurants: false,
    monuments: false,
    activites: false,
  });

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  return (
    <aside className={`admin-sidebar ${isOpen ? "active" : "hidden"}`}>
      <div className="sidebar-brand">
        SIR MAROC <span>Admin</span>
      </div>

      <nav className="sidebar-nav">
        <div className="menu-group">
          <Link to="/admin" className="nav-section">
            <span><i className="fas fa-chart-line"></i> Stats</span>
            <i className="fas fa-chevron-right arrow"></i>
          </Link>
        </div>

        <div className="menu-group">
          <div className={`nav-section ${openMenus.users ? "open" : ""}`} onClick={() => toggleMenu("users")}>
            <span><i className="fas fa-users-cog"></i> Utilisateurs</span>
            <i className={`fas fa-chevron-right arrow ${openMenus.users ? "rotate" : ""}`}></i>
          </div>
          {openMenus.users && (
            <div className="submenu">
              <Link to="/admin/users/list" className="sidebar-link">Liste des Users</Link>
            </div>
          )}
        </div>

        <div className="menu-group">
          <div className={`nav-section ${openMenus.hebergements ? "open" : ""}`} onClick={() => toggleMenu("hebergements")}>
            <span><i className="fas fa-hotel"></i> Hebergements</span>
            <i className={`fas fa-chevron-right arrow ${openMenus.hebergements ? "rotate" : ""}`}></i>
          </div>
          {openMenus.hebergements && (
            <div className="submenu">
              <Link to="/admin/hebergements/pending" className="sidebar-link">En Attente</Link>
              <Link to="/admin/hebergements/approved" className="sidebar-link">Approuves</Link>
              <Link to="/admin/hebergements/rejected" className="sidebar-link">Refuses</Link>
            </div>
          )}
        </div>

        <div className="menu-group">
          <div className={`nav-section ${openMenus.restaurants ? "open" : ""}`} onClick={() => toggleMenu("restaurants")}>
            <span><i className="fas fa-utensils"></i> Restaurants</span>
            <i className={`fas fa-chevron-right arrow ${openMenus.restaurants ? "rotate" : ""}`}></i>
          </div>
          {openMenus.restaurants && (
            <div className="submenu">
              <Link to="/admin/restaurants/pending" className="sidebar-link">En Attente</Link>
              <Link to="/admin/restaurants/approved" className="sidebar-link">Approuves</Link>
              <Link to="/admin/restaurants/rejected" className="sidebar-link">Refuses</Link>
            </div>
          )}
        </div>

        <div className="menu-group">
          <div className={`nav-section ${openMenus.monuments ? "open" : ""}`} onClick={() => toggleMenu("monuments")}>
            <span><i className="fas fa-archway"></i> Monuments</span>
            <i className={`fas fa-chevron-right arrow ${openMenus.monuments ? "rotate" : ""}`}></i>
          </div>
          {openMenus.monuments && (
            <div className="submenu">
              <Link to="/admin/monuments" className="sidebar-link">Catalogue</Link>
            </div>
          )}
        </div>

        <div className="menu-group">
          <div className={`nav-section ${openMenus.activites ? "open" : ""}`} onClick={() => toggleMenu("activites")}>
            <span><i className="fas fa-skating"></i> Activites</span>
            <i className={`fas fa-chevron-right arrow ${openMenus.activites ? "rotate" : ""}`}></i>
          </div>
          {openMenus.activites && (
            <div className="submenu">
              <Link to="/admin/activites/pending" className="sidebar-link">En Attente</Link>
              <Link to="/admin/activites/approved" className="sidebar-link">Approuvees</Link>
              <Link to="/admin/activites/rejected" className="sidebar-link">Refusees</Link>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
