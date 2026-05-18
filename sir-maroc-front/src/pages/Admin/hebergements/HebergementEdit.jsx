import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../../styles/admin/AdminForms.css";
import { buildApiUrl, buildTourismAssetUrl } from "../../../config/env";

const VILLES_MAROC = [
  { id: 1, nom: "Marrakech" },
  { id: 2, nom: "Fes" },
  { id: 3, nom: "Casablanca" },
  { id: 4, nom: "Agadir" },
  { id: 5, nom: "Chefchaouen" },
  { id: 6, nom: "Rabat" },
  { id: 7, nom: "Tanger" },
  { id: 8, nom: "Oujda" },
  { id: 9, nom: "Meknes" },
  { id: 10, nom: "Tetouan" },
  { id: 11, nom: "Essaouira" },
  { id: 12, nom: "Ouarzazate" },
  { id: 13, nom: "Ifrane" },
  { id: 14, nom: "Dakhla" },
  { id: 15, nom: "Nador" },
  { id: 16, nom: "Al Hoceima" },
  { id: 17, nom: "Beni Mellal" },
  { id: 18, nom: "Khouribga" },
  { id: 19, nom: "Safi" },
  { id: 20, nom: "El Jadida" },
];

function buildImageUrl(imagePath) {
  if (!imagePath) return "";
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return buildTourismAssetUrl(cleanPath);
}

export default function HebergementEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    nom: "",
    categories: "",
    villeId: "",
    adresse: "",
    telephone: "",
    prix: "",
    description: "",
    reseauSociaux: "",
  });
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [newImages, setNewImages] = useState([]);

  useEffect(() => {
    const loadHebergement = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(buildApiUrl(`/api/tourism/hebergements/${id}`), {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erreur lors du chargement de l'hebergement");
        }

        const data = await response.json();
        setFormData({
          nom: data.nom || "",
          categories: data.categories || "",
          villeId: data.villeId || "",
          adresse: data.adresse || "",
          telephone: data.telephone || "",
          prix: data.prix || "",
          description: data.description || "",
          reseauSociaux: data.reseauSociaux || "",
        });
        setExistingImages(Array.isArray(data.images) ? data.images : []);
      } catch (error) {
        alert("Impossible de charger les donnees de l'hebergement.");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadHebergement();
    }
  }, [id, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    setNewImages(Array.from(event.target.files || []));
  };

  const markImageForDeletion = (imagePath) => {
    setImagesToDelete((prev) => [...prev, imagePath]);
    setExistingImages((prev) => prev.filter((img) => img !== imagePath));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError("");

    try {
      const token = localStorage.getItem("token");
      const payload = new FormData();
      const sanitizedPhone = formData.telephone.replace(/\D/g, "");
      const trimmedSocials = formData.reseauSociaux.trim();
      const trimmedCategories = formData.categories.trim();

      payload.append("nom", formData.nom);
      payload.append("villeId", formData.villeId);
      payload.append("adresse", formData.adresse);
      payload.append("prix", formData.prix);
      payload.append("description", formData.description);

      if (trimmedCategories) {
        payload.append("categories", trimmedCategories);
      }

      if (sanitizedPhone) {
        payload.append("telephone", sanitizedPhone);
      }

      if (trimmedSocials) {
        payload.append("reseauSociaux", trimmedSocials);
      }

      newImages.forEach((file) => payload.append("images[]", file));
      imagesToDelete.forEach((imagePath) => payload.append("deletedImages[]", imagePath));

      const response = await fetch(buildApiUrl(`/api/tourism/hebergements/${id}`), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: payload,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const fieldErrors = errorData.errors
          ? Object.values(errorData.errors).join(" | ")
          : "";
        throw new Error(fieldErrors || errorData.message || "La mise a jour a echoue.");
      }

      navigate("/admin/hebergements/approved");
    } catch (error) {
      setFormError(error.message || "Erreur de connexion au serveur.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="admin-loader">Chargement des donnees...</div>;
  }

  return (
    <div className="admin-page-content">
      <div className="admin-top-nav">
        <div className="breadcrumb">
          <span onClick={() => navigate("/admin")}>Admin</span>
          <i className="fas fa-chevron-right"></i>
          <span onClick={() => navigate(-1)}>Hebergements</span>
          <i className="fas fa-chevron-right"></i>
          <span className="current">Modifier l'hebergement #{id}</span>
        </div>

        <button className="btn-close-details" onClick={() => navigate(-1)} title="Fermer">
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="form-container-luxury">
        <form onSubmit={handleSubmit} className="admin-luxury-form">
          {formError ? <div className="users-alert error">{formError}</div> : null}
          <div className="form-grid">
            <div className="form-section">
              <h3>
                <i className="fas fa-info-circle"></i> Informations Generales
              </h3>

              <div className="input-group">
                <label>Nom de l'etablissement</label>
                <input type="text" name="nom" value={formData.nom} onChange={handleChange} required />
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label>Categorie</label>
                  <select
                    name="categories"
                    value={formData.categories}
                    onChange={handleChange}
                  >
                    <option value="">Selectionnez une categorie</option>
                    <option value="hotel">Hotel</option>
                    <option value="chambre">Chambre</option>
                    <option value="studio">Studio</option>
                    <option value="maison">Maison</option>
                    <option value="appartement">Appartement</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Prix moyen (DH)</label>
                  <input type="number" name="prix" value={formData.prix} onChange={handleChange} />
                </div>
              </div>

              <div className="input-group">
                <label>Description</label>
                <textarea name="description" rows="5" value={formData.description} onChange={handleChange}></textarea>
              </div>

              {existingImages.length > 0 ? (
                <div className="input-group">
                  <label>Photos actuelles</label>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "12px" }}>
                    {existingImages.map((img, index) => (
                      <div key={`${img}-${index}`} style={{ position: "relative", width: "100px", height: "100px" }}>
                        <img
                          src={buildImageUrl(img)}
                          alt={`Hebergement ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "8px",
                            border: "2px solid #D4AF37",
                          }}
                          onError={(event) => {
                            event.currentTarget.src = "https://placehold.co/100x100/f5f1ea/3d0a0c?text=Image";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => markImageForDeletion(img)}
                          style={{
                            position: "absolute",
                            top: "-8px",
                            right: "-8px",
                            background: "#e74c3c",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "24px",
                            height: "24px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "bold",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="input-group">
                <label>Ajouter de nouvelles photos</label>
                <input type="file" multiple onChange={handleFileChange} />
              </div>
            </div>

            <div className="form-section">
              <h3>
                <i className="fas fa-map-marker-alt"></i> Contact & Localisation
              </h3>

              <div className="input-group">
                <label>Ville</label>
                <select name="villeId" value={formData.villeId} onChange={handleChange}>
                  <option value="">Selectionnez une ville</option>
                  {VILLES_MAROC.map((ville) => (
                    <option key={ville.id} value={ville.id}>
                      {ville.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Adresse complete</label>
                <input type="text" name="adresse" value={formData.adresse} onChange={handleChange} />
              </div>

              <div className="input-group">
                <label>Telephone</label>
                <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} />
              </div>

              <div className="input-group">
                <label>Reseaux sociaux / site</label>
                <input type="text" name="reseauSociaux" value={formData.reseauSociaux} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>
              Annuler
            </button>
            <button type="submit" className="btn-submit-gold" disabled={submitting}>
              <i className="fas fa-save"></i> {submitting ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
