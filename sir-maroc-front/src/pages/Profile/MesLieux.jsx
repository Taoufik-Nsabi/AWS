import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Profile/MesLieux.css";
import { buildApiUrl } from "../../config/env";

export default function MesLieux() {
  const navigate = useNavigate();
  const [lieux, setLieux] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchLieux = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch(buildApiUrl("/api/tourism/lieux"), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!res.ok) throw new Error("Erreur lors de la récupération des lieux");

        const data = await res.json();
        setLieux(data);
      } catch (error) {
        console.error("Erreur chargement lieux:", error);
        setLieux([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLieux();
  }, [navigate]);


  const handleAddRedirect = (e) => {
    const value = e.target.value;
    if (value === "hebergement") navigate("/hebergements/add");
    if (value === "activite") navigate("/activites/add");
    if (value === "restaurant") navigate("/restaurants/add");
  };


  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Voulez-vous vraiment supprimer ce lieu ?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }

      const res = await fetch(buildApiUrl(`/api/tourism/lieux/${id}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        if (res.status === 401) { navigate("/login"); return; }
        throw new Error("Erreur lors de la suppression");
      }

      alert("Lieu supprimé avec succès");
      setLieux((prev) => prev.filter((l) => l.id !== id));
    } catch (error) {
      alert(error.message);
    }
  };

 
  const handleUpdateRedirect = (lieu) => {
    const typeRaw = lieu.type || "";
    const typeClean = typeRaw
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") 
      .trim();

    if (typeClean === "hebergement") {
      navigate(`/hebergements/update/${lieu.id}`);
    } else if (typeClean === "restaurant") {
      navigate(`/restaurants/update/${lieu.id}`);
    } else if (typeClean === "activite") {
      navigate(`/activites/update/${lieu.id}`);
    } else {
      console.error("Type non reconnu:", typeRaw);
      alert("Type d'établissement inconnu");
    }
  };

  if (loading) {
    return (
      <div className="profile-auth-wrapper">
        <p>Chargement de vos établissements...</p>
      </div>
    );
  }

  return (
    <div className="profile-auth-wrapper">
      <div className="lieux-container-wide">
        <div className="lieux-header">
          <div className="header-content">
            <h1 className="profile-logo-text">Mes Établissements</h1>
            <div className="profile-line"></div>
            <p className="profile-subtitle">Gérez vos publications sur Sir Maroc</p>
          </div>

          <div className="add-lieu-container">
            <select className="add-lieu-select" onChange={handleAddRedirect} defaultValue="">
              <option value="" disabled>+ Ajouter un établissement</option>
              <option value="hebergement">Hébergement</option>
              <option value="activite">Activité / Évènement</option>
              <option value="restaurant">Restaurant / Café</option>
            </select>
          </div>
        </div>

        <div className="lieux-table-wrapper">
          <table className="luxury-table">
            <thead>
              <tr>
                <th>Établissement</th>
                <th>Type</th>
                <th>Ville</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lieux.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "40px" }}>
                    Aucun établissement trouvé
                  </td>
                </tr>
              ) : (
                lieux.map((lieu) => (
                  <tr key={lieu.id}>
                    <td className="font-bold">{lieu.nom}</td>
                    <td><span className="badge-type">{lieu.type}</span></td>
                    <td>{lieu.villeNom ?? "—"}</td>
                    <td>
                      <div className="status-container">
                        <span className={`status-dot ${lieu.status === "APPROVED" || lieu.status === "approved" ? "active" : "pending"}`}></span>
                        <span className="status-text">{lieu.status}</span>
                      </div>
                    </td>
                    <td className="actions-cell">
                      <button className="btn-action detail" title="Voir" onClick={() => navigate(`/LieuDetails/${lieu.id}`)}>
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="btn-action update" title="Modifier" onClick={() => handleUpdateRedirect(lieu)}>
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="btn-action delete" title="Supprimer" onClick={() => handleDelete(lieu.id)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
