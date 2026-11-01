# ZenTech : rapport de sécurité

Test d'intrusion réalisé le 1er novembre 2026 sur le dépôt public `mandestephane5-creator/zentech` et sur le site, en local, avec un faux GitHub. Les attaques ont été rejouées après correction.

## Ce qui a été testé

- **Le dépôt public** : recherche de mots de passe, de clés, de données clients et d'anciens fichiers serveur dans tout l'historique.
- **Les injections de code** : des articles, des actualités et des réglages piégés, comme ceux que pourrait écrire un vendeur malveillant. Ils ont été testés dans l'admin, sur l'accueil, le catalogue, les actualités, chaque page produit et la page 404.
- **Les liens piégés** envoyés à un client (code caché dans l'adresse de la page).
- **Le panier** modifié ou abîmé dans le navigateur.
- **L'admin affiché dans la page d'un autre site** (clickjacking).
- **La clé GitHub** : où elle est envoyée, si elle est visible dans la page, le stockage, la console ou les adresses.
- **Les fichiers externes** et les liens qui ouvrent un nouvel onglet.

## Failles trouvées et corrigées

| # | Gravité | Faille | Correction |
|---|---|---|---|
| 1 | Élevée | La clé GitHub était enregistrée en clair dans le navigateur. Une personne ayant accès au PC pouvait la lire. | Clé chiffrée avec le code de verrouillage, qui est demandé à chaque ouverture et après 10 minutes sans activité. Au bout de 5 codes faux, la clé est effacée. |
| 2 | Élevée | L'admin pouvait être affiché, invisible, dans la page d'un site piège, pour faire cliquer l'utilisateur à son insu. | L'admin refuse de s'afficher dans un autre site. |
| 3 | Élevée | Une adresse de site piégée dans les réglages injectait du code dans la page 404, `robots.txt` et le plan du site. | L'adresse est vérifiée et nettoyée. Seules les adresses `https://` propres sont acceptées. |
| 4 | Moyenne | Une date d'actualité piégée pouvait insérer du code dans l'admin. | Les dates sont vérifiées (format AAAA-MM-JJ), et le texte affiché est échappé. |
| 5 | Moyenne | Aucune politique de sécurité (CSP) sur les pages. | CSP sur toutes les pages. Dans l'admin, elle bloque tout script étranger et tout envoi de données ailleurs que vers GitHub. |
| 6 | Moyenne | La clé pouvait être affichée en clair (bouton « œil ») et le navigateur proposait de l'enregistrer comme mot de passe. | La clé est toujours masquée, ne peut pas être copiée, et le navigateur ne propose plus de l'enregistrer. Même chose pour le code de verrouillage. |
| 7 | Moyenne | Les icônes Font Awesome étaient chargées sans contrôle d'intégrité. Si le serveur des icônes était piraté, la page aussi. | Contrôle d'intégrité (SRI) : le navigateur refuse un fichier modifié. |
| 8 | Faible | Un panier modifié dans le navigateur pouvait insérer du code, et un panier abîmé faisait planter le site. | Le panier est relu avec prudence : les quantités et les prix sont vérifiés, et une donnée abîmée est ignorée. |
| 9 | Faible | Les liens WhatsApp ouverts dans un nouvel onglet gardaient un accès à la page ZenTech. | Protection `noopener` sur tous les liens externes. |
| 10 | Faible | L'image de fond de l'accueil était chargée depuis Bing : l'adresse IP des visiteurs partait chez un tiers. | Image retirée (le fond actuel de l'accueil est inchangé). |
| 11 | Faible | Le message d'historique des publications affichait « -1 modification ». | Calcul corrigé. |

## Ce qui était déjà sûr

- Le dépôt ne contient aucun mot de passe, aucune clé et aucune donnée client. L'ancien dossier `server/` n'a pas été envoyé. Un fichier `.gitignore` empêche désormais de l'envoyer par erreur.
- La clé n'est envoyée qu'à `api.github.com`. Elle n'apparaît jamais dans une adresse ni dans la console.
- Les noms, descriptions, caractéristiques et actualités sont bien échappés sur toutes les pages publiques.
- Les liens piégés (code dans l'adresse) n'ont aucun effet.
- Le site est servi en HTTPS par GitHub.
- `data/produits.json` ne contient aucun prix d'achat.

## Ce qui reste de votre côté (le plus important)

1. **Activez la double authentification sur GitHub** : `https://github.com/settings/security`, puis **Enable two-factor authentication**. Si quelqu'un vole le mot de passe de votre compte GitHub, il peut modifier le site sans passer par l'admin : c'est le vrai point faible.
2. **Ne donnez l'accès au dépôt qu'à des personnes de confiance.** Un collaborateur peut modifier tous les fichiers du site, pas seulement les articles. Retirez l'accès dès qu'une personne quitte la boutique.
3. **Une clé par personne**, jamais envoyée par WhatsApp ou par e-mail. En cas de doute, supprimez-la sur `https://github.com/settings/tokens` et créez-en une nouvelle.
4. **Sur le PC de l'entreprise**, verrouillez la session Windows (touches Windows + L) dès que vous vous absentez.
5. **Facultatif** : pour ne pas afficher votre adresse e-mail dans l'historique public du dépôt, cochez **Keep my email addresses private** sur `https://github.com/settings/emails`.

## Limites connues

- GitHub Pages ne permet pas d'ajouter des en-têtes de sécurité côté serveur. Les protections sont donc placées dans les pages elles-mêmes, ce qui couvre les navigateurs actuels.
- Sur les pages publiques, la CSP autorise encore le code écrit directement dans la page, car les boutons du site en ont besoin. Comme tout le contenu est échappé et testé, ce n'est pas exploitable aujourd'hui.
- La clé « classique » donne accès à tous les dépôts publics du compte. Pour limiter ce risque, gardez sur ce compte uniquement les sites de la boutique, ou créez plus tard une organisation GitHub « ZenTech ».
