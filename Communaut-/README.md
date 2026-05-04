# Sir Maroc - Communaute

Ce dossier contient uniquement le backend Spring Boot de la fonctionnalite **Communaute**.

## Structure

- `src/` : code source du microservice de chat communautaire
- `pom.xml` : configuration Maven
- `Dockerfile` : image Docker du microservice

## Integration dans le projet

- Le frontend Communaute vit maintenant dans `sir-maroc-front/src/pages/Chat`
- L'API Gateway utilise la configuration du dossier racine `Gateway/`
- L'orchestration Docker se fait depuis le `docker-compose.yml` a la racine du projet

## Fonctionnalites

- 3 salons principaux : `debates`, `questions`, `fun`
- messages texte en temps reel via **WebSocket**
- partage d'images dans les salons
- securite via JWT et passage par l'API Gateway
- persistance des messages dans **SQL Server**
