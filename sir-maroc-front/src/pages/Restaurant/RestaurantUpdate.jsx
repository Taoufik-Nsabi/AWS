import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/Profile/LieuUpdate.css";
import { buildApiUrl, buildTourismAssetUrl } from "../../config/env";

export default function RestaurantUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // État du formulaire basé sur ton DTO (sans villeId ni categorie)
  const [form, setForm] = useState({
    nom: "",
    adresse: "",
    description: "",
    reseauSociaux: "",
    prixMoyen: "",
    telephone: ""
  });

  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  // ================= CHARGEMENT =================
  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(buildApiUrl(`/api/tourism/restaurants/${id}`), {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json" 
          }
        });

        if (!res.ok) throw new Error("Erreur lors du chargement du restaurant");

        const data = await res.json();
        
        setForm({
          nom: data.nom || "",
          adresse: data.adresse || "",
          description: data.description || "",
          reseauSociaux: data.reseauSociaux || "",
          prixMoyen: data.prixMoyen || "",
          telephone: data.telephone || ""
        });
        
        setExistingImages(data.images || []);
      } catch (err) {
        console.error(err);
        alert("Impossible de charger les données.");
      } finally {
        setLoading(false);
      }
    };
    if (id) loadRestaurant();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const markImageForDeletion = (imgUrl) => {
    setImagesToDelete((prev) => [...prev, imgUrl]);
    setExistingImages((prev) => prev.filter((img) => img !== imgUrl));
  };

  // ================= SOUMISSION =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem("token");
    const fd = new FormData();

    // Trick Symfony pour supporter les fichiers en PUT via un POST
    fd.append("_method", "PUT");

    // Ajout des champs textes avec conversion pour le DTO
    fd.append("nom", form.nom);
    fd.append("adresse", form.adresse);
    fd.append("description", form.description);
    fd.append("reseauSociaux", form.reseauSociaux);
    fd.append("prixMoyen", parseFloat(form.prixMoyen) || 0);
    fd.append("telephone", form.telephone);

    // Gestion des images (Nouvelles et Supprimées)
    newImages.forEach((img) => fd.append("images[]", img));
    imagesToDelete.forEach((img) => fd.append("deletedImages[]", img));

    try {
      const res = await fetch(buildApiUrl(`/api/tourism/restaurants/${id}`), {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: fd
      });

      if (res.ok) {
        alert("Restaurant mis à jour !");
        navigate("/mes-lieux");
      } else {
        const errorData = await res.json();
        alert(`Erreur : ${errorData.message || "Veuillez vérifier le formulaire"}`);
      }
    } catch (err) {
      alert("Erreur de connexion au serveur.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="profile-auth-wrapper"><p>Chargement...</p></div>;

  return (
    <div className="profile-auth-wrapper">
      <div className="update-container">
        <h1 className="profile-logo-text">Modifier le Restaurant</h1>
        
        <form className="update-form-grid" onSubmit={handleSubmit}>
          
          <div className="profile-input-group">
            <label>Nom du Restaurant</label>
            <input name="nom" value={form.nom} onChange={handleChange} required />
          </div>

          <div className="profile-input-group">
            <label>Prix Moyen (DH)</label>
            <input type="number" step="0.01" name="prixMoyen" value={form.prixMoyen} onChange={handleChange} />
          </div>

          <div className="profile-input-group">
            <label>Téléphone</label>
            <input name="telephone" value={form.telephone} onChange={handleChange} />
          </div>

          <div className="profile-input-group full">
            <label>Adresse</label>
            <input name="adresse" value={form.adresse} onChange={handleChange} />
          </div>

          <div className="profile-input-group full">
            <label>Réseaux Sociaux (URL)</label>
            <input name="reseauSociaux" value={form.reseauSociaux} onChange={handleChange} />
          </div>

          <div className="profile-input-group full">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows="4" />
          </div>

          {existingImages.length > 0 && (
            <div className="profile-input-group full">
              <label>Images actuelles (Cliquez sur × pour supprimer)</label>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
                {existingImages.map((img, i) => {
                  // Nettoyage du slash pour l'affichage
                  const cleanPath = img.startsWith('/') ? img.substring(1) : img;
                  return (
                    <div key={i} style={{ position: "relative" }}>
                      <img 
                        src={buildTourismAssetUrl(cleanPath)} 
                        alt="Resto" 
                        style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px" }}
                        onError={(e) => { e.target.src = "https://via.placeholder.com/100?text=Image+Introuvable"; }}
                      />
                      <button 
                        type="button" 
                        onClick={() => markImageForDeletion(img)} 
                        style={{ position: "absolute", top: "-5px", right: "-5px", background: "#ff4d4d", color: "white", border: "none", borderRadius: "50%", cursor: "pointer", width: "20px", height: "20px" }}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="profile-input-group full">
            <label>Ajouter de nouvelles photos</label>
            <input type="file" multiple onChange={e => setNewImages([...e.target.files])} />
          </div>

          <button type="submit" className="profile-save-btn" disabled={submitting}>
            {submitting ? "Mise à jour..." : "Enregistrer les modifications"}
          </button>
          
        </form>
      </div>
    </div>
  );
}
