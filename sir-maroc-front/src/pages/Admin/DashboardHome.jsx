import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseError } from "../../utils/apiError";
import { fetchAdminLieux } from "../../utils/adminModerationApi";
import "../../styles/admin/DashboardHome.css";

const API_BASE = "http://localhost:8080";

export default function DashboardHome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [monuments, setMonuments] = useState([]);
  const [pendingHebergements, setPendingHebergements] = useState([]);
  const [approvedRestaurants, setApprovedRestaurants] = useState([]);
  const [pendingRestaurants, setPendingRestaurants] = useState([]);
  const [pendingActivites, setPendingActivites] = useState([]);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const email = localStorage.getItem("userEmail");

    const isAdmin =
      (role === "Admin" || role === "ADMIN" || role === "ROLE_ADMIN") &&
      email === "admin@sirmaroc.com";

    if (!isAdmin) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      let nextError = "";

      try {
        const token = localStorage.getItem("token");

        const results = await Promise.allSettled([
          fetch(`${API_BASE}/api/users`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).then(async (response) => {
            if (!response.ok) {
              throw new Error(
                response.status === 401
                  ? "Session admin expiree. Reconnectez-vous pour charger les statistiques utilisateurs."
                  : await parseError(response)
              );
            }

            const data = await response.json();
            return Array.isArray(data) ? data : [];
          }),
          fetch(`${API_BASE}/api/tourism/monuments`).then(async (response) => {
            if (!response.ok) {
              throw new Error(await parseError(response));
            }

            const data = await response.json();
            return Array.isArray(data) ? data : [];
          }),
          fetchAdminLieux("hebergements", "en_attente"),
          fetchAdminLieux("restaurants", "approuve"),
          fetchAdminLieux("restaurants", "en_attente"),
          fetchAdminLieux("activites", "en_attente"),
        ]);

        const [
          usersResult,
          monumentsResult,
          hebergementsResult,
          restaurantsApprovedResult,
          restaurantsPendingResult,
          activitesPendingResult,
        ] = results;

        if (usersResult.status === "fulfilled") {
          setUsers(usersResult.value);
        } else {
          setUsers([]);
          nextError = usersResult.reason?.message || "Impossible de charger les utilisateurs.";
        }

        if (monumentsResult.status === "fulfilled") {
          setMonuments(monumentsResult.value);
        } else {
          setMonuments([]);
          nextError ||= monumentsResult.reason?.message || "Impossible de charger les monuments.";
        }

        if (hebergementsResult.status === "fulfilled") {
          setPendingHebergements(Array.isArray(hebergementsResult.value) ? hebergementsResult.value : []);
        } else {
          setPendingHebergements([]);
          nextError ||= hebergementsResult.reason?.message || "Impossible de charger les hebergements.";
        }

        if (restaurantsApprovedResult.status === "fulfilled") {
          setApprovedRestaurants(Array.isArray(restaurantsApprovedResult.value) ? restaurantsApprovedResult.value : []);
        } else {
          setApprovedRestaurants([]);
          nextError ||= restaurantsApprovedResult.reason?.message || "Impossible de charger les restaurants approuves.";
        }

        if (restaurantsPendingResult.status === "fulfilled") {
          setPendingRestaurants(Array.isArray(restaurantsPendingResult.value) ? restaurantsPendingResult.value : []);
        } else {
          setPendingRestaurants([]);
          nextError ||= restaurantsPendingResult.reason?.message || "Impossible de charger les restaurants en attente.";
        }

        if (activitesPendingResult.status === "fulfilled") {
          setPendingActivites(Array.isArray(activitesPendingResult.value) ? activitesPendingResult.value : []);
        } else {
          setPendingActivites([]);
          nextError ||= activitesPendingResult.reason?.message || "Impossible de charger les activites en attente.";
        }

        setError(nextError);
      } catch (err) {
        setError(err.message || "Erreur de chargement du tableau de bord");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = useMemo(() => {
    const adminCount = users.filter((user) =>
      ["Admin", "ADMIN", "ROLE_ADMIN"].includes(user.role)
    ).length;

    return [
      {
        id: 1,
        label: "Hebergements en attente",
        count: pendingHebergements.length,
        icon: "fa-bed",
        color: "#3d0a0c",
      },
      {
        id: 2,
        label: "Restaurants approuves",
        count: approvedRestaurants.length,
        icon: "fa-utensils",
        color: "#0f5a43",
      },
      {
        id: 3,
        label: "Utilisateurs inscrits",
        count: users.length,
        icon: "fa-users",
        color: "#2f2f34",
      },
      {
        id: 4,
        label: "Comptes admin",
        count: adminCount,
        icon: "fa-user-shield",
        color: "#d4af37",
      },
      {
        id: 5,
        label: "Activites en attente",
        count: pendingActivites.length,
        icon: "fa-person-hiking",
        color: "#6b3fa0",
      },
      {
        id: 6,
        label: "Monuments references",
        count: monuments.length,
        icon: "fa-landmark",
        color: "#7b5e3b",
      },
    ];
  }, [approvedRestaurants.length, monuments.length, pendingActivites.length, pendingHebergements.length, users]);

  const recentDemandes = useMemo(() => {
    const enrich = (items, type, route) =>
      items.map((item) => ({
        ...item,
        dashboardType: type,
        dashboardRoute: route,
      }));

    return [
      ...enrich(pendingHebergements, "Hebergement", "/admin/hebergements/pending"),
      ...enrich(pendingRestaurants, "Restaurant", "/admin/restaurants/pending"),
      ...enrich(pendingActivites, "Activite", "/admin/activites/pending"),
    ]
      .sort((a, b) => (b.id || 0) - (a.id || 0))
      .slice(0, 5);
  }, [pendingActivites, pendingHebergements, pendingRestaurants]);

  return (
    <div className="dashboard-home">
      <div className="admin-page-header">
        <h1 className="admin-title">Tableau de Bord</h1>
        <p className="admin-subtitle">
          Bienvenue, Administrateur. Voici l'etat actuel de <strong>SIR MAROC</strong>.
        </p>
      </div>

      {error && <div className="dashboard-alert error">{error}</div>}

      <div className="stats-grid">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="stat-card stat-card-loading">
                <div className="stat-icon"></div>
                <div className="stat-info">
                  <h3>...</h3>
                  <p>Chargement</p>
                </div>
              </div>
            ))
          : stats.map((stat) => (
              <div
                key={stat.id}
                className="stat-card"
                style={{ borderTop: `4px solid ${stat.color}` }}
              >
                <div className="stat-icon" style={{ color: stat.color }}>
                  <i className={`fas ${stat.icon}`}></i>
                </div>
                <div className="stat-info">
                  <h3>{stat.count}</h3>
                  <p>{stat.label}</p>
                </div>
              </div>
            ))}
      </div>

      <div className="dashboard-recent-section">
        <div className="recent-box">
          <h3>Dernieres demandes</h3>
          {loading ? (
            <p>Chargement des demandes...</p>
          ) : recentDemandes.length === 0 ? (
            <p>Aucune demande en attente pour le moment.</p>
          ) : (
            <>
              <p>Voici les demandes les plus recentes a verifier.</p>
              <div className="recent-demandes-list">
                {recentDemandes.map((item) => (
                  <button
                    key={`${item.dashboardType}-${item.id}`}
                    type="button"
                    className="recent-demande-item"
                    onClick={() => navigate(item.dashboardRoute)}
                  >
                    <span className="recent-demande-type">{item.dashboardType}</span>
                    <strong>{item.nom}</strong>
                    <span>#{item.id}</span>
                  </button>
                ))}
              </div>
              <button
                className="btn-action edit"
                style={{ width: "auto", padding: "10px 20px" }}
                onClick={() => navigate("/admin/hebergements/pending")}
              >
                Voir les demandes
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
