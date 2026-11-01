# ZenTech : guide du référencement Google (SEO)

Ce guide explique ce qui a été fait sur le site pour Google, et ce qu'il reste à faire de votre côté pour monter dans les résultats de recherche.

## 1. Ce que le site fait maintenant tout seul

**Une page par article.** Chaque produit a sa propre adresse, par exemple `produit/hp-elitebook-840-g8.html`. Google peut ainsi proposer directement la page du produit à quelqu'un qui cherche « HP EliteBook 840 Ouagadougou ». L'adresse d'un article ne change plus ensuite, même si vous modifiez son nom, pour ne pas perdre sa place dans Google.

**Titres et descriptions.** Chaque page a un titre et une description différents, avec le nom du produit, le prix en FCFA, la ville et les modes de paiement. C'est ce texte que Google affiche dans ses résultats.

**Informations lues par Google.** Le site décrit à Google :
- la boutique : adresse, téléphone, horaires et paiements acceptés ;
- chaque produit : prix, disponibilité et photo ;
- les questions fréquentes ;
- le chemin de navigation (Accueil › Ordinateurs › Produit).

Avec ces informations, Google peut afficher le prix ou la disponibilité directement dans ses résultats.

**Plan du site et robots.** Le fichier `sitemap.xml` donne à Google la liste de toutes les pages. Le fichier `robots.txt` lui interdit l'espace admin.

**Catalogue complet.** La page `produits.html` liste tous les articles, rangés par catégorie.

**Vitesse et mobile.** Le chargeur se ferme dès que la page est prête, les images ont des dimensions fixes et se chargent au fur et à mesure, et le site s'affiche sans défilement de côté sur téléphone.

**Image de partage.** Quand quelqu'un partage le lien sur WhatsApp, Facebook ou TikTok, un aperçu propre s'affiche (`img/partage.jpg`).

**Mise à jour automatique.** À chaque clic sur « Publier sur le site » dans l'admin, tout est refait : pages produits, catalogue, plan du site et informations de la boutique.

**Attention :** modifiez les articles uniquement depuis l'admin. Si vous modifiez `data/produits.json` à la main sur GitHub, les pages produits ne seront pas refaites.

## 2. À faire une seule fois (30 minutes)

### a. Publier la mise en place du référencement
Juste après avoir mis les nouveaux fichiers sur GitHub, ouvrez `admin.html`. La barre du bas affiche « mise en place du référencement Google ».
1. Cliquez sur l'icône loupe en haut à droite.
2. Vérifiez l'**adresse du site**. Si le site est sur GitHub Pages, laissez le champ vide : l'adresse est détectée automatiquement.
3. Cliquez sur **Publier sur le site**.

Si vous achetez plus tard un nom de domaine (par exemple zentech.bf), modifiez l'adresse dans ce même panneau, puis publiez.

### b. Google Search Console (indispensable)
C'est l'outil gratuit de Google pour lui présenter votre site et suivre votre place dans les résultats.
1. Allez sur **search.google.com/search-console** avec le compte Google de la boutique.
2. Cliquez sur **Ajouter une propriété**, choisissez **Préfixe de l'URL**, puis collez l'adresse du site.
3. Choisissez la méthode **Balise HTML** et copiez la balise.
4. Dans l'admin, cliquez sur l'icône loupe, collez la balise dans « Google Search Console », cliquez sur **Enregistrer**, puis sur **Publier**.
5. Attendez une minute, puis cliquez sur **Valider** chez Google.
6. Dans le menu **Sitemaps**, ajoutez `sitemap.xml`. L'adresse complète est affichée dans l'admin, avec un bouton « Copier ».

### c. Fiche Google Business Profile (très important pour Ouagadougou)
C'est la fiche qui apparaît sur Google Maps et à droite des résultats quand on cherche « boutique informatique Ouagadougou ». Pour un commerce local, c'est souvent ce qui rapporte le plus de clients.
1. Allez sur **business.google.com** et créez la fiche « ZenTech ».
2. Choisissez la catégorie (par exemple « Magasin d'informatique » ou « Magasin d'électronique »), puis indiquez l'adresse, le téléphone, les horaires et le lien du site.
3. Ajoutez des photos de la boutique et des produits.
4. Demandez à vos clients satisfaits de laisser un avis sur cette fiche.

