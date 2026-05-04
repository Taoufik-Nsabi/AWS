import React, { useState, useEffect } from 'react';

export default function AvisList({ lieuId, refreshTrigger }) {
    const [avis, setAvis] = useState([]);
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvis = async () => {
        try {
            const token = localStorage.getItem('token'); 

            const response = await fetch(`http://localhost:8080/api/tourism/avis/lieu/${lieuId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Réponse avec Token :", data);
                setAvis(data);
            } else if (response.status === 401) {
                console.error("Non autorisé : Le token est absent ou expiré");
            }
        } catch (error) {
            console.error("Erreur lors du chargement des avis:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchAvis();
}, [lieuId, refreshTrigger]);

    if (loading) return <p className="loading-avis">Chargement des témoignages...</p>;

    return (
        <div className="reviews-container-dynamic">
            {avis.length > 0 ? (
                avis.map((a) => (
                    <div key={a.id} className="modern-review-card">
                        <div className="review-header">
                            <div className="user-info">
                                <i className="fas fa-user-circle"></i>
                                <strong>
                                    {a.email 
                                        ? a.email.split('@')[0] 
                                        : `Voyageur #${a.userId || 'Anonyme'}`}
                                </strong>
                            </div>
                            <span className="review-stars">
                                {[...Array(5)].map((_, i) => (
                                    <i key={i} className={`fa-star ${i < a.etoiles ? 'fas' : 'far'}`} 
                                       style={{ color: "#FFD700", fontSize: "0.8rem" }}></i>
                                ))}
                            </span>
                        </div>
                        <p className="review-comment">"{a.commentaire}"</p>
                    </div>
                ))
            ) : (
                <p className="no-reviews">Soyez le premier à partager votre expérience.</p>
            )}
        </div>
    );
}