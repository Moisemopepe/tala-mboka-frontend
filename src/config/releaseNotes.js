import { VERSION } from "./version.js";

export const releaseNotes = {
  "0.4.2": {
    adminNotes: `Version 0.4.2

Signalement:
- Transformation du formulaire en parcours guide par etapes.
- Premiere etape dediee au choix de categorie.
- Ajout de la categorie Autre.

UX:
- Experience plus mobile-first, plus claire et plus rapide.
- Navigation Precedent / Suivant avant l'envoi final.`,
    userNotes: `Version 0.4.2

Nouveaute:
- Signaler un probleme se fait maintenant etape par etape.
- Vous choisissez d'abord ce que vous voulez signaler, puis vous completez les details.`
  },
  "0.4.1": {
    adminNotes: `Version 0.4.1

Signalement:
- Ajout du role du declarant: concerne, temoin ou anonyme.
- Le role est transmis au backend et visible dans l'admin.

UX:
- Le formulaire donne plus de contexte sans ajouter d'ecran inutile.
- Les cartes affichent mieux le contexte du signalement.`,
    userNotes: `Version 0.4.1

Nouveaute:
- Vous pouvez maintenant indiquer si vous etes concerne, temoin ou anonyme lors d'un signalement.`
  },
  "0.4.0": {
    adminNotes: `Version 0.4.0

UX:
- Fil citoyen plus professionnel et plus lisible.
- Images des alertes mieux resolues depuis le backend Render.
- Statut neutre masque dans l'interface publique pour reduire le bruit.

Qualite:
- Badges de gravite uniformises.
- Espacement et cartes ameliores sur mobile, tablette et desktop.`,
    userNotes: `Version 0.4.0

Amelioration:
- Le fil des alertes est plus clair, plus rapide a parcourir et plus agreable a utiliser.
- Les alertes importantes restent visibles sans surcharge visuelle.`
  },
  "0.2.7": {
    adminNotes: `Version 0.2.7

Maintenance:
- Verification globale du code.
- Correction d'une logique de risque obsolete.

Qualite:
- Build frontend et syntaxe backend verifies.`,
    userNotes: `Version 0.2.7

Amelioration:
- Stabilite generale de l'application amelioree.`
  },
  "0.2.6": {
    adminNotes: `Version 0.2.6

Auth:
- Bloc securite retire de l'inscription.

UX:
- Formulaire plus simple et plus direct.`,
    userNotes: `Version 0.2.6

Amelioration:
- Inscription plus legere et plus directe.`
  },
  "0.2.5": {
    adminNotes: `Version 0.2.5

Inscription:
- Validation temps reel ajoutee.
- Confirmation mot de passe ajoutee.
- Erreurs affichees sous les champs.
- Bouton bloque si formulaire invalide.

UX:
- Etats visuels vert/rouge.
- Message donnees securisees ajoute.`,
    userNotes: `Version 0.2.5

Amelioration:
- Inscription plus claire et securisante.
- Confirmation mot de passe ajoutee.`
  },
  "0.2.4": {
    adminNotes: `Version 0.2.4

Auth:
- Icônes internes des inputs retirees.
- Lien mot de passe oublie masque en inscription.
- Champ mot de passe garde seulement le bouton oeil.

UX:
- Formulaire plus propre et lisible.`,
    userNotes: `Version 0.2.4

Amelioration:
- Formulaire connexion/inscription plus propre.
- Mot de passe oublie affiche seulement en connexion.`
  },
  "0.2.3": {
    adminNotes: `Version 0.2.3

Auth:
- Les icones des champs disparaissent pendant la saisie.
- Le texte des inputs reste mieux aligne.

UX:
- Correction visuelle sur telephone et mot de passe.`,
    userNotes: `Version 0.2.3

Amelioration:
- Les champs de connexion sont plus propres pendant la saisie.`
  },
  "0.2.2": {
    adminNotes: `Version 0.2.2

Auth:
- Badge utilisateurs actifs retire.
- Message OTP futur retire.
- Espacement des icones input corrige.

UX:
- Champs telephone et mot de passe plus propres.`,
    userNotes: `Version 0.2.2

Amelioration:
- Page connexion plus propre.
- Champs mieux alignes.`
  },
  "0.2.1": {
    adminNotes: `Version 0.2.1

Auth:
- Header plus compact.
- Cards benefices animees.
- Tabs login/register ameliorees.
- Focus input vert ajoute.

UX:
- Messages confiance et OTP futur ajoutes.`,
    userNotes: `Version 0.2.1

Amelioration:
- Page connexion plus fluide.
- Messages plus rassurants.`
  },
  "0.2.0": {
    adminNotes: `Version 0.2.0

Auth:
- Page login/register modernisee.
- Benefices utilisateurs ajoutes.
- Inputs avec icones.
- Affichage mot de passe ajoute.

UX:
- Loading, succes et erreurs plus clairs.
- Social proof ajoute.`,
    userNotes: `Version 0.2.0

Nouveautes:
- Connexion et inscription plus simples.
- Mot de passe affichable.

Amelioration:
- Page compte plus rassurante.`
  },
  "0.1.9": {
    adminNotes: `Version 0.1.9

Carte:
- Clustering des alertes ajoute.
- Heatmap risque ajoutee.
- Popup riche avec risque et distance.
- Mode Carte / Liste ajoute.

UX:
- Filtres risque, categorie et distance.
- Localisation utilisateur sur la carte.`,
    userNotes: `Version 0.1.9

Nouveautes:
- Carte plus intelligente.
- Zones a risque visibles.
- Alertes proches plus faciles a trouver.`
  },
  "0.1.8": {
    adminNotes: `Version 0.1.8

Fil citoyen:
- Cards plus professionnelles.
- Temps relatif et distance ajoutees.
- Placeholder image ajoute.
- Voir plus pour descriptions longues.

UX:
- Actions partager et voir sur carte.
- Hover et clic plus fluides.`,
    userNotes: `Version 0.1.8

Nouveautes:
- Fil citoyen plus clair.
- Distance, partage et bouton carte ajoutes.

Amelioration:
- Les alertes sont plus faciles a lire.`
  },
  "0.1.7": {
    adminNotes: `Version 0.1.7

Signalement:
- Page de signalement reorganisee en blocs.
- Validation front ajoutee.
- Preview images jusqu'a 3 fichiers.
- Marqueur carte deplacable.

UX:
- Loading anti double-submit.
- Bloc succes avec actions rapides.`,
    userNotes: `Version 0.1.7

Nouveautes:
- Formulaire de signalement plus clair.
- Image preview et position plus facile a choisir.

Amelioration:
- Messages d'erreur et succes plus utiles.`
  },
  "0.1.6": {
    adminNotes: `Version 0.1.6

Profil:
- Page profil plus dynamique.
- Stats utilisateur ajoutees.
- Dernieres alertes visibles.

UX:
- Avatar avec initiale.
- Badge Utilisateur actif.`,
    userNotes: `Version 0.1.6

Nouveautes:
- Profil plus complet.
- Vos stats et dernieres alertes sont visibles.`
  },
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
