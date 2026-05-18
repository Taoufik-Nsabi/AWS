import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../../styles/auth/login.css";
import { parseError } from "../../utils/apiError";

import { API_BASE_URL } from "../../config/env";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verification de votre email en cours...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Lien de verification invalide.");
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`
        );

        if (!response.ok) {
          const errorMessage = await parseError(response);
          setStatus("error");
          setMessage(errorMessage);
          return;
        }

        setStatus("success");
        setMessage("Email verifie avec succes. Redirection vers la connexion...");

        setTimeout(() => {
          navigate("/login", {
            replace: true,
            state: {
              message: "Email verifie avec succes. Vous pouvez maintenant vous connecter."
            }
          });
        }, 1800);
      } catch {
        setStatus("error");
        setMessage("Impossible de verifier votre email pour le moment.");
      }
    };

    verify();
  }, [navigate, searchParams]);

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <div className="auth-brand">
          <span className="auth-logo-text">SIR MAROC</span>
          <div className="auth-line"></div>
          <h2>Verification de l'email</h2>
        </div>

        <div
          className={status === "error" ? "error-box" : "info-box"}
          style={{
            backgroundColor: status === "error" ? "rgba(255, 77, 77, 0.08)" : "rgba(212, 175, 55, 0.1)",
            border: `1px solid ${status === "error" ? "#ff4d4d" : "#d4af37"}`,
            color: status === "error" ? "#ff4d4d" : "#d4af37",
            padding: "14px",
            borderRadius: "8px",
            textAlign: "center",
            lineHeight: 1.5
          }}
        >
          {message}
        </div>
      </div>
    </div>
  );
}
