import React, { useCallback, useEffect, useRef, useState } from "react";
import "../../styles/auth/login.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { parseError } from "../../utils/apiError";

import { API_BASE_URL } from "../../config/env";
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "820144815697-14imr6pm2vrurb2idctvoperfdvrgti0.apps.googleusercontent.com";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const googleButtonRef = useRef(null);
  const googleInitRef = useRef(false);

  const alertMessage = location.state?.message;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const completeLogin = useCallback(
    (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", String(data.userId));
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem("userRole", data.role);

      const role = data.role;
      if (role === "Admin" || role === "ADMIN" || role === "ROLE_ADMIN") {
        navigate("/admin");
      } else {
        const redirectTo = location.state?.from || "/";
        navigate(redirectTo);
      }
    },
    [navigate, location.state]
  );

  const handleGoogleCredential = useCallback(
    async (googleResponse) => {
      if (!googleResponse?.credential) {
        setError("Google n'a pas retourne de jeton valide.");
        return;
      }

      setError("");
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/google-login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ idToken: googleResponse.credential })
        });

        if (!response.ok) {
          const msg = await parseError(response);
          setError(msg);
          return;
        }

        const data = await response.json();
        completeLogin(data);
      } catch {
        setError("Erreur serveur pendant l'authentification Google.");
      } finally {
        setLoading(false);
      }
    },
    [completeLogin]
  );

  useEffect(() => {
    if (location.state?.message) {
      const timer = setTimeout(() => {
        navigate(location.pathname, { replace: true, state: { ...location.state, message: null } });
      }, 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [location.state, navigate, location.pathname]);

  useEffect(() => {
    const initGoogleButton = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current || googleInitRef.current) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential
      });

      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "continue_with",
        shape: "rectangular"
      });

      googleInitRef.current = true;
    };

    if (window.google?.accounts?.id) {
      initGoogleButton();
      return undefined;
    }

    const existingScript = document.querySelector("script[data-google-identity='true']");
    if (existingScript) {
      existingScript.addEventListener("load", initGoogleButton);
      return () => existingScript.removeEventListener("load", initGoogleButton);
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = "true";
    script.addEventListener("load", initGoogleButton);
    document.head.appendChild(script);

    return () => script.removeEventListener("load", initGoogleButton);
  }, [handleGoogleCredential]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const msg = await parseError(response);
        setError(msg);
        return;
      }

      const data = await response.json();
      completeLogin(data);
    } catch {
      setError("Erreur serveur, veuillez reessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        {alertMessage && !error && (
          <div
            className="info-box"
            style={{
              backgroundColor: "rgba(212, 175, 55, 0.1)",
              border: "1px solid #d4af37",
              color: "#d4af37",
              padding: "10px",
              marginBottom: "20px",
              borderRadius: "4px",
              textAlign: "center",
              fontSize: "0.9rem"
            }}
          >
            <i className="fas fa-info-circle" style={{ marginRight: "8px" }}></i>
            {alertMessage}
          </div>
        )}

        <div className="auth-brand">
          <span className="auth-logo-text">SIR MAROC</span>
          <div className="auth-line"></div>
          <h2>Bienvenue dans votre Palais</h2>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
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

          <div className="input-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="********"
            />
          </div>

          <div style={{ textAlign: "right", marginTop: "-10px", marginBottom: "16px" }}>
            <Link to="/forgot-password" style={{ fontSize: "0.85rem", color: "#0f5a43" }}>
              Mot de passe oublie ?
            </Link>
          </div>

          {error && (
            <div className="error-box" style={{ marginBottom: "15px" }}>
              {error.split("\n").map((e, i) => (
                <p key={i} style={{ color: "#ff4d4d", margin: 0, fontSize: "0.85rem" }}>
                  {e}
                </p>
              ))}
            </div>
          )}

          <button className="auth-btn" disabled={loading} type="submit">
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="auth-divider">ou</div>
        <div className="google-auth-wrapper" ref={googleButtonRef}></div>

        <p className="auth-footer">
          Pas encore membre ? <Link to="/signup">Creer un compte</Link>
        </p>
      </div>
    </div>
  );
}
