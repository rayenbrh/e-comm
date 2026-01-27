# Configuration des Variables d'Environnement

## Fichier .env

Créez un fichier `.env` dans le dossier `client/` avec les variables suivantes :

```env
# API Base URL - URL complète de votre API backend
# IMPORTANT: Incluez /api à la fin de l'URL
VITE_API_URL=https://gouidex-backend.2bj94x.easypanel.host/api

# App Environment
VITE_NODE_ENV=production
```

## URLs de Production

- **Frontend**: https://gouidex-frontend.2bj94x.easypanel.host/
- **Backend**: https://gouidex-backend.2bj94x.easypanel.host/

## Comment ça fonctionne

1. **En développement** (`npm run dev`):
   - Le proxy Vite utilise `VITE_API_URL` depuis `.env` si disponible
   - Sinon, utilise `http://localhost:5000` par défaut
   - Les requêtes `/api` sont proxifiées vers le backend

2. **En production** (`npm run build`):
   - L'URL complète du backend est intégrée dans le build via `VITE_API_URL`
   - Les requêtes vont directement vers l'URL spécifiée dans `.env`
   - Pas de proxy nécessaire en production

## Changer l'URL du backend

Pour changer l'URL du backend, modifiez simplement `VITE_API_URL` dans le fichier `.env` :

```env
VITE_API_URL=https://votre-nouveau-backend.com/api
```

Puis redémarrez le serveur de développement ou reconstruisez l'application.

## Notes importantes

- ⚠️ Les variables d'environnement doivent commencer par `VITE_` pour être accessibles dans le code client
- ⚠️ Après modification de `.env`, redémarrez le serveur de développement
- ⚠️ En production, les variables d'environnement doivent être définies dans votre plateforme de déploiement (EasyPanel)

