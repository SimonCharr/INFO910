# Quiz Master - Application de Quiz Interactive

Application web de quiz interactive conteneurisée avec Docker et déployable sur Kubernetes.

## Membres du binôme

- [Votre nom]
- [Nom du binôme]

## Description de l'application

Quiz Master est une application web interactive qui permet aux utilisateurs de :

- **Jouer à des quiz** : Répondre à des questions à choix multiples provenant de l'API Open Trivia Database
- **Choisir la difficulté** : Easy, Medium, Hard ou Any
- **Sélectionner une catégorie** : Plus de 20 catégories disponibles (Histoire, Science, Sports, etc.)
- **Voir les résultats** : Score en temps réel et pourcentage de réussite
- **Consulter le leaderboard** : Tableau des meilleurs scores enregistrés
- **Sauvegarder les scores** : Tous les résultats sont stockés dans MongoDB

## Architecture

L'application suit une architecture microservices avec 3 conteneurs :

1. **Frontend** : Application React servie par Nginx
2. **Backend** : API REST Node.js/Express qui communique avec l'API Open Trivia Database
3. **Base de données** : MongoDB pour le stockage des scores

```
┌─────────────┐
│   Frontend  │  (Port 3000/30080)
│  (React)    │
│  + Nginx    │
└──────┬──────┘
       │
       ▼
┌─────────────┐         ┌──────────────────┐
│   Backend   │  ────>  │  Open Trivia DB  │
│  (Node.js)  │  <────  │      API         │
│  + Express  │         │  (opentdb.com)   │
└──────┬──────┘         └──────────────────┘
       │
       ▼
┌─────────────┐
│   MongoDB   │  (Port 27017)
│  + Volume   │
└─────────────┘
```

### Technologies utilisées

- **Frontend** : React 18, Axios, CSS3
- **Backend** : Node.js, Express, Mongoose, node-fetch
- **Base de données** : MongoDB 7.0
- **Conteneurisation** : Docker, Docker Compose
- **Orchestration** : Kubernetes
- **API externe** : Open Trivia Database (opentdb.com)

## Comment utiliser l'application

### Prérequis

- Docker et Docker Compose installés
- Ports 3000, 5000 et 27017 disponibles

### Lancement avec Docker Compose

1. Cloner le dépôt :
```bash
git clone [URL_DU_DEPOT]
cd projet
```

2. Lancer l'application :
```bash
docker-compose up --build
```

3. Accéder à l'application :
- Frontend : http://localhost:3000
- Backend API : http://localhost:5000
- MongoDB : localhost:27017

4. Arrêter l'application :
```bash
docker-compose down
```

### Utilisation de l'interface

1. **Page d'accueil** :
   - Entrez votre nom
   - Sélectionnez une catégorie (optionnel)
   - Choisissez la difficulté (optionnel)
   - Cliquez sur "Start Quiz"

2. **Pendant le quiz** :
   - Lisez la question
   - Cliquez sur votre réponse
   - Voyez si c'est correct ou incorrect
   - Passez à la question suivante

3. **Résultats** :
   - Consultez votre score final
   - Voyez votre pourcentage de réussite
   - Rejouez ou consultez le leaderboard

4. **Leaderboard** :
   - Top 10 des meilleurs scores
   - Affiche le nom, score, catégorie et difficulté

## Déploiement sur Kubernetes

### Prérequis

- Cluster Kubernetes opérationnel (minikube, k3s, ou cloud provider)
- kubectl installé et configuré

### Étapes de déploiement

1. Se placer dans le dossier du projet :
```bash
cd projet
```

2. Appliquer les manifestes Kubernetes dans l'ordre :

