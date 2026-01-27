/**
 * Construit l'URL complète d'une image
 * Si l'image est un chemin relatif /uploads/, ajoute l'URL du backend
 */
const getImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500';
  }

  // Si c'est déjà une URL complète (http/https), la retourner telle quelle
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Si c'est un chemin relatif qui commence par /uploads/, construire l'URL complète
  if (imagePath.startsWith('/uploads/')) {
    const backendUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : 'https://gouidex-backend.2bj94x.easypanel.host';
    
    return `${backendUrl}${imagePath}`;
  }

  // Sinon, retourner tel quel (pour les chemins relatifs autres)
  return imagePath;
};

export default getImageUrl;