Le nom, l'adresse et le téléphone doivent être écrits exactement comme sur le site.

### d. Google Analytics (facultatif)
Pour voir le nombre de visiteurs et les produits les plus regardés :
1. Créez un compte sur **analytics.google.com** et ajoutez un flux « Web » avec l'adresse du site.
2. Copiez l'**ID de mesure** (G-XXXXXXXXXX) dans l'admin, à l'icône loupe, puis publiez.

## 3. Les liens vers votre site (backlinks)

Chaque site sérieux qui fait un lien vers le vôtre compte comme un « vote de confiance » pour Google. Commencez par les liens les plus faciles :
- **Vos réseaux sociaux** : mettez le lien du site dans la bio TikTok, Instagram, Facebook et Snapchat, et dans le statut WhatsApp Business.
- **Les liens du site vers vos réseaux** : les boutons TikTok, Instagram, Facebook, Snapchat et YouTube du site pointent encore vers « # ». Remplacez-les par vos vraies adresses dans `index.html`, et ajoutez-les aussi dans `js/seo-pages.js`, dans la ligne `var RESEAUX = [];`. Exemple : `var RESEAUX = ['https://www.tiktok.com/@zentech', 'https://www.facebook.com/zentech'];`.
- **Les annuaires d'entreprises du Burkina Faso**, avec le même nom, la même adresse, le même téléphone et le lien du site.
- **Vos partenaires et fournisseurs** : demandez-leur de mettre un lien vers ZenTech sur leur site.
- **La presse et les blogs locaux** : une ouverture, une grosse promotion ou un concours peuvent donner lieu à un article avec un lien.
- **Les créateurs de contenu** qui testent vos produits : demandez un lien vers la page du produit.

Évitez d'acheter des liens ou d'utiliser des sites de liens en masse : Google pénalise ces pratiques.

## 4. Le contenu : ce qui fait vraiment la différence

- **Une vraie description pour chaque article.** Dans l'admin, la fiche article montre un **aperçu Google** et compte les caractères. Écrivez 1 à 2 phrases avec les mots que vos clients tapent vraiment, par exemple « ordinateur portable HP Ouagadougou », « écouteurs sans fil Ouagadougou » ou « montre connectée Burkina ». Mettez l'essentiel au début.
- **Les prix.** Un article avec son prix peut apparaître dans Google avec le prix affiché. Les articles « Prix sur demande » sont bien référencés, mais sans prix dans les résultats.
- **Les caractéristiques.** Remplissez-les toujours (processeur, mémoire, autonomie…), car les clients les recherchent.
- **De vraies photos.** Utilisez des photos nettes, sur fond blanc ou détouré, de préférence prises par vous.
- **Des avis réels.** Les étoiles et les témoignages affichés sur le site doivent venir de vrais clients. S'il s'agit encore d'exemples, remplacez-les par de vrais avis, ou mettez 0 avis dans l'admin pour ne pas afficher d'étoiles.
- **Les logos partenaires.** Dans `index.html`, remplacez « Nom du partenaire » par le vrai nom de chaque partenaire, ou retirez la section si elle n'est pas utilisée.

## 5. Suivre les résultats

Dans **Search Console**, rubrique **Performances**, regardez chaque mois les recherches qui amènent des visiteurs, le nombre de clics et votre position moyenne.
- Une recherche apparaît souvent mais reçoit peu de clics : améliorez le titre ou la description de la page concernée.
- Un produit est très recherché : mettez-le en avant sur l'accueil et sur les réseaux sociaux.

Le référencement prend du temps : comptez **2 à 3 mois** avant de voir des résultats nets. La régularité compte (nouveaux articles, descriptions soignées, avis clients).