```bash
# 1. Créer le namespace (optionnel)
kubectl apply -f kubernetes/namespace.yaml

# 2. Déployer MongoDB avec son PersistentVolume
kubectl apply -f kubernetes/mongodb-pv.yaml
kubectl apply -f kubernetes/mongodb-deployment.yaml
kubectl apply -f kubernetes/mongodb-service.yaml

# Attendre que MongoDB soit prêt
kubectl wait --for=condition=ready pod -l app=mongodb -n quiz-app --timeout=120s

# 3. Déployer le backend
kubectl apply -f kubernetes/backend-deployment.yaml
kubectl apply -f kubernetes/backend-service.yaml

# Attendre que le backend soit prêt
kubectl wait --for=condition=ready pod -l app=backend -n quiz-app --timeout=120s

# 4. Déployer le frontend
kubectl apply -f kubernetes/frontend-deployment.yaml
kubectl apply -f kubernetes/frontend-service.yaml
```

3. Vérifier le déploiement :
```bash
# Vérifier les pods
kubectl get pods -n quiz-app

# Vérifier les services
kubectl get services -n quiz-app

# Vérifier les PersistentVolumes
kubectl get pv
kubectl get pvc -n quiz-app
```

4. Accéder à l'application :

**Option A - NodePort (développement)** :
```bash
# Obtenir l'IP du noeud
kubectl get nodes -o wide

# Obtenir le port du frontend
kubectl get service frontend-service -n quiz-app

# Accéder via : http://<NODE_IP>:<NODE_PORT>
```

**Option B - Port forwarding (local)** :
```bash
kubectl port-forward -n quiz-app service/frontend-service 3000:80
# Accéder via : http://localhost:3000
```

**Option C - Minikube** :
```bash
minikube service frontend-service -n quiz-app
```

**Option D - LoadBalancer (cloud)** :
```bash
# Obtenir l'IP externe
kubectl get service frontend-service -n quiz-app
```

### Mise à jour de l'application

Pour mettre à jour une image :
```bash
# Mettre à jour l'image
docker build -t quiz-frontend:v2 ./frontend
docker tag quiz-frontend:v2 <your-registry>/quiz-frontend:v2
docker push <your-registry>/quiz-frontend:v2

# Mettre à jour le déploiement
kubectl set image deployment/frontend -n quiz-app frontend=<your-registry>/quiz-frontend:v2

# Ou appliquer les manifestes mis à jour
kubectl apply -f kubernetes/frontend-deployment.yaml
```

### Nettoyage

Pour supprimer toutes les ressources :
```bash
kubectl delete namespace quiz-app
kubectl delete pv mongodb-pv
```

## Structure du projet

```
projet/
├── backend/
│   ├── models/
│   │   └── Score.js              # Modèle Mongoose pour les scores
│   ├── routes/
│   │   └── quiz.js               # Routes API pour le quiz
│   ├── server.js                 # Serveur Express principal
│   ├── package.json              # Dépendances backend
│   └── Dockerfile                # Image Docker backend
├── frontend/
│   ├── src/
│   │   ├── App.js                # Composant React principal
│   │   ├── App.css               # Styles de l'application
│   │   └── index.js              # Point d'entrée React
│   ├── public/
│   ├── package.json              # Dépendances frontend
│   ├── Dockerfile                # Image Docker frontend (multi-stage)
│   └── nginx.conf                # Configuration Nginx
├── kubernetes/
│   ├── namespace.yaml            # Namespace quiz-app
│   ├── mongodb-pv.yaml           # PersistentVolume pour MongoDB
│   ├── mongodb-deployment.yaml   # Deployment MongoDB
│   ├── mongodb-service.yaml      # Service MongoDB (ClusterIP)
│   ├── backend-deployment.yaml   # Deployment Backend
│   ├── backend-service.yaml      # Service Backend (ClusterIP)
│   ├── frontend-deployment.yaml  # Deployment Frontend
│   └── frontend-service.yaml     # Service Frontend (NodePort)
├── docker-compose.yml            # Orchestration Docker Compose
└── README.md                     # Cette documentation
```

## API Endpoints

