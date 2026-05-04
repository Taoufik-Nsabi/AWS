import React from 'react';
import "../styles/Footer.css"; 

function Footer() {
  return (
    <footer id="contact" className="footer-v2">
      <div className="footer-v2__inner">
        
        {/* LOGO SECTION */}
        <div className="footer-v2__top">
          <div className="footer-v2__logo">SIR MAROC</div>
        </div>

        <div className="footer-v2__bottom">
          {/* CONTACT SECTION */}
          <div className="footer-v2__contact">
            <div className="footer-v2__contactIcon">
              <i className="fas fa-envelope-open-text"></i> {/* Utilise FontAwesome si dispo */}
            </div>

            <div>
              <p className="footer-v2__label">CONTACTEZ-NOUS</p>
              <a href="mailto:contact@sirmaroc.com" className="footer-v2__email">
                contact@sirmaroc.com
              </a>
            </div>
          </div>

          {/* META & LINKS */}
          <div className="footer-v2__meta">
            <p className="footer-v2__copy">
              © 2026 <strong>SirMaroc</strong> | Palace Gastronomique & Touristique
            </p>

            <div className="footer-v2__links">
              <a href="/privacy">Confidentialité</a>
              <span>|</span>
              <a href="/terms">Conditions</a>
              <span>|</span>
              <a href="/support">Aide</a>
            </div>
          </div>
        </div>

        {/* BOUTON RETOUR EN HAUT */}
        <a href="#top" className="footer-v2__scrollTop" title="Retour au sommet">
          <i className="fas fa-chevron-up"></i> ↑
        </a>
      </div>
    </footer>
  );
}

export default Footer;