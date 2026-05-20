import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/auth/login.css";
import { parseError } from "../../utils/apiError";
import { COUNTRIES } from "../../constants/countries";

import { API_BASE_URL } from "../../config/env";
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "820144815697-14imr6pm2vrurb2idctvoperfdvrgti0.apps.googleusercontent.com";

export default function Signup() {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);
  const googleInitRef = useRef(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    origin: "",
    profileImageFile: null,
    password: ""
  });

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
        navigate("/");
      }
    },
    [navigate]
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
          const errMsg = await parseError(response);
          setError(errMsg);
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

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profileImageFile") {
      setForm({ ...form, profileImageFile: files?.[0] || null });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = new FormData();
      payload.append("firstName", form.firstName);
      payload.append("lastName", form.lastName);
      payload.append("email", form.email);
      payload.append("phoneNumber", form.phoneNumber);
      payload.append("origin", form.origin);
      payload.append("password", form.password);

      if (form.profileImageFile) {
        payload.append("profileImageFile", form.profileImageFile);
      }

      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: "POST",
        body: payload
      });

      if (!response.ok) {
        const errMsg = await parseError(response);
        setError(errMsg);
        return;
      }

      let signupMessage = "Compte cree. Vous pouvez maintenant vous connecter.";

      try {
        const resendResponse = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email: form.email })
        });

        if (resendResponse.ok) {
          signupMessage = "Compte cree. Un email de verification a ete envoye.";
        } else {
          signupMessage =
            "Compte cree. Le service email de verification est indisponible pour le moment. Vous pouvez quand meme vous connecter.";
        }
      } catch {
        signupMessage =
          "Compte cree. Le service email de verification est indisponible pour le moment. Vous pouvez quand meme vous connecter.";
      }

      navigate("/login", {
        state: {
          message: signupMessage
        }
      });
    } catch {
      setError("Erreur serveur");
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
          <h2>Creer un compte</h2>
        </div>

        <form className="auth-form" onSubmit={handleSignup}>
          <div className="input-group">
            <label>Prenom</label>
            <input name="firstName" onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>Nom</label>
            <input name="lastName" onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input type="email" name="email" onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>Telephone</label>
            <input type="tel" name="phoneNumber" onChange={handleChange} />
          </div>

          <div className="input-group">
            <label>Pays d'origine</label>
            <input
              list="countries-list-signup"
              name="origin"
              value={form.origin}
              onChange={handleChange}
              placeholder="Selectionnez ou tapez un pays"
            />
            <datalist id="countries-list-signup">
              {COUNTRIES.map((country) => (
                <option key={country} value={country} />
              ))}
            </datalist>
          </div>

          <div className="input-group">
            <label>Photo de profil</label>
            <input type="file" name="profileImageFile" accept=".jpg,.jpeg,.png,.webp" onChange={handleChange} />
          </div>

          <div className="input-group">
            <label>Mot de passe</label>
            <input type="password" name="password" onChange={handleChange} required />
          </div>

          {error && (
            <div className="error-box">
              {error.split("\n").map((e, i) => (
                <p key={i} style={{ color: "red", margin: 0 }}>
                  {e}
                </p>
              ))}
            </div>
          )}

          <button className="auth-btn" disabled={loading}>
            {loading ? "Creation..." : "Creer mon compte"}
          </button>
        </form>

        <div className="auth-divider">ou</div>
        <div className="google-auth-wrapper" ref={googleButtonRef}></div>

        <p className="auth-footer">
          Deja membre ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
