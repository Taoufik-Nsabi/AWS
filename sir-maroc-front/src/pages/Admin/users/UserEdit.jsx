import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { parseError } from "../../../utils/apiError";
import "../../../styles/admin/AdminUsers.css";
import { COUNTRIES } from "../../../constants/countries";

const API_BASE = "http://localhost:8080";

export default function UserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    origin: "",
    profileImageUrl: "",
    profileImageFile: null,
    password: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE}/api/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(await parseError(response));
        }

        const data = await response.json();
        setForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          origin: data.origin || "",
          profileImageUrl: data.profileImageUrl || "",
          profileImageFile: null,
          password: "",
        });
      } catch (err) {
        setError(err.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profileImageFile") {
      setForm((prev) => ({ ...prev, profileImageFile: files?.[0] || null }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const payload = new FormData();
      payload.append("firstName", form.firstName);
      payload.append("lastName", form.lastName);
      payload.append("email", form.email);
      payload.append("phoneNumber", form.phoneNumber);
      payload.append("origin", form.origin);
      payload.append("profileImageUrl", form.profileImageUrl);
      payload.append("password", form.password);

      if (form.profileImageFile) {
        payload.append("profileImageFile", form.profileImageFile);
      }

      const response = await fetch(`${API_BASE}/api/users/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      if (!response.ok) {
        throw new Error(await parseError(response));
      }

      setSuccess("Utilisateur modifie avec succes.");
      setTimeout(() => navigate("/admin/users/list"), 900);
    } catch (err) {
      setError(err.message || "Erreur de mise a jour");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page-container users-page">
        <div className="users-card">
          <div className="users-empty">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container users-page">
      <div className="admin-page-header">
        <h1 className="admin-title">Modifier l'utilisateur #{id}</h1>
        <p className="admin-subtitle">Met a jour les informations du compte.</p>
      </div>

      <div className="users-toolbar users-toolbar-inline">
        <Link to="/admin/users/list" className="users-back-link">
          Retour a la liste des utilisateurs
        </Link>
      </div>

      {error && <div className="users-alert error">{error}</div>}
      {success && <div className="users-alert success">{success}</div>}

      <div className="users-card users-form-card">
        <form className="users-form-grid" onSubmit={handleSubmit}>
          <div className="users-form-group">
            <label>Prenom</label>
            <input name="firstName" value={form.firstName} onChange={handleChange} required />
          </div>

          <div className="users-form-group">
            <label>Nom</label>
            <input name="lastName" value={form.lastName} onChange={handleChange} required />
          </div>

          <div className="users-form-group">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>

          <div className="users-form-group">
            <label>Telephone</label>
            <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
          </div>

          <div className="users-form-group">
            <label>Pays d'origine</label>
            <input
              list="countries-list-admin-user"
              name="origin"
              value={form.origin}
              onChange={handleChange}
              placeholder="Selectionnez ou tapez un pays"
            />
            <datalist id="countries-list-admin-user">
              {COUNTRIES.map((country) => (
                <option key={country} value={country} />
              ))}
            </datalist>
          </div>

          <div className="users-form-group">
            <label>Photo de profil</label>
            {form.profileImageUrl ? (
              <div className="users-image-preview-wrapper">
                <img src={form.profileImageUrl} alt="Profil actuel" className="users-image-preview" />
              </div>
            ) : null}
            <input
              type="file"
              name="profileImageFile"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleChange}
            />
            <small className="users-help-text">Formats acceptes: jpg, jpeg, png, webp. Taille max 5 Mo.</small>
          </div>

          <div className="users-form-group users-form-group-full">
            <label>Nouveau mot de passe (optionnel)</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Laisser vide pour conserver l'ancien"
            />
          </div>

          <div className="users-form-actions">
            <button type="button" className="users-secondary-btn" onClick={() => navigate("/admin/users/list")}>
              Annuler
            </button>
            <button type="submit" className="users-action-btn" disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
