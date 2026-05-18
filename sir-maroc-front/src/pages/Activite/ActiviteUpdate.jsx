import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/Profile/LieuUpdate.css";
import { buildApiUrl, buildTourismAssetUrl } from "../../config/env";

export default function ActiviteUpdate() {
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
    tarif: "",
    duree: "",
    telephone: "" // Ajouté si besoin comme pour restaurant
  });

  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  // ================= CHARGEMENT DES DONNÉES =================
  useEffect(() => {
    const loadActivite = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(buildApiUrl(`/api/tourism/activites/${id}`), {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json" 
          }
        });

        if (!res.ok) throw new Error("Impossible de charger l'activité");

        const data = await res.json();
        setForm({
          nom: data.nom || "",
          adresse: data.adresse || "",
          description: data.description || "",
          reseauSociaux: data.reseauSociaux || "",
          villeId: data.villeId || "",
          tarif: data.tarif || "",
          duree: data.duree || "",
          telephone: data.telephone || ""
        });
        setExistingImages(data.images || []);
      } catch (err) {
        console.error(err);
        alert("Erreur lors du chargement de l'activité");
      } finally {
        setLoading(false);
      }
    };
    if (id) loadActivite();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const markImageForDeletion = (imgUrl) => {
    setImagesToDelete((prev) => [...prev, imgUrl]);
    setExistingImages((prev) => prev.filter((img) => img !== imgUrl));
  };

  // ================= SOUMISSION DU FORMULAIRE =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem("token");
    const fd = new FormData();

    // Trick pour Symfony : On envoie en POST mais on demande un PUT
    fd.append("_method", "PUT");

    // Ajout des champs avec conversion de types
    Object.keys(form).forEach(k => {
        if (k === 'villeId') fd.append(k, parseInt(form[k]) || "");
        else if (k === 'tarif') fd.append(k, parseFloat(form[k]) || "");
        else fd.append(k, form[k]);
    });

    // Gestion des images
    newImages.forEach(img => fd.append("images[]", img));
    imagesToDelete.forEach(img => fd.append("deletedImages[]", img));

    try {
      const res = await fetch(buildApiUrl(`/api/tourism/activites/${id}`), {
        method: "POST",
        headers: { 
            "Authorization": `Bearer ${token}`, 
            "Accept": "application/json" 
        },
        body: fd
      });

      const text = await res.text();
      const result = text ? JSON.parse(text) : {};

      if (res.ok) {
        alert("Activité mise à jour avec succès !");
        navigate("/mes-lieux");
      } else {
        alert(`Erreur: ${result.message || "Veuillez vérifier vos données"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion au serveur");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="profile-auth-wrapper"><p>Chargement des données...</p></div>;

  return (
    <div className="profile-auth-wrapper">
      <div className="update-container">
        <h1 className="profile-logo-text">Modifier l'Activité</h1>
        
        <form className="update-form-grid" onSubmit={handleSubmit}>
          
          <div className="profile-input-group">
            <label>Nom de l'activité</label>
            <input name="nom" value={form.nom} onChange={handleChange} required />
          </div>

          <div className="profile-input-group">
            <label>Tarif (en DH)</label>
            <input type="number" name="tarif" value={form.tarif} onChange={handleChange} />
          </div>

          <div className="profile-input-group">
            <label>Durée estimée</label>
            <input name="duree" value={form.duree} onChange={handleChange} placeholder="ex: 2h, 1 journée..." />
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
            <input name="reseauSociaux" value={form.reseauSociaux} onChange={handleChange} placeholder="https://..." />
          </div>

          <div className="profile-input-group full">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows="4" />
          </div>

         {existingImages.length > 0 && (
  <div className="profile-input-group full">
    <label>Images actuelles</label>
    <div className="image-preview-list" style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
      {existingImages.map((img, i) => {
        const cleanPath = img.startsWith('/') ? img.substring(1) : img;
        const finalUrl = buildTourismAssetUrl(cleanPath);

        return (
          <div key={i} style={{ position: "relative" }}>
            <img 
              src={finalUrl} 
              alt={`Activite ${i}`} 
              style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px", border: "1px solid #ddd" }}
              onError={(e) => { e.target.src = "https://via.placeholder.com/100?text=Erreur+Lien"; }} 
            />
            <button 
              type="button" 
              onClick={() => markImageForDeletion(img)} 
              style={{ position: "absolute", top: "-5px", right: "-5px", background: "#ff4d4d", color: "white", border: "none", borderRadius: "50%", cursor: "pointer", width: "22px", height: "22px", fontWeight: "bold" }}
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
            {submitting ? "Enregistrement en cours..." : "Enregistrer les modifications"}
          </button>
          
        </form>
      </div>
    </div>
  );
}
