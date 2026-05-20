import React from "react";
import { Link } from "react-router-dom";
import Contact from "./ContactPage";
import "../styles/styles.css"; 
import vidoHome from "../assets/videos/hebergement.mp4";
import mosquee from "../assets/images/Mosquer.jpg";
import Tourism from "../assets/images/Tourism1.jpeg";


const reasons = [
  { 
    title: "Rapidité",
    text: "Trouver rapidement où dormir, où manger et quoi visiter." 
  },
  { 
    title: "Exploration",
    text: "Explorer les meilleures villes et expériences du Maroc."
  },
  { 
    title: "Élégance",
    text: "Une application simple, élégante et utile pour les touristes."
  }
];

const services = [
  { title: "Hébergements", desc: "Découvrez des riads et hôtels d'exception.", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000", link: "/hebergements" },
  { title: "Restaurants", desc: "Savourez la gastronomie marocaine.", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000", link: "/restaurants" },
  { title: "Trajet tourism", desc: "Déplacez-vous en toute sérénité.", image: Tourism , link: "/tourism" },
  { title: "Matchs", desc: "Vivez la passion du football.", image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000", link: "/matchs" },
  { title: "Activités", desc: "Des expériences inoubliables.", image: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1000", link: "#" },
  { title: "Monuments", desc: "L'histoire au bout des doigts.", image: mosquee, link: "#" }
];

export default function Home() {
  return (
    <div className="home-page-luxury">
      
      {/* --- HERO SECTION --- */}
      <section className="hero-palace hero-video-bg">
        <video autoPlay muted loop playsInline className="hero-background-video">
          <source src={vidoHome} type="video/mp4" />
        </video>
        <div className="hero-video-overlay"></div>
        <div className="container hero-content-relative">
          <span className="hero-badge">L'Art de Voyager</span>
          <h1>SIR MAROC : VOTRE PALAIS DIGITAL</h1>
          <div className="hero-line-gold"></div>
          <p>Le guide ultime pour une immersion totale au cœur du Royaume.</p>
          <button className="btn-royal" onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}>
            Commencer l'Aventure
          </button>
        </div>
      </section>

      {/* --- SECTION SERVICES (CADRE BORDEAUX) --- */}
      <section id="services" className="services-grid-section zellij-frame-bordeaux">
        <div className="container">
          <div className="header-group">
            <span className="hero-badge">Prestations Exclusives</span>
            <h2 className="section-title-maroc">Nos Services</h2>
            <div className="hero-line-gold"></div>
          </div>
          
          <div className="services-luxury-grid">
            {services.map((service, index) => (
              <Link to={service.link} key={index} className="service-card-royal">
                <div className="service-image-container">
                  <img src={service.image} alt={service.title} />
                  <div className="service-image-overlay"></div>
                </div>
                
                <div className="service-content-box">
                  <div className="service-text">
                    <span>Découvrir</span>
                    <h3>{service.title}</h3>
                    <p>{service.desc}</p>
                  </div>
                  <div className="service-navigation-arrow">
                    <i className="fas fa-arrow-right"></i>
                  </div>
                </div>
                <div className="gold-border-hover"></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION EXPÉRIENCE (CADRE VERT) --- */}
      <section id="experience" className="experience-horizontal-section zellij-frame-vert">
        <div className="container">
          <div className="header-group">
            <span className="hero-badge">Le Parcours</span>
            <h2 className="section-title-maroc">L'Art de Vivre SirMaroc</h2>
          </div>

          <div className="horizontal-exp-wrapper">
            {reasons.map((item, index) => (
              <div key={index} className="horizontal-exp-item">
                <div className="exp-top">
                  <span className="exp-index">0{index + 1}</span>
                  <div className="exp-dot-connector"></div>
                </div>
                <div className="exp-body">
                  <h3 className="exp-h3">{item.title}</h3>
                  <p className="exp-p">{item.text}</p>
                </div>
              </div>
            ))}
            <div className="full-connector-line"></div>
          </div>
        </div>
      </section>

      <Contact />
    </div>
  );
}
