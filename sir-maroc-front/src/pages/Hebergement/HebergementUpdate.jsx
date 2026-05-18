import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/Profile/LieuUpdate.css";
import { buildApiUrl, buildTourismAssetUrl } from "../../config/env";

// Liste des villes correspondant à vos fixtures PHP
const VILLES_MAROC = [
  { id: 1, nom: "Marrakech" }, { id: 2, nom: "Fès" }, { id: 3, nom: "Casablanca" },
  { id: 4, nom: "Agadir" }, { id: 5, nom: "Chefchaouen" }, { id: 6, nom: "Rabat" },
  { id: 7, nom: "Tanger" }, { id: 8, nom: "Oujda" }, { id: 9, nom: "Meknès" },
  { id: 10, nom: "Tétouan" }, { id: 11, nom: "Essaouira" }, { id: 12, nom: "Ouarzazate" },
  { id: 13, nom: "Ifrane" }, { id: 14, nom: "Dakhla" }, { id: 15, nom: "Nador" },
  { id: 16, nom: "Al Hoceima" }, { id: 17, nom: "Béni Mellal" }, { id: 18, nom: "Khouribga" },
  { id: 19, nom: "Safi" }, { id: 20, nom: "El Jadida" }
];

export default function HebergementUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    nom: "",
    adresse: "",
    description: "",
    reseauSociaux: "",
    villeId: "",
    prix: "",
    telephone: "",
    categories: ""
  });

  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  // 1. Chargement des données initiales
  useEffect(() => {
    const loadHebergement = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch(buildApiUrl(`/api/tourism/hebergements/${id}`), {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });

        if (!res.ok) throw new Error("Erreur lors de la récupération");

        const data = await res.json();
        
        setForm({
          nom: data.nom || "",
          adresse: data.adresse || "",
          description: data.description || "",
          reseauSociaux: data.reseauSociaux || "",
          villeId: data.villeId || "",
          prix: data.prix || "",
          telephone: data.telephone || "",
          categories: data.categories || ""
        });

        setExistingImages(data.images || []);

      } catch (err) {
        console.error(err);
        alert("Impossible de charger les données de l'hébergement.");
      } finally {
        setLoading(false);
      }
    };

    if (id) loadHebergement();
  }, [id, navigate]);

  // 2. Gestionnaires d'événements
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setNewImages([...e.target.files]);
  };

  const markImageForDeletion = (imgUrl) => {
    setImagesToDelete((prev) => [...prev, imgUrl]);
    setExistingImages((prev) => prev.filter((img) => img !== imgUrl));
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    return imagePath.startsWith('http') ? imagePath : buildTourismAssetUrl(imagePath);
  };

  // 3. Envoi du formulaire (POST avec FormData)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const token = localStorage.getItem("token");
    const fd = new FormData();

    // Ajout des champs texte
    Object.keys(form).forEach(key => {
        if (form[key] !== null) fd.append(key, form[key]);
    });

    // Ajout des nouvelles images
    newImages.forEach((img) => {
      fd.append("images[]", img);
    });

    // Ajout des noms d'images à supprimer
    imagesToDelete.forEach((img) => {
      fd.append("deletedImages[]", img);
    });

    try {
      const res = await fetch(buildApiUrl(`/api/tourism/hebergements/${id}`), {
        method: "POST", 
       headers: { 
  "Authorization": `Bearer ${token}`, // <-- ESPACE ICI
  "Accept": "application/json"
},
        body: fd
      });

      if (res.ok) {
        alert("Hébergement mis à jour avec succès !");
        navigate("/mes-lieux");
      } else {
        const errorData = await res.json();
        alert(`Erreur: ${errorData.message || "Vérifiez vos données (URL, format image, etc.)"}`);
      }
    } catch (error) {
      alert("Erreur de connexion au serveur.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="profile-auth-wrapper">
      <div className="update-container" style={{ textAlign: "center" }}>
        <p>Récupération de vos données d'exception...</p>
      </div>
    </div>
  );

  return (
    <div className="profile-auth-wrapper">
      <div className="update-container">
        
        <div className="update-header">
          <h1 className="profile-logo-text">Modifier l'Hébergement</h1>
          <div className="profile-line"></div>
          <p className="profile-subtitle">Édition de votre résidence</p>
        </div>

        <form className="update-form-grid" onSubmit={handleSubmit}>
          
          <div className="profile-input-group">
            <label>Nom de l'établissement</label>
            <input name="nom" value={form.nom} onChange={handleChange} required />
          </div>

          <div className="profile-input-group">
            <label>Catégorie</label>
            <input name="categories" value={form.categories} onChange={handleChange} placeholder="Ex: HOTEL" />
          </div>

          <div className="profile-input-group full">
            <label>Adresse</label>
            <input name="adresse" value={form.adresse} onChange={handleChange} />
          </div>

          <div className="profile-input-group full">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows="5" />
          </div>

          <div className="profile-input-group">
            <label>Ville</label>
            <select 
              name="villeId" 
              value={form.villeId} 
              onChange={handleChange} 
              className="profile-select"
              required
            >
              <option value="">Sélectionnez une ville</option>
              {VILLES_MAROC.map((v) => (
                <option key={v.id} value={v.id}>{v.nom}</option>
              ))}
            </select>
          </div>

          <div className="profile-input-group">
            <label>Prix par nuit (DH)</label>
            <input type="number" step="0.01" name="prix" value={form.prix} onChange={handleChange} />
          </div>

          <div className="profile-input-group">
            <label>Téléphone</label>
            <input name="telephone" value={form.telephone} onChange={handleChange} />
          </div>

          <div className="profile-input-group">
            <label>Lien Web / Réseaux</label>
            <input name="reseauSociaux" value={form.reseauSociaux} onChange={handleChange} placeholder="https://..." />
          </div>

          {/* GALERIE AVEC SUPPRESSION ET TAILLE FIXE */}
          {existingImages.length > 0 && (
            <div className="profile-input-group full">
              <label>Galerie actuelle (cliquez sur × pour supprimer)</label>
              <div style={{ display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }}>
                {existingImages.map((img, index) => (
                  <div key={index} style={{ position: "relative", width: "100px", height: "100px" }}>
                    <img 
                      src={getImageUrl(img)} 
                      alt="Aperçu" 
                      style={{ 
                        width: "100%", 
                        height: "100%", 
                        objectFit: "cover", 
                        borderRadius: "8px",
                        border: "2px solid #D4AF37"
                      }} 
                    />
                    <button 
                      type="button"
                      onClick={() => markImageForDeletion(img)}
                      style={{
                        position: "absolute", top: "-8px", right: "-8px",
                        background: "#e74c3c", color: "white", border: "none",
                        borderRadius: "50%", width: "24px", height: "24px",
                        cursor: "pointer", fontSize: "14px", fontWeight: "bold"
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="profile-input-group full">
            <label>Ajouter de nouvelles photos</label>
            <input type="file" multiple onChange={handleFileChange} className="file-input-custom" />
          </div>

          <div className="profile-actions-full">
            <button type="submit" className="profile-save-btn" disabled={submitting}>
              {submitting ? "Mise à jour..." : "Enregistrer les modifications"}
            </button>
            <button type="button" className="profile-back-link" onClick={() => navigate("/mes-lieux")}>
              Annuler
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
