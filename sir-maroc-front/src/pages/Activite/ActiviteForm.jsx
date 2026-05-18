import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Activite/ActiviteForm.css"; 
import { buildApiUrl } from "../../config/env";

export default function ActiviteForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { message: "Veuillez vous connecter pour proposer une activité." } });
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    description: '',
    reseauSociaux: '',
    villeId: '',
    tarif: '',
    duree: '',
    categorie: '',
    images: []
  });

  const [imagePreviews, setImagePreviews] = useState([]);

  const villes = [
    { id: 1, nom: "Marrakech" }, { id: 2, nom: "Fès" }, { id: 3, nom: "Casablanca" },
    { id: 4, nom: "Agadir" }, { id: 5, nom: "Chefchaouen" }, { id: 6, nom: "Rabat" },
    { id: 7, nom: "Tanger" }, { id: 8, nom: "Oujda" }, { id: 9, nom: "Meknès" },
    { id: 11, nom: "Essaouira" }
  ];

  const categories = [
    { value: 'sport', label: 'Sport', icon: '🏃' },
    { value: 'culture', label: 'Culture', icon: '🏛️' },
    { value: 'aventure', label: 'Aventure', icon: '🧭' },
    { value: 'detente', label: 'Détente', icon: '🧘' },
    { value: 'gastronomie', label: 'Gastronomie', icon: '🍲' },
    { value: 'decouverte', label: 'Découverte', icon: '🔭' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validImages = [];
    const previews = [];

    for (let file of files) {
      if (file.type.startsWith('image/')) {
        validImages.push(file);
        previews.push(URL.createObjectURL(file));
      }
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validImages]
    }));
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.nom) errors.nom = "Le nom est requis";
    if (!formData.adresse) errors.adresse = "L'adresse est requise";
    if (!formData.villeId) errors.villeId = "Sélectionnez une ville";
    if (!formData.tarif) errors.tarif = "Le tarif est requis (0 si gratuit)";
    if (!formData.duree) errors.duree = "La durée est requise (en minutes)";
    if (!formData.categorie) errors.categorie = "Sélectionnez une catégorie";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    if (!validateForm()) return;

    setLoading(true);
    const submitData = new FormData();
    
    // Mapping direct avec ton DTO PHP
    submitData.append('nom', formData.nom);
    submitData.append('adresse', formData.adresse);
    submitData.append('description', formData.description);
    submitData.append('reseauSociaux', formData.reseauSociaux);
    submitData.append('villeId', formData.villeId);
    submitData.append('tarif', formData.tarif);
    submitData.append('duree', formData.duree);
    submitData.append('categorie', formData.categorie);
    
    formData.images.forEach(image => {
      submitData.append('images[]', image);
    });

    try {
      const response = await fetch(buildApiUrl("/api/tourism/activites"), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: submitData
      });
      
      if (response.ok) {
        alert('Activité ajoutée avec succès !');
        navigate('/activites');
      } else {
        const errorData = await response.json();
        setFormErrors({ submit: errorData.message || 'Erreur lors de l\'ajout' });
      }
    } catch (error) {
      setFormErrors({ submit: 'Erreur de connexion au serveur' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hebergement-form-wrapper">
      <div className="hebergement-zellij-bg"></div>
      <div className="hebergement-zellij-overlay"></div>
      
      <div className="hebergement-form-container">
        <div className="form-header">
          <h1>Proposer une activité</h1>
          <p>Partagez une expérience unique au cœur du Royaume</p>
        </div>

        <form onSubmit={handleSubmit} className="hebergement-form">
          {/* SECTION 01 */}
          <div className="form-section">
            <div className="section-title">
              <span className="section-number">01</span>
              <h2>Détails de l'expérience</h2>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Nom de l'activité <span className="required">*</span></label>
                <input type="text" name="nom" value={formData.nom} onChange={handleChange} placeholder="Ex: Randonnée Atlas" className={formErrors.nom ? 'error' : ''} />
                {formErrors.nom && <span className="error-message">{formErrors.nom}</span>}
              </div>

              <div className="form-group">
                <label>Catégorie <span className="required">*</span></label>
                <select name="categorie" value={formData.categorie} onChange={handleChange} className={formErrors.categorie ? 'error' : ''}>
                  <option value="">Sélectionnez</option>
                  {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>)}
                </select>
                {formErrors.categorie && <span className="error-message">{formErrors.categorie}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ville <span className="required">*</span></label>
                <select name="villeId" value={formData.villeId} onChange={handleChange} className={formErrors.villeId ? 'error' : ''}>
                  <option value="">Où se situe l'activité ?</option>
                  {villes.map(v => <option key={v.id} value={v.id}>{v.nom}</option>)}
                </select>
                {formErrors.villeId && <span className="error-message">{formErrors.villeId}</span>}
              </div>

              <div className="form-group">
                <label>Adresse <span className="required">*</span></label>
                <input type="text" name="adresse" value={formData.adresse} onChange={handleChange} placeholder="Lieu exact" className={formErrors.adresse ? 'error' : ''} />
                {formErrors.adresse && <span className="error-message">{formErrors.adresse}</span>}
              </div>
            </div>
          </div>

          {/* SECTION 02 */}
          <div className="form-section">
            <div className="section-title"><span className="section-number">02</span><h2>Description & Logistique</h2></div>
            <div className="form-group full-width">
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Que vont vivre les participants ?"></textarea>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Tarif (DH) <span className="required">*</span></label>
                <input type="number" name="tarif" value={formData.tarif} onChange={handleChange} placeholder="0 pour gratuit" />
              </div>
              <div className="form-group">
                <label>Durée estimée (minutes) <span className="required">*</span></label>
                <input type="number" name="duree" value={formData.duree} onChange={handleChange} placeholder="Ex: 120" />
              </div>
            </div>
          </div>

          {/* SECTION 03 */}
          <div className="form-section">
            <div className="section-title"><span className="section-number">03</span><h2>Contact & Médias</h2></div>
            <div className="form-group full-width">
              <label>Lien Réseaux Sociaux / Site Web</label>
              <input type="url" name="reseauSociaux" value={formData.reseauSociaux} onChange={handleChange} placeholder="https://instagram.com/..." />
            </div>

            <div className="form-group full-width">
              <div className={`image-upload-area ${formErrors.images ? 'error' : ''}`}>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} id="image-upload" style={{ display: 'none' }} />
                <label htmlFor="image-upload" className="upload-label">
                  <i className="fas fa-camera"></i>
                  <span>Ajouter des photos de l'activité</span>
                </label>
              </div>
              <div className="image-previews">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="preview-item">
                    <img src={preview} alt="Aperçu" />
                    <button type="button" onClick={() => removeImage(index)} className="remove-image">×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/activites')}>Annuler</button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Envoi en cours...' : 'Publier l\'activité'}
            </button>
          </div>
          {formErrors.submit && <div className="submit-error">{formErrors.submit}</div>}
        </form>
      </div>
    </div>
  );
}
