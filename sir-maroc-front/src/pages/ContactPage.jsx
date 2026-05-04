import React from "react";
import "../styles/Contact.css";

export default function ContactPage() {
  return (
    <section id="contact" className="contact-section">
      <div className="contact-container">
        
        <div className="contact-map-container">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3412.5645!2d-7.61!3d33.57!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd0b42fd5944415f%3A0x7cc033f7435f60e9!2sMorocco!5e0!3m2!1sen!2sma!4v1712170000000!5m2!1sen!2sma" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Carte du Maroc"
          ></iframe>
        </div>

     
        <div className="contact-form-side">
          <div className="contact-header">
            <span className="hero-badge">Nous contacter</span>
            <h2 className="section-title-maroc">Une question ?</h2>
            <p>Nos ambassadeurs sont à votre écoute pour sublimer votre séjour au Maroc.</p>
          </div>
          
          <form className="contact-form-luxury">
            <div className="form-row">
              <input type="text" placeholder="NOM COMPLET" required />
              <input type="email" placeholder="EMAIL" required />
            </div>
            <textarea placeholder="VOTRE MESSAGE" rows="5" required></textarea>
            <button type="submit" className="btn-royal">Envoyer le message</button>
          </form>
        </div>

      </div>
    </section>
  );
}