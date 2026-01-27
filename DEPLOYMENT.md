# Guide de Déploiement en Production

Ce guide vous aidera à déployer l'application e-commerce en production.

## Prérequis

- Node.js 18+ installé
- MongoDB Atlas (ou MongoDB local)
- Compte sur une plateforme de déploiement (Vercel, Netlify, Railway, Render, etc.)
- Domaine (optionnel mais recommandé)

## Variables d'Environnement

### Backend (Server)

Créez un fichier `.env` dans le dossier `server/` avec les variables suivantes :

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce?retryWrites=true&w=majority

# JWT Secrets - GÉNÉREZ DES CLÉS FORTES ET UNIQUES !
JWT_ACCESS_SECRET=votre-cle-secrete-access-tres-longue-et-aleatoire-min-32-caracteres
JWT_REFRESH_SECRET=votre-cle-secrete-refresh-tres-longue-et-aleatoire-min-32-caracteres
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Client URL - URL de votre frontend en production
CLIENT_URL=https://votre-domaine.com

# Admin Credentials (optionnel)
ADMIN_EMAIL=admin@ecommerce.com
ADMIN_PASSWORD=VotreMotDePasseSecurise123!
```

### Frontend (Client)

Créez un fichier `.env` dans le dossier `client/` avec :

```env
# API Base URL - URL complète de votre API backend
VITE_API_URL=https://votre-api-domaine.com/api

# App Environment
VITE_NODE_ENV=production
```

## Génération de Clés Secrètes JWT

Pour générer des clés secrètes sécurisées, utilisez :

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Ou en ligne de commande
openssl rand -hex 32
```

## Déploiement du Backend

### Option 1: Railway / Render

1. Créez un compte sur Railway ou Render
2. Connectez votre repository GitHub
3. Configurez les variables d'environnement dans le dashboard
4. Définissez la commande de démarrage : `npm start`
5. Définissez le port : utilisez la variable `PORT` fournie par la plateforme

### Option 2: Heroku

```bash
# Installer Heroku CLI
# Créer une nouvelle app
heroku create votre-app-name

# Ajouter les variables d'environnement
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=votre-uri-mongodb
heroku config:set JWT_ACCESS_SECRET=votre-secret
heroku config:set JWT_REFRESH_SECRET=votre-secret
heroku config:set CLIENT_URL=https://votre-frontend.com

# Déployer
git push heroku main
```

### Option 3: VPS (Ubuntu/Debian)

```bash
# Installer Node.js et PM2
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

# Cloner le repository
git clone votre-repo
cd e-comm/server

# Installer les dépendances
npm install --production

# Créer le fichier .env
nano .env
# Copiez les variables d'environnement

# Démarrer avec PM2
pm2 start src/server.js --name ecommerce-api
pm2 save
pm2 startup
```

## Déploiement du Frontend

### Option 1: Vercel (Recommandé)

1. Créez un compte sur Vercel
2. Importez votre repository GitHub
3. Configurez le projet :
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Ajoutez les variables d'environnement :
   - `VITE_API_URL`: URL de votre API backend
5. Déployez

### Option 2: Netlify

1. Créez un compte sur Netlify
2. Importez votre repository
3. Configurez :
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`
4. Ajoutez les variables d'environnement
5. Déployez

### Option 3: Build Manuel

```bash
cd client
npm install
npm run build

# Le dossier dist/ contient les fichiers à déployer
# Vous pouvez le servir avec nginx, Apache, ou tout serveur web statique
```

## Configuration Nginx (Optionnel)

Si vous déployez sur un VPS, voici une configuration Nginx exemple :

```nginx
# Frontend
server {
    listen 80;
    server_name votre-domaine.com;

    root /var/www/ecommerce/client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Backend API
server {
    listen 80;
    server_name api.votre-domaine.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Configuration MongoDB Atlas

1. Créez un cluster sur MongoDB Atlas
2. Créez un utilisateur de base de données
3. Configurez le réseau :
   - Ajoutez `0.0.0.0/0` pour permettre toutes les IP (ou spécifiez votre IP de serveur)
4. Obtenez la chaîne de connexion
5. Remplacez `<password>` et `<dbname>` dans l'URI

## Sécurité en Production

### ✅ Checklist de Sécurité

- [ ] Toutes les variables d'environnement sont définies
- [ ] Les secrets JWT sont forts et uniques
- [ ] HTTPS est activé (certificat SSL)
- [ ] CORS est configuré correctement
- [ ] Les cookies sont sécurisés (secure: true en production)
- [ ] Les mots de passe par défaut sont changés
- [ ] MongoDB Atlas a des règles de réseau restrictives
- [ ] Les logs d'erreur ne révèlent pas d'informations sensibles
- [ ] Rate limiting est implémenté (recommandé)
- [ ] Les uploads de fichiers sont validés

### Recommandations Additionnelles

1. **Rate Limiting**: Installez `express-rate-limit`
2. **Helmet**: Installez `helmet` pour sécuriser les headers HTTP
3. **Validation**: Toutes les entrées utilisateur sont validées
4. **Monitoring**: Configurez un service de monitoring (Sentry, LogRocket)
5. **Backups**: Configurez des sauvegardes automatiques de MongoDB

## Vérification Post-Déploiement

1. ✅ Testez l'endpoint de santé : `https://votre-api.com/api/health`
2. ✅ Vérifiez que le frontend charge correctement
3. ✅ Testez la connexion utilisateur
4. ✅ Testez la création de commande
5. ✅ Vérifiez les uploads d'images
6. ✅ Testez le panier et le checkout
7. ✅ Vérifiez le dashboard admin

## Scripts Utiles

```bash
# Build pour production
npm run build

# Démarrer en production (backend)
cd server && npm start

# Vérifier les logs (avec PM2)
pm2 logs ecommerce-api

# Redémarrer l'application
pm2 restart ecommerce-api
```

## Support

En cas de problème :
1. Vérifiez les logs du serveur
2. Vérifiez les variables d'environnement
3. Vérifiez la connexion MongoDB
4. Vérifiez les configurations CORS
5. Consultez la documentation de votre plateforme de déploiement

