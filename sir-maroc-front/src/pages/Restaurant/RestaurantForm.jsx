import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Restaurant/restaurant-form.css";
import { parseError } from "../../utils/apiError";
import { buildApiUrl } from "../../config/env";

const fallbackVilles = [
  { id: 1, nom: "Marrakech" },
  { id: 2, nom: "Fes" },
  { id: 3, nom: "Casablanca" },
  { id: 4, nom: "Agadir" },
  { id: 5, nom: "Chefchaouen" },
  { id: 6, nom: "Merzouga" },
  { id: 7, nom: "Ouarzazate" },
  { id: 8, nom: "Rabat" },
  { id: 9, nom: "Tanger" },
  { id: 10, nom: "Essaouira" },
];

export default function RestaurantForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [villes, setVilles] = useState(fallbackVilles);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [formData, setFormData] = useState({
    nom: "",
    adresse: "",
    description: "",
    reseauSociaux: "",
    villeId: "",
    prixMoyen: "",
    telephone: "",
    categorie: "",
    images: [],
  });

  const categories = [
    { value: "marocaine", label: "Marocain", icon: "\u{1F319}" },
    { value: "italienne", label: "Italien", icon: "\u{1F355}" },
    { value: "asiatique", label: "Asiatique", icon: "\u{1F962}" },
    { value: "cafe", label: "Cafe", icon: "\u2615" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") {
      navigate("/login", {
        state: { message: "Veuillez vous connecter pour ajouter un restaurant." },
      });
      return;
    }

    const loadVilles = async () => {
      try {
        const response = await fetch(buildApiUrl("/api/tourism/villes"));
        if (!response.ok) {
          setVilles(fallbackVilles);
          return;
        }

        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setVilles(data);
        } else {
          setVilles(fallbackVilles);
        }
      } catch (error) {
        console.error("Ville fetch error:", error);
        setVilles(fallbackVilles);
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
    if (!formData.nom) errors.nom = "Le nom du restaurant est requis";
    if (!formData.adresse) errors.adresse = "L'adresse est requise";
    if (!formData.villeId) errors.villeId = "Veuillez selectionner une ville";
    if (!formData.prixMoyen) errors.prixMoyen = "Le prix moyen est requis";
    if (!formData.telephone) errors.telephone = "Le telephone est requis";
    if (!formData.categorie) errors.categorie = "Veuillez selectionner une categorie";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") {
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
    submitData.append("prixMoyen", formData.prixMoyen);
    submitData.append("telephone", formData.telephone.replace(/\s/g, ""));
    submitData.append("categorie", formData.categorie);

    formData.images.forEach((image) => {
      submitData.append("images[]", image);
    });

    try {
      const response = await fetch(buildApiUrl("/api/tourism/restaurants"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      });

      if (response.ok) {
        alert("Restaurant ajoute avec succes !");
        navigate("/restaurants");
        return;
      }

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userRole");
        navigate("/login", {
          state: { message: "Votre session a expire. Veuillez vous reconnecter." },
        });
        return;
      }

      const message = await parseError(response);
      setFormErrors({ submit: message || "Erreur lors de l'ajout" });
    } catch (error) {
      console.error("Restaurant submit error:", error);
      setFormErrors({ submit: "Erreur de connexion au serveur" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-with-zellij">
      <div className="form-zellij-bg"></div>
      <div className="form-zellij-overlay"></div>

      <div className="restaurant-form-container">
        <div className="form-header">
          <div className="form-header-icon">R</div>
          <h1>Ajouter un nouveau restaurant</h1>
          <p>Remplissez les informations ci-dessous pour ajouter votre etablissement</p>
        </div>

        <form onSubmit={handleSubmit} className="restaurant-form">
          <div className="form-section">
            <div className="section-title">
              <span className="section-number">01</span>
              <h2>Informations generales</h2>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Nom du restaurant <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder="Ex: Dar Moha"
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
                  placeholder="0522XXXXXX"
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
                {formErrors.villeId && (
                  <span className="error-message">{formErrors.villeId}</span>
                )}
              </div>

              <div className="form-group">
                <label>
                  Categorie <span className="required">*</span>
                </label>
                <select
                  name="categorie"
                  value={formData.categorie}
                  onChange={handleChange}
                  className={formErrors.categorie ? "error" : ""}
                >
                  <option value="">Selectionnez une categorie</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
                {formErrors.categorie && (
                  <span className="error-message">{formErrors.categorie}</span>
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
                placeholder="Ex: 123 Rue de la Liberte, Marrakech"
                className={formErrors.adresse ? "error" : ""}
              />
              {formErrors.adresse && (
                <span className="error-message">{formErrors.adresse}</span>
              )}
            </div>
          </div>

          <div className="form-section">
            <div className="section-title">
              <span className="section-number">02</span>
              <h2>Description et tarifs</h2>
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Decrivez votre restaurant..."
                rows="5"
                className={formErrors.description ? "error" : ""}
              ></textarea>
              <div className="char-count">{formData.description.length}/2000</div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Prix moyen par personne <span className="required">*</span>
                </label>
                <div className="price-input">
                  <input
                    type="number"
                    name="prixMoyen"
                    value={formData.prixMoyen}
                    onChange={handleChange}
                    placeholder="150"
                    className={formErrors.prixMoyen ? "error" : ""}
                  />
                  <span className="price-suffix">DH</span>
                </div>
                {formErrors.prixMoyen && (
                  <span className="error-message">{formErrors.prixMoyen}</span>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-title">
              <span className="section-number">03</span>
              <h2>Lien web</h2>
            </div>
            <div className="form-group full-width">
              <label>URL du site ou reseau social</label>
              <input
                type="url"
                name="reseauSociaux"
                value={formData.reseauSociaux}
                onChange={handleChange}
                placeholder="https://www.instagram.com/votre_resto"
              />
            </div>
          </div>

          <div className="form-section">
            <div className="section-title">
              <span className="section-number">04</span>
              <h2>Photos du restaurant</h2>
            </div>

            <div className="form-group full-width">
              <label>Photos (Max 5MB par image)</label>
              <div className={`image-upload-area ${formErrors.images ? "error" : ""}`}>
                <input
                  type="file"
                  name="images"
                  accept="image/jpeg,image/png,image/webp"
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

              {imagePreviews.length > 0 && (
                <div className="image-previews">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="preview-item">
                      <img src={preview} alt="Apercu" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="remove-image"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate("/restaurants")}>
              Annuler
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Envoi..." : "Ajouter le restaurant"}
            </button>
          </div>

          {formErrors.submit && (
            <div className="submit-error">
              <i className="fas fa-exclamation-triangle"></i>
              {formErrors.submit}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
