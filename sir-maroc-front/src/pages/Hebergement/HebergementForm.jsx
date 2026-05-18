import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Hebergement/HebergementForm.css";
import { parseError } from "../../utils/apiError";
import { buildApiUrl } from "../../config/env";

export default function HebergementForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [villes, setVilles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [formData, setFormData] = useState({
    nom: "",
    adresse: "",
    description: "",
    reseauSociaux: "",
    villeId: "",
    prix: "",
    telephone: "",
    categories: "",
    images: [],
  });

  const categories = [
    { value: "hotel", label: "Hotel", icon: "H" },
    { value: "chambre", label: "Chambre", icon: "C" },
    { value: "studio", label: "Studio", icon: "S" },
    { value: "maison", label: "Maison", icon: "M" },
    { value: "appartement", label: "Appartement", icon: "A" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", {
        state: { message: "Veuillez vous connecter pour ajouter un hebergement." },
      });
      return;
    }

    const loadVilles = async () => {
      try {
        // On charge les vraies villes depuis l'API.
        const response = await fetch(buildApiUrl("/api/tourism/villes"));
        if (!response.ok) return;

        const data = await response.json();
        setVilles(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Ville fetch error:", error);
      }
    };

    loadVilles();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    const validImages = [];
    const previews = [];

    for (const file of files) {
      if (file.type.startsWith("image/")) {
        validImages.push(file);
        previews.push(URL.createObjectURL(file));
      }
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...validImages],
    }));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.nom) errors.nom = "Le nom de l'hebergement est requis";
    if (!formData.adresse) errors.adresse = "L'adresse est requise";
    if (!formData.description) errors.description = "La description est requise";
    if (!formData.villeId) errors.villeId = "Veuillez selectionner une ville";
    if (!formData.prix) errors.prix = "Le prix par nuit est requis";
    if (!formData.telephone) errors.telephone = "Le telephone est requis";
    if (!formData.categories) errors.categories = "Veuillez selectionner une categorie";
    if (formData.images.length === 0) errors.images = "Ajoutez au moins une photo";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    const submitData = new FormData();
    submitData.append("nom", formData.nom);
    submitData.append("adresse", formData.adresse);
    submitData.append("description", formData.description);
    submitData.append("reseauSociaux", formData.reseauSociaux);
    submitData.append("villeId", formData.villeId);
    submitData.append("prix", formData.prix);
    submitData.append("telephone", formData.telephone);
    submitData.append("categories", formData.categories);

    // On envoie toutes les images du formulaire.
    formData.images.forEach((image) => {
      submitData.append("images[]", image);
    });

    try {
      const response = await fetch(buildApiUrl("/api/tourism/hebergements"), {
        method: "POST",
        headers: {

          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      });

      if (response.ok) {
        alert("Hebergement ajoute avec succes !");
        navigate("/hebergements");
        return;
      }

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      // On garde le vrai message backend si possible.
      const message = await parseError(response);
      setFormErrors({ submit: message || "Erreur lors de l'ajout" });
    } catch (error) {
      console.error("Fetch Error:", error);
      setFormErrors({ submit: "Erreur de connexion au serveur" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hebergement-form-wrapper">
      <div className="hebergement-zellij-bg"></div>
      <div className=""></div>

      <div className="hebergement-form-container">
        <div className="form-header">
          <div className="form-header-icon">H</div>
          <h1>Ajouter un hebergement</h1>
          <p>Remplissez les informations ci-dessous pour ajouter votre etablissement</p>
        </div>

        <form onSubmit={handleSubmit} className="hebergement-form">
          <div className="form-section">
            <div className="section-title">
              <span className="section-number">01</span>
              <h2>Informations generales</h2>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Nom <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder="Ex: Riad Marrakech"
                  className={formErrors.nom ? "error" : ""}
                />
                {formErrors.nom && <span className="error-message">{formErrors.nom}</span>}
              </div>

              <div className="form-group">
                <label>
                  Telephone <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  placeholder="06 XX XX XX XX"
                  className={formErrors.telephone ? "error" : ""}
                />
                {formErrors.telephone && (
                  <span className="error-message">{formErrors.telephone}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Ville <span className="required">*</span>
                </label>
                <select
                  name="villeId"
                  value={formData.villeId}
                  onChange={handleChange}
                  className={formErrors.villeId ? "error" : ""}
                >
                  <option value="">Selectionnez une ville</option>
                  {villes.map((ville) => (
                    <option key={ville.id} value={ville.id}>
                      {ville.nom}
                    </option>
                  ))}
                </select>
                {formErrors.villeId && <span className="error-message">{formErrors.villeId}</span>}
              </div>

              <div className="form-group">
                <label>
                  Categorie <span className="required">*</span>
                </label>
                <select
                  name="categories"
                  value={formData.categories}
                  onChange={handleChange}
                  className={formErrors.categories ? "error" : ""}
                >
                  <option value="">Selectionnez</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
                {formErrors.categories && (
                  <span className="error-message">{formErrors.categories}</span>
                )}
              </div>
            </div>

            <div className="form-group full-width">
              <label>
                Adresse complete <span className="required">*</span>
              </label>
              <input
                type="text"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                className={formErrors.adresse ? "error" : ""}
              />
              {formErrors.adresse && <span className="error-message">{formErrors.adresse}</span>}
            </div>
          </div>

          <div className="form-section">
            <div className="section-title">
              <span className="section-number">02</span>
              <h2>Description & Tarifs</h2>
            </div>
            <div className="form-group full-width">
              <label>
                Description <span className="required">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                className={formErrors.description ? "error" : ""}
              ></textarea>
              {formErrors.description && (
                <span className="error-message">{formErrors.description}</span>
              )}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>
                  Prix par nuit (DH) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="prix"
                  value={formData.prix}
                  onChange={handleChange}
                  className={formErrors.prix ? "error" : ""}
                />
                {formErrors.prix && <span className="error-message">{formErrors.prix}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-title">
              <span className="section-number">03</span>
              <h2>Reseaux sociaux</h2>
            </div>
            <div className="form-group full-width">
              <label>Lien (Site, Instagram...)</label>
              <input
                type="url"
                name="reseauSociaux"
                value={formData.reseauSociaux}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="form-section">
            <div className="section-title">
              <span className="section-number">04</span>
              <h2>Photos</h2>
            </div>
            <div className="form-group full-width">
              <div className={`image-upload-area ${formErrors.images ? "error" : ""}`}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  id="image-upload"
                  style={{ display: "none" }}
                />
                <label htmlFor="image-upload" className="upload-label">
                  <i className="fas fa-cloud-upload-alt"></i>
                  <span>Cliquez pour ajouter des photos</span>
                </label>
              </div>
              {formErrors.images && <span className="error-message">{formErrors.images}</span>}
              <div className="image-previews">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="preview-item">
                    <img src={preview} alt="Apercu" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="remove-image"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate("/hebergements")}
            >
              Annuler
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Traitement..." : "Ajouter l'hebergement"}
            </button>
          </div>
          {formErrors.submit && <div className="submit-error">{formErrors.submit}</div>}
        </form>
      </div>
    </div>
  );
}
