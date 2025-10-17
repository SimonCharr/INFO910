# TP INFO910

**Université Savoie Mont Blanc - Master 2 Informatique**
**Année universitaire 2025-2026**

## Membres du binôme

- **CHARRIER Simon** -
- **JBILOU Adam** -

---

## Table des matières

1. [Présentation de l'application](#présentation-de-lapplication)
2. [Réponse au sujet du TP](#réponse-au-sujet-du-tp)
3. [Architecture et technologies](#architecture-et-technologies)
4. [Utilisation de l'application](#utilisation-de-lapplication)
5. [Déploiement sur Kubernetes](#déploiement-sur-kubernetes)
6. [Structure du projet](#structure-du-projet)
7. [Fichiers importants](#fichiers-importants)

---

## Présentation de l'application

**Quiz Master** est une application web interactive de quiz qui permet aux utilisateurs de tester leurs connaissances sur diverses catégories.

### Fonctionnalités principales

- **Jeu de quiz interactif** : Questions à choix multiples provenant de l'API Open Trivia Database
- **Personnalisation** : Choix de la catégorie (Histoire, Science, Sports, etc.) et de la difficulté (Easy, Medium, Hard)
- **Suivi des scores** : Enregistrement et consultation des meilleurs scores dans une base MongoDB
- **Leaderboard** : Classement des 10 meilleurs joueurs
- **Interface responsive** : Design moderne et adaptatif

### Comment l'utiliser

1. Entrez votre nom de joueur
2. Sélectionnez une catégorie (optionnel)
3. Choisissez un niveau de difficulté (optionnel)
4. Cliquez sur "Start Quiz"
5. Répondez aux 10 questions proposées
6. Consultez votre score final et le leaderboard

---

## Réponse au sujet du TP

Ce projet répond intégralement aux exigences du TP INFO910 :

### ✅ Application conteneurisée avec au moins deux conteneurs

L'application est composée de **trois conteneurs Docker** :

1. **Frontend** (React + Nginx) - Interface utilisateur
2. **Backend** (Node.js + Express) - API REST et logique métier
3. **MongoDB** - Stockage persistant des scores

**Fichiers Docker concernés :**
- `frontend/Dockerfile` - Construction du conteneur frontend (build multi-stage)
- `backend/Dockerfile` - Construction du conteneur backend
- `docker-compose.yml` - Orchestration locale des 3 conteneurs

### ✅ Déployable sur cluster Kubernetes

L'application est entièrement déployable sur Kubernetes avec des manifestes originaux :

**Manifestes Kubernetes créés (dossier `k8s/`):**
- `namespace.yaml` - Namespace dédié à l'application
- `mongodb-pv.yaml` - PersistentVolume pour la persistance des données
- `mongodb-deployment.yaml` - Deployment MongoDB + Service ClusterIP
- `backend-deployment.yaml` - Deployment Backend (2 replicas) + Service ClusterIP + Health checks
- `frontend-deployment.yaml` - Deployment Frontend (2 replicas) + Service NodePort

**Fonctionnalités Kubernetes implémentées :**
- ✅ Réplication des services (2 replicas backend, 2 replicas frontend)
- ✅ Gestion du stockage persistant (PersistentVolume/PersistentVolumeClaim)
- ✅ Services réseau (ClusterIP pour communication interne, NodePort pour accès externe)
- ✅ Health checks (Liveness & Readiness probes)
- ✅ Gestion des ressources (requests/limits CPU et RAM)
- ✅ Variables d'environnement pour configuration

---

## Architecture et technologies

### Architecture microservices

```
┌─────────────────┐
│   Frontend      │  Port 3000 (Docker) / 30080 (K8s)
│   React + Nginx │  Service NodePort
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐         ┌──────────────────┐
│   Backend       │  ────>  │  Open Trivia API │
│   Node.js       │  <────  │  (externe)       │
│   Express       │         └──────────────────┘
│   Port 5000     │
│   ClusterIP     │
└────────┬────────┘
         │ Mongoose
         ▼
┌─────────────────┐
│   MongoDB       │  Port 27017
│   + Volume      │  Service ClusterIP
│   Persistant    │  PersistentVolume 1Gi
└─────────────────┘
```

### Stack technique

**Frontend:**
- React 18
- Axios (requêtes HTTP)
- CSS3 (design responsive)
- Nginx (serveur web de production)

**Backend:**
- Node.js (runtime JavaScript)
- Express (framework web)
- Mongoose (ODM MongoDB)
- API REST avec validation

**Base de données:**
- MongoDB 7.0 (base NoSQL)
- Collections : `scores` (leaderboard)

**Conteneurisation & Orchestration:**
- Docker (conteneurisation)
- Docker Compose (développement local)
- Kubernetes (orchestration en production)

---

## Utilisation de l'application

### Prérequis

- **Docker** et **Docker Compose** installés
- **Kubernetes** (Minikube, K3s ou cluster cloud)
- **kubectl** configuré
- Ports disponibles : 3000, 5000, 27017

### Option 1 : Lancement avec Docker Compose (développement)

```bash
# Cloner le dépôt
git clone <url-du-depot>
cd INFO910

# Lancer l'application
docker-compose up --build

# Accéder à l'application
# Frontend : http://localhost:3000
# Backend : http://localhost:5000
# MongoDB : localhost:27017

# Arrêter l'application
docker-compose down
```

### Option 2 : Déploiement sur Kubernetes (production)

Voir section suivante "Déploiement sur Kubernetes".

---

## Déploiement sur Kubernetes

### Prérequis Kubernetes

- Cluster Kubernetes fonctionnel (Minikube recommandé pour le TP)
- `kubectl` installé et configuré
- `minikube` installé (pour environnement local)

### Étape 1 : Démarrer Minikube

```bash
# Démarrer le cluster Minikube
minikube start --driver=docker

# Vérifier que le cluster est opérationnel
kubectl cluster-info
kubectl get nodes
```

### Étape 2 : Construire les images Docker

Les images doivent être construites dans l'environnement Docker de Minikube :

```bash
# Configurer le shell pour utiliser le daemon Docker de Minikube
eval $(minikube docker-env)

# Construire les images
docker build -t quiz-frontend:latest ./frontend
docker build -t quiz-backend:latest ./backend

# Vérifier les images
docker images | grep quiz
```

**Alternative : Utiliser le script fourni**

```bash
./scripts/build-images.sh
```

### Étape 3 : Déployer l'application sur Kubernetes

**Option A : Déploiement manuel (recommandé pour comprendre l'ordre)**

```bash
# 1. Créer le namespace
kubectl apply -f k8s/namespace.yaml

# 2. Créer le PersistentVolume pour MongoDB
kubectl apply -f k8s/mongodb-pv.yaml

# 3. Déployer MongoDB (Deployment + PVC + Service)
kubectl apply -f k8s/mongodb-deployment.yaml

# Attendre que MongoDB soit prêt
kubectl wait --for=condition=ready pod -l app=mongodb --timeout=120s

# 4. Déployer le Backend (Deployment + Service)
kubectl apply -f k8s/backend-deployment.yaml

# Attendre que le Backend soit prêt
kubectl wait --for=condition=ready pod -l app=backend --timeout=120s

# 5. Déployer le Frontend (Deployment + Service)
kubectl apply -f k8s/frontend-deployment.yaml

# Attendre que le Frontend soit prêt
kubectl wait --for=condition=ready pod -l app=frontend --timeout=120s
```

**Option B : Déploiement automatique avec script**

```bash
./scripts/deploy-k8s.sh
```

### Étape 4 : Vérifier le déploiement

```bash
# Vérifier tous les pods
kubectl get pods

# Vérifier tous les services
kubectl get services

# Vérifier le PersistentVolume
kubectl get pv
kubectl get pvc

# Voir les logs en cas de problème
kubectl logs -l app=backend
kubectl logs -l app=frontend
kubectl logs -l app=mongodb

# Décrire un pod pour plus de détails
kubectl describe pod <nom-du-pod>
```

**Sortie attendue :**

```
NAME                        READY   STATUS    RESTARTS   AGE
backend-xxxxxxxxxx-xxxxx    1/1     Running   0          2m
backend-xxxxxxxxxx-xxxxx    1/1     Running   0          2m
frontend-xxxxxxxxxx-xxxxx   1/1     Running   0          1m
frontend-xxxxxxxxxx-xxxxx   1/1     Running   0          1m
mongodb-xxxxxxxxxx-xxxxx    1/1     Running   0          3m
```

### Étape 5 : Accéder à l'application

**Méthode 1 : Via Minikube (recommandée)**

```bash
# Ouvrir automatiquement l'application dans le navigateur
minikube service frontend

# Ou obtenir l'URL
minikube service frontend --url
```

**Méthode 2 : Via NodePort**

```bash
# Récupérer l'IP de Minikube
minikube ip

# Récupérer le NodePort du frontend
kubectl get service frontend

# Accéder à : http://<MINIKUBE_IP>:30080
```

**Méthode 3 : Port forwarding (développement)**

```bash
kubectl port-forward service/frontend 3000:80

# Accéder à : http://localhost:3000
```

### Étape 6 : Tester l'application

1. Ouvrir l'URL fournie par Minikube
2. Entrer un nom de joueur
3. Sélectionner une catégorie et difficulté
4. Jouer au quiz
5. Vérifier que le score est sauvegardé dans le leaderboard

### Mise à jour de l'application

Pour mettre à jour après modification du code :

```bash
# Reconstruire les images
eval $(minikube docker-env)
docker build -t quiz-frontend:latest ./frontend
docker build -t quiz-backend:latest ./backend

# Redémarrer les pods pour utiliser les nouvelles images
kubectl rollout restart deployment/frontend
kubectl rollout restart deployment/backend

# Vérifier le rollout
kubectl rollout status deployment/frontend
kubectl rollout status deployment/backend
```

### Nettoyage et suppression

**Supprimer l'application :**

```bash
# Supprimer tous les déploiements
kubectl delete -f k8s/frontend-deployment.yaml
kubectl delete -f k8s/backend-deployment.yaml
kubectl delete -f k8s/mongodb-deployment.yaml
kubectl delete -f k8s/mongodb-pv.yaml
kubectl delete -f k8s/namespace.yaml
```

**Alternative : Script de nettoyage**

```bash
./scripts/cleanup-k8s.sh
```

**Arrêter Minikube :**

```bash
minikube stop
```

**Supprimer complètement Minikube :**

```bash
minikube delete
```

---

## Structure du projet

```
INFO910/
├── backend/                      # Application backend Node.js
│   ├── models/
│   │   └── Score.js              # Modèle Mongoose pour les scores
│   ├── routes/
│   │   └── quiz.js               # Routes API REST du quiz
│   ├── server.js                 # Point d'entrée du serveur Express
│   ├── package.json              # Dépendances Node.js
│   └── Dockerfile                # Image Docker du backend
│
├── frontend/                     # Application frontend React
│   ├── src/
│   │   ├── App.js                # Composant React principal
│   │   ├── App.css               # Styles CSS
│   │   └── index.js              # Point d'entrée React
│   ├── public/
│   ├── package.json              # Dépendances React
│   ├── Dockerfile                # Image Docker multi-stage (build + nginx)
│   └── nginx.conf                # Configuration Nginx pour prod
│
├── k8s/                          # Manifestes Kubernetes
│   ├── namespace.yaml            # Namespace todo-app
│   ├── mongodb-pv.yaml           # PersistentVolume 1Gi
│   ├── mongodb-deployment.yaml   # Deployment MongoDB + PVC + Service
│   ├── backend-deployment.yaml   # Deployment Backend + Service
│   └── frontend-deployment.yaml  # Deployment Frontend + Service NodePort
│
├── scripts/                      # Scripts d'automatisation
│   ├── build-images.sh           # Construction des images Docker
│   ├── deploy-k8s.sh             # Déploiement automatique sur K8s
│   └── cleanup-k8s.sh            # Nettoyage des ressources K8s
│
├── docker-compose.yml            # Orchestration Docker Compose (dev)
├── .gitignore                    # Fichiers à ignorer par Git
└── README.md                     # Cette documentation
```

---

## Fichiers importants

### 1. Fichiers de conteneurisation Docker

#### `docker-compose.yml`
**Rôle :** Orchestre les 3 conteneurs pour le développement local.
- Définit les services : `mongodb`, `backend`, `frontend`
- Configure les réseaux et volumes
- Gère les dépendances entre services (`depends_on`)
- Permet un lancement rapide : `docker-compose up --build`

#### `backend/Dockerfile`
**Rôle :** Construit l'image Docker du backend Node.js.
- Base : `node:18-alpine` (image légère)
- Installe les dépendances npm
- Expose le port 5000
- Lance le serveur avec `npm start`

#### `frontend/Dockerfile`
**Rôle :** Construit l'image Docker du frontend en 2 étapes (multi-stage).
- **Stage 1 (build)** : Compile l'application React avec `npm run build`
- **Stage 2 (production)** : Sert les fichiers statiques avec Nginx
- Résultat : Image finale légère (< 50MB) prête pour production

### 2. Manifestes Kubernetes

#### `k8s/namespace.yaml`
**Rôle :** Crée un namespace isolé `todo-app` pour l'application.
- Organise et isole les ressources Kubernetes
- Facilite la gestion et la suppression de toute l'application

#### `k8s/mongodb-pv.yaml`
**Rôle :** Définit le stockage persistant pour MongoDB.
- **PersistentVolume** : 1Gi sur `hostPath` (pour Minikube/dev)
- En production, on utiliserait un volume cloud (EBS, GCE PD, etc.)
- Garantit que les données survivent aux redémarrages de pods

#### `k8s/mongodb-deployment.yaml`
**Rôle :** Déploie MongoDB avec persistance et service.
- **Deployment** : 1 replica MongoDB 7.0
- **PersistentVolumeClaim** : Réclame 1Gi de stockage
- **Service ClusterIP** : Expose MongoDB sur port 27017 (interne uniquement)
- Ressources : 256Mi-512Mi RAM, 250m-500m CPU
- Volume monté sur `/data/db` pour persistance

#### `k8s/backend-deployment.yaml`
**Rôle :** Déploie le backend Node.js avec haute disponibilité.
- **Deployment** : 2 replicas (load balancing + tolérance aux pannes)
- **Service ClusterIP** : Expose le backend sur port 5000 (communication interne)
- **Variables d'environnement** : `MONGODB_URI`, `PORT`
- **Health checks** :
  - Liveness probe : vérifie `/api/health` toutes les 10s
  - Readiness probe : vérifie `/api/health` toutes les 5s
- Ressources : 128Mi-256Mi RAM, 100m-200m CPU par pod

#### `k8s/frontend-deployment.yaml`
**Rôle :** Déploie le frontend React avec accès externe.
- **Deployment** : 2 replicas (haute disponibilité)
- **Service NodePort** : Expose le frontend sur port 30080 (accès externe)
- Port mapping : 80 (interne) → 30080 (externe)
- Ressources : 64Mi-128Mi RAM, 50m-100m CPU par pod

### 3. Scripts d'automatisation

#### `scripts/build-images.sh`
**Rôle :** Construit automatiquement les images Docker pour Kubernetes.
- Configure l'environnement Docker de Minikube
- Build les images `quiz-frontend:latest` et `quiz-backend:latest`
- Évite d'avoir à taper manuellement les commandes Docker

#### `scripts/deploy-k8s.sh`
**Rôle :** Déploie automatiquement toute l'application sur Kubernetes.
- Applique les manifestes dans le bon ordre
- Attend que chaque service soit prêt avant de continuer
- Affiche les instructions pour accéder à l'application
- Équivalent à exécuter manuellement tous les `kubectl apply`

#### `scripts/cleanup-k8s.sh`
**Rôle :** Nettoie toutes les ressources Kubernetes de l'application.
- Supprime tous les déploiements, services, PVC
- Supprime le namespace
- Réinitialise l'environnement pour un nouveau déploiement

### 4. Code applicatif

#### `backend/server.js`
**Rôle :** Serveur Express principal du backend.
- Connexion à MongoDB via Mongoose
- Configuration CORS pour communication avec frontend
- Route `/api/health` pour les health checks Kubernetes
- Import des routes API (`/api/quiz/*`)
- Gestion d'erreurs et logging

#### `backend/routes/quiz.js`
**Rôle :** Définit toutes les routes API REST du quiz.
- `GET /api/quiz/categories` : Liste des catégories
- `GET /api/quiz/questions` : Questions de l'API Open Trivia
- `POST /api/quiz/scores` : Sauvegarder un score
- `GET /api/quiz/scores` : Récupérer le leaderboard
- Communication avec l'API externe opentdb.com

#### `backend/models/Score.js`
**Rôle :** Schéma Mongoose pour le stockage des scores.
- Définit la structure des documents dans MongoDB
- Champs : `playerName`, `score`, `totalQuestions`, `category`, `difficulty`, `timestamp`
- Permet les opérations CRUD sur la collection `scores`

#### `frontend/src/App.js`
**Rôle :** Composant React principal de l'interface.
- Gestion des états (quiz, questions, scores)
- Appels API vers le backend via Axios
- Navigation entre les vues : accueil, quiz, résultats, leaderboard
- Logique de jeu et calcul des scores

#### `frontend/nginx.conf`
**Rôle :** Configuration Nginx pour servir l'application React en production.
- Sert les fichiers statiques depuis `/usr/share/nginx/html`
- Proxy inverse pour rediriger `/api/*` vers le backend
- Gestion du routing React (redirection vers `index.html`)
- Configuration optimisée pour production

---

## Démonstration de conformité au sujet

### ✅ Application conteneurisée (≥ 2 conteneurs)

| Conteneur | Technologie | Port | Rôle |
|-----------|-------------|------|------|
| Frontend | React + Nginx | 3000/80 | Interface utilisateur |
| Backend | Node.js + Express | 5000 | API REST et logique métier |
| MongoDB | MongoDB 7.0 | 27017 | Stockage persistant |

**Total : 3 conteneurs** ✅

### ✅ Stockage persistant

- **MongoDB** avec volume Docker (`mongodb_data`) en mode Docker Compose
- **PersistentVolume/PVC** (1Gi) en mode Kubernetes
- Garantit la persistance des scores entre redémarrages

### ✅ Déploiement Kubernetes original

- 5 manifestes Kubernetes créés spécifiquement pour ce projet
- Architecture microservices avec réplication (2 replicas backend/frontend)
- Gestion avancée : health checks, resource limits, persistent storage
- Scripts de déploiement automatisés

### ✅ Code source inclus

- Sources frontend : `frontend/src/`
- Sources backend : `backend/`
- Dockerfiles : `frontend/Dockerfile`, `backend/Dockerfile`
- Manifestes K8s : `k8s/*.yaml`

---

## APIs et endpoints

### Backend API REST

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/health` | Health check (utilisé par K8s probes) |
| GET | `/api/quiz/categories` | Liste des catégories de quiz |
| GET | `/api/quiz/questions` | Récupération de questions (params: `amount`, `category`, `difficulty`) |
| POST | `/api/quiz/scores` | Sauvegarde d'un score (body: `playerName`, `score`, etc.) |
| GET | `/api/quiz/scores` | Récupération du leaderboard (param: `limit`) |

### API externe utilisée

- **Open Trivia Database** : [https://opentdb.com](https://opentdb.com)
  - Fournit gratuitement des questions de quiz dans plus de 20 catégories
  - API REST publique sans authentification

---

## Aspects techniques avancés

### Réplication et haute disponibilité

- **Backend** : 2 replicas pour load balancing
- **Frontend** : 2 replicas pour tolérance aux pannes
- **MongoDB** : 1 replica (peut être augmenté avec ReplicaSet)

### Health checks Kubernetes

Le backend implémente des sondes de santé :

```yaml
livenessProbe:   # Vérifie que le conteneur est vivant
  httpGet:
    path: /api/health
    port: 5000
  periodSeconds: 10

readinessProbe:  # Vérifie que le conteneur est prêt à recevoir du trafic
  httpGet:
    path: /api/health
    port: 5000
  periodSeconds: 5
```

### Gestion des ressources

Chaque pod a des limites CPU/RAM définies pour :
- Éviter la surconsommation de ressources
- Permettre au scheduler K8s d'optimiser le placement
- Garantir la stabilité du cluster

### Communication inter-services

```
Frontend (NodePort 30080)
    ↓ HTTP
Backend (ClusterIP 5000)
    ↓ MongoDB Protocol
MongoDB (ClusterIP 27017)
```

- **ClusterIP** : Services internes uniquement accessibles dans le cluster
- **NodePort** : Service externe accessible depuis l'extérieur du cluster

---

**Dépôt Git :** https://github.com/SimonCharr/INFO910.git

