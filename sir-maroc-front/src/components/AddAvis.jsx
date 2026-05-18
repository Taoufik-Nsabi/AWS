import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/AddAvis.css";
import { buildApiUrl } from "../config/env";

export default function AddAvis({ lieuId, onAvisAdded }) {
    const [showForm, setShowForm] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: null, message: "" }); // Pour gérer les messages UX
    
    const navigate = useNavigate();

    const handleOpenForm = () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login", { 
                state: { 
                    message: "Veuillez vous connecter pour partager votre expérience.",
                    from: window.location.pathname 
                } 
            }); 
            return;
        }
        setShowForm(true);
        setStatus({ type: null, message: "" }); // Reset messages
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        
        setLoading(true);
        setStatus({ type: null, message: "" });

        const avisData = {
            commentaire: comment,
            etoiles: rating,
            lieuId: parseInt(lieuId)
        };

        try {
            const response = await fetch(buildApiUrl("/api/tourism/avis"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(avisData)
            });

            if (response.status === 401) {
                localStorage.clear();
                navigate("/login", { state: { message: "Votre session a expiré." } });
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Erreur lors de la création de l'avis");
            }

            // --- GESTION DU SUCCÈS UX ---
            if (onAvisAdded) onAvisAdded(data);

            setComment("");
            setRating(5);
            setShowForm(false);
            
            // On affiche un message de succès stylé au lieu d'une alert
            setStatus({ type: "success", message: "Merci ! Votre témoignage a été publié." });

            // On fait disparaître le message après 4 secondes
            setTimeout(() => setStatus({ type: null, message: "" }), 4000);

        } catch (error) {
            setStatus({ type: "error", message: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-avis-wrapper">
            {/* Affichage du message de succès ou d'erreur */}
            {status.message && (
                <div className={`status-message-inline ${status.type}`}>
                    <i className={status.type === "success" ? "fas fa-check-circle" : "fas fa-exclamation-circle"}></i>
                    {status.message}
                </div>
            )}

            {!showForm ? (
                <button className="btn-open-avis" onClick={handleOpenForm}>
                    <i className="fas fa-pen-fancy"></i> Partager mon expérience
                </button>
            ) : (
                <form className="avis-form-luxury" onSubmit={handleSubmit}>
                    <h4 className="avis-form-title">Votre Témoignage</h4>

                    <div className="rating-selector">
                        <span>Note :</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <i
                                key={star}
                                className={`fa-star ${star <= rating ? 'fas' : 'far'}`}
                                onClick={() => setRating(star)}
                                style={{ cursor: "pointer", color: "#FFD700", margin: "0 2px" }}
                            ></i>
                        ))}
                    </div>

                    <textarea
                        className="avis-input"
                        placeholder="Racontez-nous la magie de ce lieu..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                    />

                    <div className="avis-form-actions">
                        <button type="submit" className="btn-submit-avis" disabled={loading}>
                            {loading ? (
                                <><i className="fas fa-spinner fa-spin"></i> Publication...</>
                            ) : (
                                "Publier l'avis"
                            )}
                        </button>

                        <button 
                            type="button" 
                            className="btn-cancel-avis"
                            onClick={() => setShowForm(false)}
                            disabled={loading}
                        >
                            Annuler
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
