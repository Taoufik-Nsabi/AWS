import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/Profile/LieuUpdate.css";

export default function LieuUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    description: '',
    villeId: '',
    tarif: '',
    duree: '',
    categorie: '',
    reseauSociaux: ''
  });

  useEffect(() => {
    // 1. Récupérer les données actuelles du lieu via l'ID
    const fetchCurrentData = async () => {
      try {
        // Remplace par ton fetch : GET /api/tourism/restaurants/{id}
        const mockData = {
          nom: "Le Grand Atlas",
          adresse: "Avenue Mohamed V",
          description: "Description existante...",
          villeId: "1",
          tarif: "450",
          duree: "120",
          categorie: "gastronomie",
          reseauSociaux: "https://insta.com"
        };
        setFormData(mockData);
      } catch (error) {
        console.error("Erreur de chargement", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const token = localStorage.getItem('token');
    const updateData = new FormData();
    
    // Mapping pour ton DTO Symfony
    Object.keys(formData).forEach(key => {
      updateData.append(key, formData[key]);
    });

    try {
      // NOTE : Symfony préfère souvent un POST pour les formulaires avec fichiers, 
      // ou un PUT si tu envoies du JSON pur.
      const response = await fetch(`http://localhost:8080/api/tourism/restaurants/${id}`, {
        method: 'POST', // Ton controller PHP utilise #[Route('/{id}', methods: ['POST'])] pour l'update
        headers: { 'Authorization': `Bearer ${token}` },
        body: updateData
      });

      if (response.ok) {
        alert("Mise à jour réussie !");
        navigate("/mes-lieux");
      }
    } catch (error) {
      alert("Erreur lors de la modification");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loader">Chargement...</div>;

  return (
    <div className="profile-auth-wrapper">
      <div className="update-container">
        <div className="update-header">
          <h1 className="profile-logo-text">Modifier l'établissement</h1>
          <div className="profile-line"></div>
        </div>

        <form onSubmit={handleSubmit} className="update-form-grid">
          <div className="profile-input-group">
            <label>Nom de l'établissement</label>
            <input type="text" name="nom" value={formData.nom} onChange={handleChange} />
          </div>

          <div className="profile-input-group">
            <label>Catégorie</label>
            <input type="text" name="categorie" value={formData.categorie} onChange={handleChange} />
          </div>

          <div className="profile-input-group full">
            <label>Adresse complète</label>
            <input type="text" name="adresse" value={formData.adresse} onChange={handleChange} />
          </div>

          <div className="profile-input-group full">
            <label>Description</label>
            <textarea name="description" rows="5" value={formData.description} onChange={handleChange}></textarea>
          </div>

          <div className="profile-input-group">
            <label>Tarif / Prix Moyen (DH)</label>
            <input type="number" name="tarif" value={formData.tarif} onChange={handleChange} />
          </div>

          <div className="profile-input-group">
            <label>Durée (min)</label>
            <input type="number" name="duree" value={formData.duree} onChange={handleChange} />
          </div>

          <div className="profile-actions-full">
            <button type="submit" className="profile-save-btn" disabled={submitting}>
              {submitting ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
            <button type="button" className="profile-back-link" onClick={() => navigate(-1)}>
              Annuler et revenir
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}