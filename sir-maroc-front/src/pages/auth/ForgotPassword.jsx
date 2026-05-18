import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/auth/login.css";
import { parseError } from "../../utils/apiError";

import { API_BASE_URL } from "../../config/env";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const msg = await parseError(response);
        setError(msg);
        return;
      }

      const data = await response.json();
      setMessage(data.message || "Si cet email existe, un message a ete envoye.");
    } catch {
      setError("Erreur serveur, veuillez reessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="auth-brand">
          <span className="auth-logo-text">SIR MAROC</span>
          <div className="auth-line"></div>
          <h2>Mot de passe oublie</h2>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="votre@email.com"
            />
          </div>

          {message && (
            <div className="info-box" style={{ marginBottom: "15px", color: "#0f5a43" }}>
              {message}
            </div>
          )}

          {error && (
            <div className="error-box" style={{ marginBottom: "15px" }}>
              {error}
            </div>
          )}

          <button className="auth-btn" disabled={loading} type="submit">
            {loading ? "Envoi..." : "Envoyer le lien"}
          </button>
        </form>

        <p className="auth-footer">
          Retour a la <Link to="/login">connexion</Link>
        </p>
      </div>
    </div>
  );
}

