/* ===== ZENTECH : pages de référencement (SEO) =====
   Fabrique, à partir de data/produits.json :
   - une page par article : produit/<nom-de-l-article>.html
   - le catalogue complet : produits.html
   - sitemap.xml, robots.txt et 404.html
   Utilisé par admin.html à chaque publication (et par Node pour la première génération).
*/
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ZTSEO = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ----- Informations de la boutique (affichées et lues par Google) -----
  var BOUTIQUE = {
    nom: 'ZenTech',
    ville: 'Ouagadougou',
    pays: 'Burkina Faso',
    rue: 'Secteur 15, près du marché',
    tel: '+226 72 25 69 37',
    telLien: '+22672256937',
    waContact: '22672256937',
    waCommande: '22665074260', // même numéro que le panier du site (js/app.js)
    email: 'contact@zentech.bf'
  };

  var SITE_PAR_DEFAUT = 'https://www.zentech.bf/';

  // Réseaux sociaux de la boutique (adresses complètes). Ils aident Google à relier le site
  // à vos pages : ajoutez-les ici dès qu'elles existent, ex. 'https://www.tiktok.com/@zentech'.
  var RESEAUX = [];

  // ----- Réglages Google (enregistrés dans data/site.json par l'admin) -----
  function idGA(v) {
    v = String(v || '').trim().toUpperCase();
    return /^G-[A-Z0-9]{4,15}$/.test(v) ? v : '';
  }
  function codeGSC(v) {
    v = String(v || '').trim();
    var m = v.match(/content\s*=\s*["']([^"']+)["']/i);   // balise complète collée
    if (m) v = m[1];
    return /^[A-Za-z0-9_\-]{10,120}$/.test(v) ? v : '';
  }
  function statistiques(ga) {
    ga = idGA(ga);
    if (!ga) return '';
    return '<script async src="https://www.googletagmanager.com/gtag/js?id=' + ga + '"></script>\n' +
      '<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","' + ga + '");</script>\n';
  }

  // ----- Outils -----
  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function jsonLd(obj) {
    return '<script type="application/ld+json">' +
      JSON.stringify(obj).replace(/</g, '\\u003c') + '</script>';
  }
  function prix(n) {
    return String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
  }
  function slugify(s) {
    return String(s || '')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/&/g, ' et ')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      .slice(0, 70).replace(/-+$/g, '') || 'article';
  }
  function couper(t, max) {
    t = String(t || '').replace(/\s+/g, ' ').trim();
    if (t.length <= max) return t;
    var c = t.slice(0, max - 1);
    var i = c.lastIndexOf(' ');
    return (i > max * 0.6 ? c.slice(0, i) : c).replace(/[\s,;:.–-]+$/, '') + '…';
  }
  function base(u) {
    u = String(u || SITE_PAR_DEFAUT).trim();
    return u.charAt(u.length - 1) === '/' ? u : u + '/';
  }
  function cheminImg(img) { return encodeURI(String(img || '')).replace(/#/g, '%23'); }
  function imgAbs(img, b) { return /^https?:/i.test(img) ? img : b + cheminImg(img); }
  function imgRel(img, prefixe) { return /^https?:/i.test(img) ? img : prefixe + cheminImg(img); }
  function enPromo(p) { return p.ancienPrix && Number(p.ancienPrix) > Number(p.prix); }
  function remise(p) { return enPromo(p) ? Math.round((1 - p.prix / p.ancienPrix) * 100) : 0; }
  function enRupture(p) { return p.qte === 0; }
  function surDemande(p) { return !(Number(p.prix) > 0); }   // prix 0 dans l'admin = « Prix sur demande »
  function prixAff(p) { return surDemande(p) ? 'Prix sur demande' : prix(p.prix); }
  function visibles(liste) { return (liste || []).filter(function (p) { return p && p.visible !== false; }); }

  // Donne à chaque article une adresse unique et stable : produit/<slug>.html
  // Une adresse déjà attribuée ne change plus (même si le nom change), pour ne pas
  // perdre la place gagnée dans Google. Les nouveaux articles reçoivent une adresse tirée du nom.
  function attribuerSlugs(liste) {
    var pris = {};
    (liste || []).forEach(function (p) {
      var s = String(p.slug || '').toLowerCase();
      if (/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s) && !pris[s]) { pris[s] = true; p.slug = s; }
      else p.slug = '';
    });
    (liste || []).forEach(function (p) {
      if (p.slug) return;
      var s = slugify(p.nom);
      if (pris[s]) s = s + '-' + p.id;
      while (pris[s]) s = s + '-2';
      pris[s] = true;
      p.slug = s;
    });
    return liste;
  }

  // ----- Textes pour Google -----
  function titre(p) {
    if (surDemande(p)) {
      var u = p.nom + ' | ZenTech Ouagadougou';
      return u.length > 65 ? couper(p.nom, 52) + ' | ZenTech' : u;
    }
    var t = p.nom + ' – ' + prix(p.prix) + ' | ZenTech Ouagadougou';
    if (t.length > 65) t = p.nom + ' – ' + prix(p.prix) + ' | ZenTech';
    if (t.length > 65) t = couper(p.nom, 50) + ' | ZenTech';
    return t;
  }
  function description(p) {
    var d = String(p.desc || '').trim();
    if (d && !/[.!?…]$/.test(d)) d += '.';
    var fin = (enRupture(p) ? 'Bientôt de retour' : surDemande(p) ? 'Prix sur demande' : prix(p.prix)) +
      ' chez ZenTech Ouagadougou. Livraison en 24h à Ouaga, paiement Orange Money ou Moov Money.';
    return couper((d ? d + ' ' : p.nom + ' : ') + fin, 158);
  }
  function urlProduit(p, b) { return base(b) + 'produit/' + p.slug + '.html'; }

  // ----- Morceaux de page communs -----
  function tete(o) {
    return '<!DOCTYPE html>\n<html lang="fr" data-theme="dark">\n<head>\n' +
      '<meta charset="UTF-8">\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
      '<title>' + esc(o.titre) + '</title>\n' +
      '<meta name="description" content="' + esc(o.description) + '">\n' +
      (o.noindex ? '<meta name="robots" content="noindex">\n' : '<link rel="canonical" href="' + esc(o.url) + '">\n') +
      '<meta property="og:type" content="' + (o.ogType || 'website') + '">\n' +
      '<meta property="og:site_name" content="ZenTech">\n' +
      '<meta property="og:locale" content="fr_FR">\n' +
      '<meta property="og:title" content="' + esc(o.titre) + '">\n' +
      '<meta property="og:description" content="' + esc(o.description) + '">\n' +
      (o.url ? '<meta property="og:url" content="' + esc(o.url) + '">\n' : '') +
      '<meta property="og:image" content="' + esc(o.image) + '">\n' +
      '<meta name="twitter:card" content="summary_large_image">\n' +
      '<meta name="theme-color" content="#0a0a0a">\n' +
      '<link rel="icon" type="image/png" href="' + o.p + 'img/icons/favicon-48.png">\n' +
      '<script>document.documentElement.className="js";setTimeout(function(){if(!window.ztMotion)document.documentElement.classList.remove("js")},2500);try{var t=localStorage.getItem("zt-theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}</script>\n' +
      '<link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>\n' +
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap">\n' +
      '<link rel="stylesheet" href="' + o.p + 'css/produit.css">\n' +
      '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" media="print" onload="this.media=\'all\'">\n' +
      (o.ld || '') + '\n' + statistiques(o.ga) + '</head>\n<body>\n';
  }

  function entete(prefixe) {
    return '<header class="pp-top">\n' +
      '  <a class="pp-logo" href="' + (prefixe || './') + '" aria-label="ZenTech, accueil"><img src="' + prefixe + 'img/logo-zentech-icone.png" alt="" width="34" height="34"><b class="pp-wm">Zen<span>Tech</span></b></a>\n' +
      '  <nav class="pp-nav" aria-label="Menu principal">\n' +
      '    <a href="' + prefixe + 'index.html#section-articles">Nouveautés</a>\n' +
      '    <a href="' + prefixe + 'produits.html">Catalogue</a>\n' +
      '    <a href="' + prefixe + 'actualite.html">Actualités</a>\n' +
      '    <a href="' + prefixe + 'index.html#section-contact">Contact</a>\n' +
      '  </nav>\n' +
      '  <a class="pp-cart" href="' + prefixe + 'index.html#panier" aria-label="Voir le panier"><i class="fas fa-cart-shopping"></i><span id="ppCount">0</span></a>\n' +
      '</header>\n';
  }

  function pied(prefixe) {
    return '<footer class="pp-foot">\n' +
      '  <div class="pp-foot-in">\n' +
      '    <div><a class="pp-logo" href="' + (prefixe || './') + '"><img src="' + prefixe + 'img/logo-zentech-icone.png" alt="" width="34" height="34" loading="lazy"><b class="pp-wm">Zen<span>Tech</span></b></a>\n' +
      '      <p>Boutique high-tech à Ouagadougou : ordinateurs portables, écouteurs sans fil, montres connectées, chaises gaming, chargeurs et power banks.</p></div>\n' +
      '    <address>\n' +
      '      <b>ZenTech</b><br>' + esc(BOUTIQUE.rue) + '<br>Ouagadougou, Burkina Faso<br>\n' +
      '      <a href="tel:' + BOUTIQUE.telLien + '">' + esc(BOUTIQUE.tel) + '</a> · <a href="mailto:' + BOUTIQUE.email + '">' + BOUTIQUE.email + '</a><br>\n' +
      '      Lun – Sam : 8h – 19h · Dim : 10h – 16h\n' +
      '    </address>\n' +
      '  </div>\n' +
      '  <p class="pp-copy">© ' + new Date().getFullYear() + ' ZenTech Burkina Faso</p>\n' +
      '</footer>\n';
  }

  function carte(p, prefixe) {
    var badge = enRupture(p) ? '<span class="pc-badge out">Rupture</span>'
      : enPromo(p) ? '<span class="pc-badge">-' + remise(p) + ' %</span>'
      : p.badge === 'new' ? '<span class="pc-badge new">Nouveau</span>' : '';
    return '<a class="pc" href="' + prefixe + 'produit/' + p.slug + '.html">' +
      '<span class="pc-img">' + badge + '<img src="' + esc(imgRel(p.img, prefixe)) + '" alt="' + esc(p.nom) + '" loading="lazy" decoding="async" width="300" height="300"></span>' +
      '<span class="pc-cat">' + esc(p.categorie) + '</span>' +
      '<span class="pc-nom">' + esc(p.nom) + '</span>' +
      '<span class="pc-bas"><span class="pc-prix' + (surDemande(p) ? ' dem' : '') + '">' + prixAff(p) + (enPromo(p) ? ' <s>' + prix(p.ancienPrix) + '</s>' : '') + '</span>' +
      '<span class="pc-go" aria-hidden="true"><i class="fas fa-arrow-right"></i></span></span>' +
      '</a>';
  }

  // Tracé de circuit décoratif (même dessin sur toutes les pages)
  var CIRCUIT = '<svg class="pp-circuit" viewBox="0 0 600 220" aria-hidden="true" focusable="false">' +
    '<g fill="none" stroke="currentColor" stroke-width="1.5">' +
    '<path d="M0 40H140l30 30H300l20-20H420"/><path d="M0 110H90l40 40H260l30-30H600"/>' +
    '<path d="M60 220V170l30-30H200"/><path d="M380 0V40l40 40H560l40-40"/><path d="M470 220V160l-30-30H360"/>' +
    '</g><g fill="currentColor"><circle cx="420" cy="50" r="4"/><circle cx="200" cy="140" r="4"/>' +
    '<circle cx="360" cy="130" r="4"/><circle cx="560" cy="80" r="4"/></g>' +
    '<circle class="pp-pulse" r="3"><animateMotion dur="5s" repeatCount="indefinite" path="M0 110H90l40 40H260l30-30H600"/></circle>' +
    '</svg>';

  // ----- Page d'un article -----
  function pageProduit(p, tous, b, reg) {
    b = base(b); reg = reg || {};
    var url = urlProduit(p, b);
    var catSlug = 'cat-' + slugify(p.categorie);
    var specs = Object.keys(p.specs || {}).filter(function (k) { return String(p.specs[k]).trim(); });
    var meme = tous.filter(function (x) { return x.id !== p.id && x.categorie === p.categorie; });
    var autres = tous.filter(function (x) { return x.id !== p.id && x.categorie !== p.categorie; });
    var sim = meme.concat(autres).slice(0, 4);
    var waTexte = surDemande(p)
      ? 'Bonjour ZenTech, je voudrais connaître le prix de : ' + p.nom + '. ' + url
      : 'Bonjour ZenTech, je souhaite commander : ' + p.nom + ' (' + prix(p.prix).replace(/ /g, ' ') + '). ' + url;

    // fiche produit pour Google (seulement quand le prix est affiché : Google exige un prix)
    var ld = jsonLd([].concat(surDemande(p) ? [] : [
      {
        '@context': 'https://schema.org', '@type': 'Product',
        name: p.nom, sku: 'ZT-' + p.id, category: p.categorie,
        image: [imgAbs(p.img, b)],
        description: String(p.desc || p.nom),
        offers: {
          '@type': 'Offer', url: url, priceCurrency: 'XOF', price: String(Math.round(p.prix)),
          availability: enRupture(p) ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
          seller: { '@type': 'Organization', name: 'ZenTech' }
        }
      }]).concat([
      {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Accueil', item: b },
          { '@type': 'ListItem', position: 2, name: p.categorie, item: b + 'produits.html#' + catSlug },
          { '@type': 'ListItem', position: 3, name: p.nom, item: url }
        ]
      }
    ]));

    var donnees = JSON.stringify({ id: p.id, nom: p.nom, prix: p.prix, img: p.img, categorie: p.categorie, rupture: enRupture(p) })
      .replace(/</g, '\\u003c');

    return tete({ titre: titre(p), description: description(p), url: url, image: imgAbs(p.img, b), ogType: 'product', p: '../', ld: ld, ga: reg.ga }) +
      entete('../') +
      '<main class="pp-wrap">\n' +
      '  <nav class="crumbs" aria-label="Fil d\'Ariane"><a href="../">Accueil</a><i class="fas fa-chevron-right" aria-hidden="true"></i>' +
      '<a href="../produits.html#' + catSlug + '">' + esc(p.categorie) + '</a><i class="fas fa-chevron-right" aria-hidden="true"></i>' +
      '<span aria-current="page">' + esc(p.nom) + '</span></nav>\n' +
      '  <article class="pp">\n' +
      '    <div class="pp-media">' +
      '<img src="' + esc(imgRel(p.img, '../')) + '" alt="' + esc(p.nom + ' – ' + p.categorie + ', ZenTech Ouagadougou') + '" width="600" height="600" fetchpriority="high"></div>\n' +
      '    <div class="pp-info">\n' +
      '      <p class="pp-cat">' + esc(p.categorie) + '</p>\n' +
      '      <h1>' + esc(p.nom) + '</h1>\n' +
      '      <p class="pp-prix' + (surDemande(p) ? ' dem' : '') + '"><strong>' + prixAff(p) + '</strong>' +
      (enPromo(p) ? ' <s>' + prix(p.ancienPrix) + '</s> <span class="pp-remise">-' + remise(p) + ' %</span>' : '') + '</p>\n' +
      '      <p class="pp-stock ' + (enRupture(p) ? 'out' : 'in') + '"><i class="fas ' + (enRupture(p) ? 'fa-circle-xmark' : 'fa-circle-check') + '" aria-hidden="true"></i> ' +
      (enRupture(p) ? 'Rupture de stock, bientôt de retour' : (p.qte ? 'En stock' : 'Disponible')) + '</p>\n' +
      (p.desc ? '      <p class="pp-desc">' + esc(p.desc) + '</p>\n' : '') +
      '      <div class="pp-acts">\n' +
      (enRupture(p)
        ? '        <button class="pp-add" type="button" disabled><i class="fas fa-ban"></i> Indisponible</button>\n'
        : surDemande(p) ? ''
        : '        <button class="pp-add" type="button" id="ppAdd"><i class="fas fa-cart-plus"></i> Ajouter au panier</button>\n') +
      '        <a class="pp-wa" href="https://wa.me/' + BOUTIQUE.waCommande + '?text=' + encodeURIComponent(waTexte) + '" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> ' +
      (enRupture(p) ? 'Me prévenir sur WhatsApp' : surDemande(p) ? 'Demander le prix sur WhatsApp' : 'Commander sur WhatsApp') + '</a>\n' +
      '      </div>\n' +
      '      <ul class="pp-plus">\n' +
      '        <li><i class="fas fa-truck-fast" aria-hidden="true"></i> Livraison en 24h à Ouagadougou, 2 à 4 jours ailleurs au Burkina</li>\n' +
      '        <li><i class="fas fa-mobile-screen" aria-hidden="true"></i> Paiement Orange Money, Moov Money ou à la livraison</li>\n' +
      '        <li><i class="fas fa-shield-halved" aria-hidden="true"></i> Garantie de 6 mois minimum</li>\n' +
      '      </ul>\n' +
      (specs.length
        ? '      <h2>Caractéristiques</h2>\n      <table class="pp-specs">' + specs.map(function (k) {
            return '<tr><th scope="row">' + esc(k) + '</th><td>' + esc(p.specs[k]) + '</td></tr>';
          }).join('') + '</table>\n'
        : '') +
      '    </div>\n' +
      '  </article>\n' +
      (sim.length
        ? '  <section class="pp-sim"><h2>Vous aimerez aussi</h2><div class="pc-grid">' +
          sim.map(function (s) { return carte(s, '../'); }).join('') + '</div></section>\n'
        : '') +
      '</main>\n' +
      pied('../') +
      '<div class="pp-toast" id="ppToast" role="status" aria-live="polite"></div>\n' +
      '<script id="ppData" type="application/json">' + donnees + '</script>\n' +
      '<script src="../js/produit.js" defer></script>\n' +
      '</body>\n</html>\n';
  }

  // ----- Catalogue complet -----
  function pageCatalogue(tous, b, reg) {
    b = base(b); reg = reg || {};
    var cats = [];
    tous.forEach(function (p) { if (cats.indexOf(p.categorie) === -1) cats.push(p.categorie); });
    var url = b + 'produits.html';
    var desc = couper('Catalogue ZenTech à Ouagadougou : ' + cats.join(', ') +
      '. Prix en FCFA, livraison en 24h à Ouaga, paiement Orange Money et Moov Money.', 158);
    var ld = jsonLd({
      '@context': 'https://schema.org', '@type': 'ItemList', name: 'Catalogue ZenTech',
      itemListElement: tous.map(function (p, i) {
        return { '@type': 'ListItem', position: i + 1, url: urlProduit(p, b), name: p.nom };
      })
    });
    return tete({ titre: 'Catalogue high-tech à Ouagadougou, prix en FCFA | ZenTech', description: desc, url: url,
        image: b + 'img/partage.jpg', p: '', ld: ld, ga: reg.ga }) +
      entete('') +
      '<main class="pp-wrap">\n' +
      '  <nav class="crumbs" aria-label="Fil d\'Ariane"><a href="./">Accueil</a><i class="fas fa-chevron-right" aria-hidden="true"></i><span aria-current="page">Catalogue</span></nav>\n' +
      '  <header class="cat-head">\n' +
      '    <p class="cat-kicker">Catalogue · ' + tous.length + ' articles</p>\n' +
      '    <h1>Tous nos produits high\u2011tech à Ouagadougou</h1>\n' +
      '    <p>Ordinateurs, écouteurs, montres connectées, chaises gaming et accessoires. Commandez en ligne ou sur WhatsApp : livraison en 24 h à Ouaga, paiement Orange Money ou Moov Money.</p>\n' +
      '  </header>\n' +
      '  <nav class="cat-chips" aria-label="Catégories">' + cats.map(function (c) {
        return '<a href="#cat-' + slugify(c) + '">' + esc(c) + ' <small>' + tous.filter(function (p) { return p.categorie === c; }).length + '</small></a>';
      }).join('') + '</nav>\n' +
      cats.map(function (c) {
        var l = tous.filter(function (p) { return p.categorie === c; });
        return '  <section class="cat-sec" id="cat-' + slugify(c) + '"><h2>' + esc(c) + ' <small>' + l.length + ' article' + (l.length > 1 ? 's' : '') + '</small></h2>' +
          '<div class="pc-grid">' + l.map(function (p) { return carte(p, ''); }).join('') + '</div></section>\n';
      }).join('') +
      '</main>\n' +
      pied('') +
      '<script src="js/produit.js" defer></script>\n' +
      '</body>\n</html>\n';
  }

  // ----- Page 404 (adresses absolues : elle peut s'afficher à n'importe quel niveau) -----
  function page404(b) {
    b = base(b);
    return '<!DOCTYPE html>\n<html lang="fr">\n<head>\n<meta charset="UTF-8">\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
      '<title>Page introuvable | ZenTech</title>\n<meta name="robots" content="noindex">\n' +
      '<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0a0a0a;color:#fff;font-family:"Segoe UI",system-ui,sans-serif;text-align:center;padding:24px;' +
      'background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:44px 44px}' +
      'b{font-size:5rem;letter-spacing:-.04em;color:#ff0000;display:block;line-height:1}h1{font-size:1.4rem;margin:12px 0 8px}p{color:rgba(255,255,255,.6);margin:0 0 24px}' +
      'a{display:inline-block;margin:4px;padding:12px 20px;border-radius:10px;background:#ff0000;color:#fff;text-decoration:none;font-weight:600}a.g{background:rgba(255,255,255,.08)}</style>\n' +
      '</head>\n<body>\n<main><b>404</b><h1>Cette page n\'existe pas ou plus</h1>' +
      '<p>L\'article a peut-être été retiré ou renommé.</p>' +
      '<a href="' + b + '">Accueil ZenTech</a><a class="g" href="' + b + 'produits.html">Voir le catalogue</a></main>\n</body>\n</html>\n';
  }

  // ----- Accueil : partie de l'en-tête qui dépend de l'adresse du site et des réglages Google -----
  var DEBUT = '<!-- zt:seo -->', FIN = '<!-- /zt:seo -->';
  function blocAccueil(b, reg) {
    b = base(b); reg = reg || {};
    var gsc = codeGSC(reg.gsc);
    var boutique = {
      '@type': 'ElectronicsStore', '@id': b + '#boutique', name: 'ZenTech', url: b,
      logo: b + 'img/logo-zentech-icone.png', image: b + 'img/partage.jpg',
      description: 'Boutique high-tech à Ouagadougou : ordinateurs portables, écouteurs sans fil, montres connectées, chaises gaming, chargeurs et power banks.',
      telephone: BOUTIQUE.telLien, email: BOUTIQUE.email,
      address: { '@type': 'PostalAddress', streetAddress: BOUTIQUE.rue, addressLocality: BOUTIQUE.ville, addressCountry: 'BF' },
      openingHoursSpecification: [
        { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '08:00', closes: '19:00' },
        { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Sunday', opens: '10:00', closes: '16:00' }
      ],
      paymentAccepted: 'Orange Money, Moov Money, paiement à la livraison',
      currenciesAccepted: 'XOF',
      areaServed: { '@type': 'Country', name: 'Burkina Faso' }
    };
    if (RESEAUX.length) boutique.sameAs = RESEAUX.slice();
    var ld = { '@context': 'https://schema.org', '@graph': [boutique,
      { '@type': 'WebSite', '@id': b + '#site', url: b, name: 'ZenTech', inLanguage: 'fr', publisher: { '@id': b + '#boutique' } }] };
    return DEBUT + '\n' +
      '  <link rel="canonical" href="' + esc(b) + '">\n' +
      '  <meta property="og:url" content="' + esc(b) + '">\n' +
      '  <meta property="og:image" content="' + esc(b) + 'img/partage.jpg">\n' +
      '  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">\n' +
      '  <meta property="og:image:alt" content="ZenTech, boutique high-tech à Ouagadougou">\n' +
      (gsc ? '  <meta name="google-site-verification" content="' + gsc + '">\n' : '') +
      '  ' + jsonLd(ld) + '\n' +
      (idGA(reg.ga) ? statistiques(reg.ga).replace(/^/gm, '  ') : '') +
      '  ' + FIN;
  }
  // Cartes des articles écrites directement dans l'accueil : visibles même si le JavaScript ne se lance pas
  var DEB_A = '<!-- zt:articles -->', FIN_A = '<!-- /zt:articles -->';
  function cartesAccueil(liste) {
    attribuerSlugs(liste);
    return visibles(liste).map(function (p) {
      var lien = 'produit/' + p.slug + '.html';
      var badge = enRupture(p) ? '<span class="badge-pill badge-out">Rupture</span>'
        : enPromo(p) ? '<span class="badge-pill badge-promo">-' + remise(p) + ' %</span>'
        : p.badge === 'new' ? '<span class="badge-pill badge-new">Nouveau</span>' : '';
      var bouton = surDemande(p)
        ? '<a class="btn-add btn-dem" href="https://wa.me/' + BOUTIQUE.waCommande + '?text=' + encodeURIComponent('Bonjour ZenTech, je voudrais connaître le prix de : ' + p.nom) + '" target="_blank" rel="noopener" aria-label="Demander le prix de ' + esc(p.nom) + ' sur WhatsApp"><i class="fab fa-whatsapp"></i></a>'
        : '<a class="btn-add" href="' + lien + '" aria-label="Voir ' + esc(p.nom) + '"><i class="fas fa-plus"></i></a>';
      return '<div class="art-card"><div class="art-img">' + badge +
        '<img src="' + esc(imgRel(p.img, '')) + '" alt="' + esc(p.nom + ' – ' + p.categorie) + '" loading="lazy" decoding="async" width="300" height="300"></div>' +
        '<p class="art-cat">' + esc(p.categorie) + '</p><h3><a href="' + lien + '">' + esc(p.nom) + '</a></h3>' +
        '<div class="art-bas"><p class="art-prix' + (surDemande(p) ? ' art-prix-dem' : '') + '">' + prixAff(p) +
        (enPromo(p) ? ' <s>' + prix(p.ancienPrix) + '</s>' : '') + '</p>' + bouton + '</div></div>';
    }).join('\n');
  }
  // Remplace les blocs dans le code de index.html (renvoie null si les repères ont été effacés)
  function majAccueil(html, b, reg, liste) {
    var i = html.indexOf(DEBUT), j = html.indexOf(FIN);
    if (i === -1 || j === -1 || j < i) return null;
    html = html.slice(0, i) + blocAccueil(b, reg) + html.slice(j + FIN.length);
    var k = html.indexOf(DEB_A), l = html.indexOf(FIN_A);
    if (liste && k !== -1 && l > k) html = html.slice(0, k) + DEB_A + '\n' + cartesAccueil(liste) + '\n' + html.slice(l);
    return html;
  }

  // ----- Page Actualités -----
  function dateFr(d) {
    var m = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    var x = String(d || '').split('-');
    return x.length === 3 ? Number(x[2]) + ' ' + m[Number(x[1]) - 1] + ' ' + x[0] : '';
  }
  function paragraphes(t) {
    return String(t || '').split(/\n\s*\n/).map(function (q) { return q.trim(); }).filter(Boolean)
      .map(function (q) { return '<p>' + esc(q).replace(/\n/g, '<br>') + '</p>'; }).join('');
  }
  function pageActualites(posts, b, reg) {
    b = base(b); reg = reg || {};
    var liste = (posts || []).filter(function (a) { return a && a.visible !== false && a.titre; })
      .sort(function (x, y) { return String(y.date).localeCompare(String(x.date)); });
    liste.forEach(function (a) { a.slug = a.slug || slugify(a.titre); });
    var url = b + 'actualite.html';
    var ld = jsonLd({ '@context': 'https://schema.org', '@type': 'Blog', name: 'Actualités ZenTech', url: url,
      blogPost: liste.map(function (a) { return { '@type': 'BlogPosting', headline: a.titre, datePublished: a.date,
        image: a.image ? imgAbs(a.image, b) : undefined, url: url + '#' + a.slug, author: { '@type': 'Organization', name: 'ZenTech' } }; }) });
    var desc = couper('Actualités et conseils ZenTech à Ouagadougou : nouveautés, arrivages et guides pour bien choisir ordinateurs, montres connectées, écouteurs et chargeurs.', 158);
    return tete({ titre: 'Actualités et conseils high-tech | ZenTech Ouagadougou', description: desc, url: url, image: b + 'img/partage.jpg', p: '', ld: ld, ga: reg.ga }) +
      entete('') +
      '<main class="pp-wrap news">\n' +
      '  <nav class="crumbs" aria-label="Fil d\'Ariane"><a href="./">Accueil</a><i class="fas fa-chevron-right" aria-hidden="true"></i><span aria-current="page">Actualités</span></nav>\n' +
      '  <header class="news-head"><h1>Actualités</h1><p>Nouveautés de la boutique, arrivages et conseils pour bien choisir votre matériel.</p></header>\n' +
      (liste.length ? liste.map(function (a, n) {
        var une = n === 0;
        return '  <article class="post' + (une ? ' post-une' : '') + '" id="' + esc(a.slug) + '">' +
          (a.image ? '<div class="post-img"><img src="' + esc(imgRel(a.image, '')) + '" alt="' + esc(a.titre) + '" width="600" height="600"' + (une ? '' : ' loading="lazy"') + '></div>' : '') +
          '<div class="post-txt"><time datetime="' + esc(a.date) + '">' + dateFr(a.date) + '</time><h2>' + esc(a.titre) + '</h2>' +
          (a.resume ? '<p class="post-chapo">' + esc(a.resume) + '</p>' : '') +
          (a.texte ? '<details' + (une ? ' open' : '') + '><summary><span class="lire">Lire l\'article</span><span class="fermer">Réduire</span> <i class="fas fa-arrow-down" aria-hidden="true"></i></summary>' + paragraphes(a.texte) + '</details>' : '') +
          '</div></article>\n';
      }).join('').replace(/(<\/article>\n)(  <article class="post")/, '$1  <div class="post-grille">\n$2') + (liste.length > 1 ? '  </div>\n' : '') : '  <p class="news-vide">Aucune actualité pour le moment.</p>\n') +
      '</main>\n' + pied('') + '<script src="js/produit.js" defer></script>\n</body>\n</html>\n';
  }

  function sitemap(tous, b, avecNews) {
    b = base(b);
    var urls = [b, b + 'produits.html'].concat(avecNews ? [b + 'actualite.html'] : []).concat(tous.map(function (p) { return urlProduit(p, b); }));
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      urls.map(function (u) { return '  <url><loc>' + esc(u) + '</loc></url>'; }).join('\n') + '\n</urlset>\n';
  }

  function robots(b) {
    b = base(b);
    var chemin = '/';
    try { chemin = new URL(b).pathname; } catch (e) {}
    return 'User-agent: *\nAllow: /\nDisallow: ' + chemin + 'admin.html\n\nSitemap: ' + b + 'sitemap.xml\n';
  }

  /* Génère tous les fichiers. Renvoie { fichiers: {chemin: contenu}, pagesProduits: [chemins] }.
     Les articles reçoivent leur champ "slug" (à enregistrer dans produits.json). */
  function generer(liste, b, reg, posts) {
    b = base(b);
    attribuerSlugs(liste);
    var tous = visibles(liste);
    var fichiers = {};
    tous.forEach(function (p) { fichiers['produit/' + p.slug + '.html'] = pageProduit(p, tous, b, reg); });
    var pagesProduits = Object.keys(fichiers);
    fichiers['produits.html'] = pageCatalogue(tous, b, reg);
    if (posts) fichiers['actualite.html'] = pageActualites(posts, b, reg);
    fichiers['sitemap.xml'] = sitemap(tous, b, !!posts);
    fichiers['robots.txt'] = robots(b);
    fichiers['404.html'] = page404(b);
    return { fichiers: fichiers, pagesProduits: pagesProduits };
  }

  return {
    BOUTIQUE: BOUTIQUE, SITE_PAR_DEFAUT: SITE_PAR_DEFAUT,
    slugify: slugify, attribuerSlugs: attribuerSlugs, titre: titre, description: description,
    urlProduit: urlProduit, base: base, generer: generer, prix: prix,
    idGA: idGA, codeGSC: codeGSC, blocAccueil: blocAccueil, majAccueil: majAccueil, dateFr: dateFr
  };
});
