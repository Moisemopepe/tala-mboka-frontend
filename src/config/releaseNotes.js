import { VERSION } from "./version.js";

export const releaseNotes = {
  "0.4.9": {
    adminNotes: `Version 0.4.9

Performance perçue :
- Le fil citoyen réutilise les dernières alertes en cache avant de rafraîchir l'API.
- Les pages fréquentes sont préchargées discrètement après le premier rendu.

UX :
- Moins d'écran vide pendant les appels réseau.
- Navigation plus fluide entre Fil, Signaler et Compte.`,
    userNotes: `Version 0.4.9

Amélioration :
- Le fil s'affiche plus vite après une première visite.
- L'application semble plus fluide lors de la navigation.`
  },
  "0.4.8": {
    adminNotes: `Version 0.4.8

Performance :
- Audit WebPageTest analysé.
- Ajout de règles de cache Vercel pour les fichiers statiques.
- Les fichiers versionnés dans /assets sont maintenant cacheables longtemps.

Impact :
- Navigation plus rapide lors des prochaines visites.
- Moins de requêtes inutiles vers Vercel.`,
    userNotes: `Version 0.4.8

Amélioration :
- L'application se recharge plus rapidement après une première visite.
- Les fichiers statiques sont mieux optimisés.`
  },
  "0.4.7": {
    adminNotes: `Version 0.4.7

Audit :
- Correction des points détectés par Lighthouse.
- Ajout des libellés accessibles sur les filtres du fil citoyen.
- Ajout d'un fichier robots.txt valide et d'un sitemap.

Qualité :
- Contraste renforcé sur les boutons et les onglets actifs.`,
    userNotes: `Version 0.4.7

Amélioration :
- Le site est plus lisible et plus accessible.
- Les filtres du fil citoyen sont mieux reconnus par les lecteurs d'écran.
- Le référencement technique est mieux préparé.`
  },
  "0.4.6": {
    adminNotes: `Version 0.4.6

Qualité :
- Audit des textes visibles de l'interface.
- Correction des libellés, des accents et des formulations en français.
- Nettoyage de la page À propos.

Performance :
- Chargement différé des pages principales pour alléger le premier chargement.`,
    userNotes: `Version 0.4.6

Amélioration :
- Les textes de l'application sont plus clairs et mieux rédigés.
- La page À propos est plus simple et plus utile.
- Le chargement initial de l'application est plus léger.`
  }
};

export const currentReleaseNotes = releaseNotes[VERSION] || {
  adminNotes: `Version ${VERSION}

Changements internes :
- Décrire ici les changements admin et modération.

Technique :
- Décrire ici les changements techniques importants.

Action recommandée :
- Vérifier les notes, puis notifier la version.`,
  userNotes: `Version ${VERSION}

Nouveautés :
- Décrire ici les nouveautés visibles par les utilisateurs.

Ce que ça change pour vous :
- Décrire ici l'impact simple pour les citoyens.`
};
