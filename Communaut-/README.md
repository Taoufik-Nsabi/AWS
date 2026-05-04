# Sir Maroc - Communauté

Ce dépôt regroupe le code de la fonctionnalité **Communauté** extraite du projet PFA Sir Maroc.

## Contenu

- `community-service/` : microservice Spring Boot du chat communautaire
- `frontend-community/` : fichiers d'intégration React pour l'interface Communauté
- `gateway/` : configuration de l'API Gateway utile à la redirection du microservice et du WebSocket
- `infra/` : `docker-compose.yml` et exemple de variables d'environnement liés à l'intégration

## Fonctionnalités

- 3 salons principaux : `debates`, `questions`, `fun`
- messages texte en temps réel via **WebSocket**
- partage d'images dans les salons
- sécurité via JWT et passage par l'API Gateway
- persistance des messages dans **SQL Server**

## Technologies

- **Spring Boot**
- **Spring Security**
- **Spring Data JPA**
- **Flyway**
- **SQL Server**
- **React.js**
- **Vite**
- **CSS**
- **WebSocket**
- **Docker Compose**

## Remarque

Le dossier `frontend-community/` contient les fichiers front directement liés à la fonctionnalité Communauté et à son intégration dans l'application Sir Maroc existante. Il s'agit d'un extrait ciblé, pas d'une copie complète de toute l'application front originale.
