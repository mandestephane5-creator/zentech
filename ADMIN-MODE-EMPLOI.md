# ZenTech : gérer les articles et les prix sans serveur

Les articles du site sont maintenant rangés dans un seul fichier, `data/produits.json`.
La page `admin.html` permet de les ajouter, de les modifier et de changer les prix depuis un ordinateur ou un téléphone, sans serveur.
Quand vous cliquez sur « Publier », les changements sont enregistrés sur GitHub et le site se met à jour tout seul.

## Mise en place (une seule fois)

1. **Copier les fichiers** du zip dans le dossier du site ZenTech, en remplaçant les anciens.
2. **Envoyer sur GitHub** depuis ce dossier :
   ```
   git add .
   git commit -m "Gestion des articles sans serveur"
   git push
   ```
3. **Mettre le site en ligne** : sur GitHub, dans le dépôt, ouvrez **Settings**, puis **Pages**. Choisissez la branche **main** et le dossier **/ (root)**, puis cliquez sur **Save**.
4. **Créer la clé d'accès** :
   - Sur github.com, ouvrez **Settings** (photo de profil), puis **Developer settings**, **Personal access tokens** et **Fine-grained tokens**.
   - Cliquez sur **Generate new token**. Nom : « ZenTech admin ». Expiration : 1 an.
   - **Repository access** : *Only select repositories*, puis choisissez le dépôt du site.
   - **Permissions** : **Contents**, réglé sur *Read and write*.
   - Cliquez sur **Generate token** et copiez la clé (elle commence par `github_pat_`).
5. **Ouvrir l'admin** : `https://VOTRE-COMPTE.github.io/VOTRE-DEPOT/admin.html`. Collez la clé et cliquez sur **Se connecter**. Le dépôt est reconnu automatiquement.

## Utilisation

- **Ajouter un article** : nom, catégorie, prix, photo (prise avec le téléphone ou choisie dans la galerie), stock, description et caractéristiques.
- **Prix sur demande** : laissez le prix vide (ou 0). Le site affiche alors « Prix sur demande » avec un bouton pour demander le prix sur WhatsApp. L'article ne peut pas être mis au panier tant qu'il n'a pas de prix.
- **Faire une promotion** : remplissez « Ancien prix ». Le site affiche alors l'ancien prix barré et le pourcentage de remise.
- **Stock** : utilisez les boutons − et + directement dans la liste. À 0, l'article affiche « Rupture » et ne peut plus être ajouté au panier. Laissez le champ vide si vous ne suivez pas le stock.
- **Cacher un article** sans le supprimer : décochez « Visible ».
- **Dupliquer** : l'icône à côté du crayon crée un nouvel article à partir d'un article existant.
- **Publier** : la barre du bas indique le nombre de modifications non publiées. Cliquez sur **Publier sur le site** : le site se met à jour en une minute environ, puis « En ligne » s'affiche en haut.
- **Modifications non publiées** : elles restent enregistrées sur l'appareil, même si vous fermez la page. Vous pouvez aussi les annuler.
- **Paniers des clients** : ils prennent automatiquement les nouveaux prix, et un article caché ou supprimé est retiré des paniers.
- **Référencement Google** : chaque publication refait aussi la page de chaque article, le catalogue (`produits.html`) et le plan du site pour Google. La fiche article montre un aperçu du résultat dans Google. L'icône loupe en haut de l'admin sert à régler l'adresse du site et les outils Google (voir `GUIDE-REFERENCEMENT.md`).
- **Première connexion** : la barre du bas affiche « mise en place du référencement Google ». Cliquez sur **Publier sur le site** une fois pour l'activer.

## Les actualités

L'icône journal en haut de l'admin ouvre les **Actualités** : ajoutez une actualité (titre, date, image, résumé, texte), modifiez-la ou supprimez-la, puis cliquez sur **Publier sur le site**. La page `actualite.html` se met à jour toute seule. Dans le texte, laissez une ligne vide entre deux paragraphes. Décochez « Visible » pour garder une actualité en brouillon.

Trois actualités sont déjà écrites pour démarrer : l'ouverture du site, un guide pour choisir son ordinateur et un article sur les chargeurs GaN. Modifiez-les ou supprimez-les librement.

## Les catégories de l'accueil

Les cases « Nos catégories » de la page d'accueil ouvrent ces catégories. Écrivez-les exactement de cette façon dans l'admin :
`Ordinateurs`, `Écouteurs`, `Montres`, `Chaises Gaming`, `Câbles & Charge`, `Power Banks`, `Accessoires`.
Les boutons de filtre au-dessus des articles, eux, se créent automatiquement avec toutes les catégories utilisées.

## Modifiez les articles uniquement depuis l'admin

Ne modifiez pas `data/produits.json` à la main sur GitHub : les pages des articles ne seraient pas refaites.

## Important si vous modifiez aussi les fichiers sur votre ordinateur

L'admin enregistre ses changements directement sur GitHub. Avant de modifier des fichiers sur votre ordinateur, récupérez donc d'abord la dernière version :
```
git pull
```
Sans cela, `git push` sera refusé.

## Sécurité

- La clé permet de modifier le site. Ne la partagez qu'avec les personnes qui gèrent la boutique.
- En cas de perte de la clé ou de changement de vendeur, supprimez-la sur GitHub (au même endroit qu'à l'étape 4) et créez-en une nouvelle.
- Le fichier `data/produits.json` est public. N'y mettez jamais de prix d'achat ni d'informations internes.

## L'ancien serveur

Le dossier `server/` et la page `dashboard.html` (ventes, factures, clients) ne fonctionnent pas sur GitHub Pages, car ils ont besoin du serveur Node. Ils restent utilisables sur votre ordinateur avec `node server.js`.
Le lien « ADMIN » du site et « Espace admin » du pied de page ouvrent maintenant `admin.html`.
