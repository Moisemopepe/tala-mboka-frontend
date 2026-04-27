import { VERSION } from "./version.js";

export const releaseNotes = {
  "0.1.5": {
    adminNotes: `Version 0.1.5

UX:
- Ajout de la page Mes alertes.
- Badges de statut plus clairs.
- Empty states uniformes.

Admin:
- Tri par date.
- Refresh automatique toutes les 30s.
- Message clair si session expire.`,
    userNotes: `Version 0.1.5

Nouveautes:
- Page Mes alertes.
- Statuts plus lisibles.

Amelioration:
- Message clair apres envoi d'une alerte.`
  },
  "0.1.4": {
    adminNotes: `Version 0.1.4

UX:
- Le contour bleu du logo n'apparait plus apres un clic souris.
- Le focus reste disponible pour la navigation clavier.`,
    userNotes: `Version 0.1.4

Amelioration:
- Le logo a un comportement visuel plus propre au clic.`
  },
  "0.1.3": {
    adminNotes: `Version 0.1.3

Admin:
- Le logo du header redirige maintenant vers l'accueil.

UX:
- Navigation plus naturelle sur toutes les pages.`,
    userNotes: `Version 0.1.3

Amelioration:
- Cliquer sur le logo ramene maintenant a l'accueil.`
  },
  "0.1.2": {
    adminNotes: `Version 0.1.2

Admin:
- Envoi automatique des notifications de version.
- Notes plus courtes et faciles a lire.

Technique:
- Anti-doublon: une version n'est notifiee qu'une fois.`,
    userNotes: `Version 0.1.2

Nouveautes:
- Notifications de mise a jour plus claires.

Amelioration:
- Texte plus court et plus lisible.`
  },
  "0.1.1": {
    adminNotes: `Version 0.1.1

Changements internes:
- Le formulaire de notification de version est maintenant pre-rempli automatiquement.
- Les notes admin et user sont centralisees dans un fichier de configuration.
- Ajout d'un bouton pour remettre les notes de version par defaut.

Technique:
- Ajout de la configuration releaseNotes cote frontend.
- Preparation d'un workflow plus rapide pour notifier les nouvelles versions.

Action recommandee:
- Verifier les notes proposees, puis cliquer sur Notifier la version.`,
    userNotes: `Version 0.1.1

Ameliorations:
- Les notifications de mise a jour sont preparees plus rapidement.

Ce que ça change pour vous:
- Les informations de version seront plus regulieres et plus claires.`
  },
  "0.1.0": {
    adminNotes: `Version 0.1.0

Changements internes:
- Le formulaire de notification de version se vide apres envoi.
- La numerotation des versions est maintenant plus propre.
- Les versions passent maintenant de 0.1.9 a 0.2.0 au lieu de 0.1.10.

Technique:
- Mise a jour du script de versioning.
- Synchronisation de la version frontend avec 0.1.0.

Action recommandee:
- Utiliser cette nouvelle logique pour les prochaines mises a jour.`,
    userNotes: `Version 0.1.0

Ameliorations:
- Les notifications de mise a jour sont plus propres.
- La version de l'application est maintenant plus lisible.

Ce que ça change pour vous:
- Vous verrez plus clairement les nouvelles versions de Tala Mboka.`
  }
};

export const currentReleaseNotes = releaseNotes[VERSION] || {
  adminNotes: `Version ${VERSION}

Changements internes:
- Decrire ici les changements admin et moderation.

Technique:
- Decrire ici les changements techniques importants.

Action recommandee:
- Verifier les notes, puis notifier la version.`,
  userNotes: `Version ${VERSION}

Nouveautes:
- Decrire ici les nouveautes visibles par les utilisateurs.

Ce que ça change pour vous:
- Decrire ici l'impact simple pour les citoyens.`
};