### Backend API

- `GET /api/health` - Health check du serveur
- `GET /api/quiz/categories` - Récupérer la liste des catégories
- `GET /api/quiz/questions` - Récupérer des questions de quiz
  - Query params : `amount`, `category`, `difficulty`
  - Exemple : `/api/quiz/questions?amount=10&category=9&difficulty=easy`
- `POST /api/quiz/scores` - Sauvegarder un score
  - Body : `{ playerName, score, totalQuestions, category, difficulty }`
- `GET /api/quiz/scores` - Récupérer le leaderboard
  - Query params : `limit` (défaut: 10)

### Open Trivia Database API (externe)

Le backend utilise l'API publique opentdb.com :
- `https://opentdb.com/api.php` - Questions de quiz
- `https://opentdb.com/api_category.php` - Liste des catégories

## Variables d'environnement

### Backend
- `PORT` : Port du serveur (défaut: 5000)
- `MONGODB_URI` : URI de connexion MongoDB (défaut: mongodb://mongodb:27017/quizapp)

### Frontend
- `REACT_APP_API_URL` : URL de l'API backend (défaut: /api)

## Dépannage

### Les conteneurs ne démarrent pas
```bash
docker-compose down -v
docker system prune -f
docker-compose up --build
```

### Erreurs de connexion MongoDB
```bash
# Vérifier les logs
docker-compose logs mongodb
docker-compose logs backend

# Redémarrer MongoDB
docker-compose restart mongodb
```

### Le frontend ne charge pas
```bash
# Vérifier les logs
docker-compose logs frontend

# Vérifier la configuration nginx
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf
```

### Pods Kubernetes en erreur
```bash
# Voir les logs d'un pod
kubectl logs <pod-name> -n quiz-app

# Décrire un pod pour voir les événements
kubectl describe pod <pod-name> -n quiz-app

# Vérifier les ressources
kubectl top nodes
kubectl top pods -n quiz-app
```

### L'API externe ne répond pas
```bash
# Tester l'API depuis le backend
kubectl exec -it <backend-pod> -n quiz-app -- wget -O- https://opentdb.com/api.php?amount=1

# Vérifier les logs backend
kubectl logs <backend-pod> -n quiz-app
```

## Détails techniques

### Configurations Kubernetes

#### Ressources allouées
- **MongoDB** : 256Mi-512Mi RAM, 250m-500m CPU
- **Backend** : 128Mi-256Mi RAM, 100m-200m CPU (2 replicas)
- **Frontend** : 64Mi-128Mi RAM, 50m-100m CPU (2 replicas)

#### Stockage persistant
- **PersistentVolume** : 1Gi, hostPath (pour minikube/dev)
- **PersistentVolumeClaim** : 1Gi, ReadWriteOnce
- Stocke les scores des joueurs dans MongoDB

#### Services
- **MongoDB** : ClusterIP sur port 27017 (interne)
- **Backend** : ClusterIP sur port 5000 (interne)
- **Frontend** : NodePort sur port 80 → 30080 (externe)

#### Health Checks
Le backend dispose de :
- **Liveness Probe** : GET /api/health toutes les 10s
- **Readiness Probe** : GET /api/health toutes les 5s

## Fonctionnalités futures possibles

- [ ] Authentification des utilisateurs avec JWT
- [ ] Mode multijoueur en temps réel avec WebSocket
- [ ] Statistiques personnelles détaillées
- [ ] Minuteur pour les questions avec limite de temps
- [ ] Support multilingue (i18n)
- [ ] Mode challenge quotidien
- [ ] Badges et achievements
- [ ] Export des résultats en PDF
- [ ] Partage des scores sur réseaux sociaux
- [ ] Mode hors ligne avec cache

## Licence

Projet académique - Université de Savoie Mont Blanc - Master 2 INFO910

## Contact

Pour toute question, contactez : stephane.talbot@univ-savoie.fr
