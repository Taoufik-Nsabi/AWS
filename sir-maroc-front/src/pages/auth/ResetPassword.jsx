import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "../../styles/auth/login.css";
import { parseError } from "../../utils/apiError";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("Lien invalide: token manquant.");
        setTokenValid(false);
        setValidating(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/auth/reset-password?token=${encodeURIComponent(token)}`
        );

        if (!response.ok) {
          const msg = await parseError(response);
          setError(msg);
          setTokenValid(false);
          return;
        }

        setTokenValid(true);
      } catch {
        setError("Erreur serveur pendant la validation du lien.");
        setTokenValid(false);
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword })
      });

      if (!response.ok) {
        const msg = await parseError(response);
        setError(msg);
        return;
      }

      const data = await response.json();
      setMessage(data.message || "Mot de passe reinitialise avec succes.");
      setNewPassword("");
      setConfirmPassword("");
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
          <h2>Reinitialiser le mot de passe</h2>
        </div>

        {validating && <p>Validation du lien...</p>}

        {!validating && (
          <>
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

            {tokenValid && (
              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>Nouveau mot de passe</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Confirmer le mot de passe</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button className="auth-btn" disabled={loading} type="submit">
                  {loading ? "Enregistrement..." : "Mettre a jour"}
                </button>
              </form>
            )}
          </>
        )}

        <p className="auth-footer">
          Retour a la <Link to="/login">connexion</Link>
        </p>
      </div>
    </div>
  );
}

