// ===== CONFIGURATION =====
const WA  = '22665074260';
const OM  = '65074260'; // Numéro Orange Money
const API = 'http://localhost:3000/api'; // ancien serveur (plus utilisé en ligne)
// Les articles et les prix viennent de data/produits.json, modifié depuis admin.html
const DATA_URL = 'data/produits.json';

// ===== PRODUITS DE SECOURS (si data/produits.json ne se charge pas) =====
const produitsLocaux = [{"id": 1, "nom": "HP EliteBook 840 G8", "categorie": "Ordinateurs", "prix": 315000, "ancienPrix": null, "qte": null, "visible": true, "badge": "", "img": "img/produits/hp-elitebook-840-g8.webp", "desc": "Ordinateur portable professionnel HP EliteBook 840 G8 : écran 14 pouces Full HD, Intel Core i5 de 11e génération et SSD 512 Go. Idéal pour le bureau et les déplacements.", "note": 0, "avis": 0, "specs": {"Processeur": "Intel Core i5 11e génération", "RAM": "8 Go", "Stockage": "512 Go SSD", "Écran": "14 pouces Full HD", "Système": "Windows 11 Pro"}}, {"id": 2, "nom": "Écouteurs sans fil LOOMIC", "categorie": "Écouteurs", "prix": 15000, "ancienPrix": null, "qte": null, "visible": true, "badge": "new", "img": "img/produits/ecouteurs-sans-fil-loomic.webp", "desc": "Écouteurs Bluetooth sans fil LOOMIC, livrés avec leur boîtier de charge compact. Pratiques pour la musique, les vidéos et les appels au quotidien.", "note": 0, "avis": 0, "specs": {"Connexion": "Bluetooth sans fil", "Boîtier": "Boîtier de charge", "Coloris": "Noir"}}, {"id": 3, "nom": "Montre connectée HiFuture, appels Bluetooth", "categorie": "Montres", "prix": 25000, "ancienPrix": null, "qte": null, "visible": true, "badge": "new", "img": "img/produits/montre-connectee-hifuture-appels-bluetooth.webp", "desc": "Montre connectée HiFuture avec appels Bluetooth, suivi d'activité et des séances de sport. Disponible en bleu, marron, noir et rose.", "note": 0, "avis": 0, "specs": {"Fonctions": "Appels Bluetooth, suivi d'activité", "Coloris": "Bleu, marron, noir, rose"}}, {"id": 4, "nom": "Chaise gaming LOOMIC avec repose-pieds", "categorie": "Chaises Gaming", "prix": 175000, "ancienPrix": null, "qte": null, "visible": true, "badge": "", "img": "img/produits/chaise-gaming-loomic-repose-pieds.webp", "desc": "Chaise gaming LOOMIC orange et noir, avec coussin d'appui-tête et repose-pieds escamotable, pour jouer ou travailler confortablement.", "note": 0, "avis": 0, "specs": {"Repose-pieds": "Escamotable", "Appui-tête": "Coussin", "Coloris": "Orange et noir"}}, {"id": 5, "nom": "Chargeur LOOMIC 45 W GaN USB-C et USB-A", "categorie": "Câbles & Charge", "prix": 12500, "ancienPrix": null, "qte": null, "visible": true, "badge": "new", "img": "img/produits/chargeur-loomic-45w-gan.webp", "desc": "Chargeur secteur compact LOOMIC 45 W en technologie GaN, avec un port USB-C et un port USB-A pour charger téléphone, tablette et accessoires.", "note": 0, "avis": 0, "specs": {"Puissance": "45 W", "Technologie": "GaN", "Ports": "1 USB-C, 1 USB-A", "Coloris": "Blanc ou noir"}}, {"id": 6, "nom": "Power bank LOOMIC avec écran", "categorie": "Power Banks", "prix": 22500, "ancienPrix": null, "qte": null, "visible": true, "badge": "new", "img": "img/produits/power-bank-loomic-ecran.webp", "desc": "Batterie externe LOOMIC avec écran qui affiche le niveau de charge, et ports USB-C et USB-A pour recharger partout.", "note": 0, "avis": 0, "specs": {"Écran": "Niveau de charge", "Ports": "USB-C, USB-A", "Coloris": "Gris"}}, {"id": 7, "nom": "Lenovo ThinkPad X1 Carbon", "categorie": "Ordinateurs", "prix": 395000, "ancienPrix": null, "qte": null, "visible": true, "badge": "", "img": "img/produits/lenovo-thinkpad-x1-carbon.webp", "desc": "Ultraportable professionnel Lenovo ThinkPad X1 Carbon : léger, robuste et pensé pour travailler partout. Configuration sur demande.", "note": 0, "avis": 0, "specs": {"Gamme": "ThinkPad X1 Carbon", "Coloris": "Noir"}}, {"id": 8, "nom": "Montre connectée HiFuture, bracelet milanais", "categorie": "Montres", "prix": 30000, "ancienPrix": null, "qte": null, "visible": true, "badge": "", "img": "img/produits/montre-connectee-hifuture-bracelet-milanais.webp", "desc": "Montre connectée ronde HiFuture avec bracelet milanais en maille métal, élégante au bureau comme en soirée. Coloris noir, or ou argent.", "note": 0, "avis": 0, "specs": {"Cadran": "Rond", "Bracelet": "Milanais (maille métal)", "Coloris": "Noir, or, argent"}}, {"id": 9, "nom": "Écouteurs sans fil EarFun", "categorie": "Écouteurs", "prix": 25000, "ancienPrix": null, "qte": null, "visible": true, "badge": "", "img": "img/produits/ecouteurs-sans-fil-earfun.webp", "desc": "Écouteurs Bluetooth sans fil EarFun à tige, avec boîtier de charge de poche.", "note": 0, "avis": 0, "specs": {"Connexion": "Bluetooth sans fil", "Boîtier": "Boîtier de charge", "Coloris": "Noir"}}, {"id": 10, "nom": "HP ProBook 440 G7", "categorie": "Ordinateurs", "prix": 275000, "ancienPrix": null, "qte": null, "visible": true, "badge": "", "img": "img/produits/hp-probook-440-g7.webp", "desc": "Ordinateur portable HP ProBook 440 G7 : écran 14 pouces Full HD, Intel Core i5, 8 Go de RAM et SSD 512 Go. Parfait pour la bureautique et les études.", "note": 0, "avis": 0, "specs": {"Processeur": "Intel Core i5", "RAM": "8 Go", "Stockage": "512 Go SSD", "Écran": "14 pouces Full HD", "Système": "Windows 10 Pro"}}, {"id": 11, "nom": "Chaise gaming noire, appui-tête réglable", "categorie": "Chaises Gaming", "prix": 150000, "ancienPrix": null, "qte": null, "visible": true, "badge": "", "img": "img/produits/chaise-gaming-noire-appui-tete.webp", "desc": "Chaise gaming ergonomique noire avec appui-tête réglable et accoudoirs, idéale pour le bureau comme pour le gaming.", "note": 0, "avis": 0, "specs": {"Appui-tête": "Réglable", "Coloris": "Noir"}}, {"id": 12, "nom": "Pack de charge LOOMIC", "categorie": "Câbles & Charge", "prix": 39500, "ancienPrix": null, "qte": null, "visible": true, "badge": "", "img": "img/produits/pack-de-charge-loomic.webp", "desc": "Pack de charge LOOMIC : power bank, câbles USB-C et Lightning et chargeurs 45 W, pour tout recharger à la maison comme en déplacement.", "note": 0, "avis": 0, "specs": {"Contenu": "Power bank, câbles USB-C et Lightning, chargeurs 45 W"}}, {"id": 13, "nom": "Dell Precision, station de travail portable", "categorie": "Ordinateurs", "prix": 650000, "ancienPrix": null, "qte": null, "visible": true, "badge": "", "img": "img/produits/dell-precision-station-de-travail.webp", "desc": "Station de travail portable Dell Precision pour le montage vidéo, la 3D et les logiciels professionnels exigeants. Configuration sur demande.", "note": 0, "avis": 0, "specs": {"Gamme": "Dell Precision", "Usage": "Montage vidéo, 3D, CAO"}}, {"id": 14, "nom": "Montre connectée HiFuture ronde, bracelet sport", "categorie": "Montres", "prix": 27500, "ancienPrix": null, "qte": null, "visible": true, "badge": "", "img": "img/produits/montre-connectee-hifuture-ronde-sport.webp", "desc": "Montre connectée ronde HiFuture avec bracelet sport en silicone, pour le quotidien et l'entraînement. Coloris noir ou beige.", "note": 0, "avis": 0, "specs": {"Cadran": "Rond", "Bracelet": "Silicone sport", "Coloris": "Noir, beige"}}, {"id": 15, "nom": "Fauteuil gaming inclinable avec repose-pieds", "categorie": "Chaises Gaming", "prix": 225000, "ancienPrix": null, "qte": null, "visible": true, "badge": "", "img": "img/produits/fauteuil-gaming-inclinable.webp", "desc": "Fauteuil gaming inclinable noir avec repose-pieds intégré et surpiqûres en losange, pour se détendre devant un film ou une partie.", "note": 0, "avis": 0, "specs": {"Dossier": "Inclinable", "Repose-pieds": "Intégré", "Coloris": "Noir"}}, {"id": 16, "nom": "Montre connectée HiFuture, écran carré", "categorie": "Montres", "prix": 20000, "ancienPrix": null, "qte": null, "visible": true, "badge": "", "img": "img/produits/montre-connectee-hifuture-ecran-carre.webp", "desc": "Montre connectée HiFuture à grand écran carré et cadre argenté, avec bracelet en silicone noir.", "note": 0, "avis": 0, "specs": {"Écran": "Grand écran carré", "Bracelet": "Silicone", "Coloris": "Argent et noir"}}, {"id": 17, "nom": "Adaptateur USB-C Hub UGREEN", "categorie": "Accessoires", "prix": 12000, "ancienPrix": null, "qte": null, "visible": true, "badge": "", "img": "img/produits/adaptateur-usb-c-hub-ugreen.webp", "desc": "Hub multiport USB-C UGREEN compatible avec la majorité des ordinateurs portables : HDMI, ports USB, Ethernet et lecteur de cartes.", "note": 0, "avis": 0, "specs": {"Connecteurs": "USB-C / 3x USB-A / HDMI", "Débit": "5 Gbps", "Garantie": "1 an"}}];

// ===== STATE =====
let produits    = produitsLocaux.slice();
let panier      = JSON.parse(localStorage.getItem('zt-panier') || '[]');
let wl          = JSON.parse(localStorage.getItem('zt-wl')     || '[]');
let currentId   = null;
let modeServeur = false;

// ===== STORAGE =====
function savePanier() { localStorage.setItem('zt-panier', JSON.stringify(panier)); }
function saveWL()     { localStorage.setItem('zt-wl',     JSON.stringify(wl));     }

// ===== LOADER =====
function fermerLoader() {
  var l = document.getElementById('loader');
  if (!l) return;
  l.classList.add('out');
  setTimeout(function() { l.style.display = 'none'; }, 500);
}

// ===== THEME INITIAL =====
(function() {
  var st = localStorage.getItem('zt-theme');
  if (st) document.documentElement.setAttribute('data-theme', st);
})();

// ===== OUTILS =====
function esc(v) {
  return String(v == null ? '' : v).replace(/[&<>"']/g, function(c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function prixTxt(n) { return Number(n || 0).toLocaleString('fr-FR') + ' FCFA'; }
// prix à 0 (ou vide) dans l'admin = « Prix sur demande » : demande par WhatsApp, pas de panier
function surDemande(p) { return !(Number(p && p.prix) > 0); }
function prixAff(p) { return surDemande(p) ? 'Prix sur demande' : prixTxt(p.prix); }
function lienDemande(p) {
  return 'https://wa.me/' + WA + '?text=' + encodeURIComponent('Bonjour ZenTech, je voudrais connaître le prix de : ' + p.nom);
}
// recherche sans tenir compte des accents ni des majuscules
function sansAccent(t) { return String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
function enPromo(p)  { return p.ancienPrix && p.ancienPrix > p.prix; }
function remise(p)   { return enPromo(p) ? Math.round((1 - p.prix / p.ancienPrix) * 100) : 0; }
function enRupture(p){ return p.qte === 0; }
function normaliser(p) {
  return {
    id: Number(p.id), nom: String(p.nom || ''), categorie: String(p.categorie || 'Autres'),
    prix: Number(p.prix) || 0, ancienPrix: p.ancienPrix ? Number(p.ancienPrix) : null,
    qte: (p.qte === null || p.qte === undefined || p.qte === '') ? null : Number(p.qte),
    visible: p.visible !== false, badge: p.badge || '', img: p.img || '',
    desc: p.desc || '', note: Number(p.note) || 0, avis: Number(p.avis) || 0, specs: p.specs || {},
    slug: p.slug || slugify(p.nom)
  };
}

// adresse de la page de l'article (produit/<slug>.html), même règle que js/seo-pages.js
function slugify(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/&/g, ' et ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, 70).replace(/-+$/g, '') || 'article';
}
function lienFiche(p) { return 'produit/' + p.slug + '.html'; }

// ===== CHARGEMENT PRODUITS =====
function appliquerProduits(liste) {
  produits = liste.map(normaliser).filter(function(p) { return p.visible; });
  // le panier reprend les prix à jour, et retire les articles qui ne sont plus en ligne
  panier = panier.filter(function(item) {
    var p = produits.find(function(x) { return x.id === item.id; });
    if (!p || surDemande(p)) return false;
    item.nom = p.nom; item.prix = p.prix; item.img = p.img; item.categorie = p.categorie;
    return true;
  });
  savePanier();
  renderFiltres();
  renderCards();
  updateCart();
  renderCart();
}

function chargerProduits() {
  fetch(DATA_URL + '?v=' + Date.now(), { cache: 'no-store' })
    .then(function(res) {
      if (!res.ok) throw new Error('indisponible');
      return res.json();
    })
    .then(function(data) { appliquerProduits(Array.isArray(data) ? data : []); })
    .catch(function() { appliquerProduits(produitsLocaux); });
}

// ===== CART =====
function addToCart(p) {
  if (!p) return;
  if (enRupture(p)) { showToast('Cet article est en rupture de stock'); return; }
  if (surDemande(p)) { window.open(lienDemande(p), '_blank'); return; }
  var ex = panier.find(function(x) { return x.id === p.id; });
  if (ex) { ex.qte++; }
  else { panier.push({ id: p.id, nom: p.nom, prix: p.prix, img: p.img, categorie: p.categorie || '', qte: 1 }); }
  savePanier();
  updateCart();
  renderCart();
  showToast('« ' + p.nom + ' » ajouté au panier');
}

function changeQte(id, d) {
  var item = panier.find(function(x) { return x.id === id; });
  if (!item) return;
  item.qte += d;
  if (item.qte <= 0) panier = panier.filter(function(x) { return x.id !== id; });
  savePanier(); updateCart(); renderCart();
}

function delItem(id) {
  panier = panier.filter(function(x) { return x.id !== id; });
  savePanier(); updateCart(); renderCart();
}

function viderPanier() {
  panier = [];
  savePanier(); updateCart(); renderCart();
  showToast('Panier vidé');
}

function updateCart() {
  var cnt = panier.reduce(function(s, p) { return s + p.qte; }, 0);
  var tot = panier.reduce(function(s, p) { return s + (p.prix * p.qte); }, 0);

  var cc = document.getElementById('cartCount');
  var sc = document.getElementById('sideCount');
  var st = document.getElementById('sideTotal');
  var cf = document.getElementById('cartFoot');
  var ce = document.getElementById('cartEmpty');

  if (cc) cc.textContent = cnt;
  if (sc) sc.textContent = cnt;
  if (st) st.textContent = tot.toLocaleString('fr-FR') + ' FCFA';

  // CORRECTION : enlève la classe hidden ET met le display correctement
  if (cf) {
    cf.classList.remove('hidden');
    cf.style.display = panier.length ? 'block' : 'none';
  }
  if (ce) ce.style.display = panier.length ? 'none' : 'block';
}

function renderCart() {
  var body = document.getElementById('cartBody');
  if (!body) return;
  Array.from(body.children).forEach(function(c) {
    if (!c.classList.contains('cart-empty-msg')) c.remove();
  });
  panier.forEach(function(item) {
    var d = document.createElement('div');
    d.className = 'c-item';
    d.innerHTML =
      '<div class="c-item-img"><img src="' + esc(item.img) + '" alt="' + esc(item.nom) + '"></div>' +
      '<div class="c-item-info">' +
        '<h4>' + esc(item.nom) + '</h4>' +
        '<p class="cp">' + (item.prix * item.qte).toLocaleString('fr-FR') + ' FCFA</p>' +
        '<div class="c-item-ctrl">' +
          '<button onclick="changeQte(' + item.id + ',-1)"><i class="fas fa-minus"></i></button>' +
          '<span>' + item.qte + '</span>' +
          '<button onclick="changeQte(' + item.id + ',1)"><i class="fas fa-plus"></i></button>' +
        '</div>' +
      '</div>' +
      '<button class="c-item-del" onclick="delItem(' + item.id + ')"><i class="fas fa-trash"></i></button>';
    body.appendChild(d);
  });
}

function toggleCart() {
  var sb = document.getElementById('cartSidebar');
  var ov = document.getElementById('cartOverlay');
  if (!sb || !ov) return;
  sb.classList.toggle('on');
  ov.classList.toggle('on');
  document.body.style.overflow = sb.classList.contains('on') ? 'hidden' : '';
}

// ===== WISHLIST =====
function toggleWL(id, btn) {
  var i = wl.indexOf(id);
  if (i === -1) { wl.push(id); showToast('Ajouté aux favoris'); }
  else          { wl.splice(i, 1); showToast('Retiré des favoris'); }
  saveWL();
  if (btn) btn.classList.toggle('on', wl.includes(id));
  var mb = document.getElementById('mWlBtn');
  if (mb && currentId === id) mb.classList.toggle('on', wl.includes(id));
  renderCards();
}

// ===== CHECKOUT =====
function openCheckout() {
  if (!panier.length) { showToast('Votre panier est vide !'); return; }
  var coLines   = document.getElementById('coLines');
  var coTotal   = document.getElementById('coTotal');
  var coOverlay = document.getElementById('coOverlay');
  if (!coLines || !coTotal || !coOverlay) return;

  coLines.innerHTML = panier.map(function(p) {
    return '<div class="co-line"><span>' + esc(p.nom) + ' x' + p.qte + '</span><span>' + (p.prix * p.qte).toLocaleString('fr-FR') + ' FCFA</span></div>';
  }).join('');

  var tot = panier.reduce(function(s, p) { return s + (p.prix * p.qte); }, 0);
  coTotal.textContent = tot.toLocaleString('fr-FR') + ' FCFA';
  coOverlay.classList.add('on');
  document.body.style.overflow = 'hidden';
}

function closeCO(e, f) {
  var coOverlay = document.getElementById('coOverlay');
  if (!coOverlay) return;
  if (f || (e && e.target === coOverlay)) {
    coOverlay.classList.remove('on');
    document.body.style.overflow = '';
  }
}

function confirmer() {
  var prenom = (document.getElementById('fPrenom') || {}).value || '';
  var nom    = (document.getElementById('fNom')    || {}).value || '';
  var tel    = (document.getElementById('fTel')    || {}).value || '';
  var addr   = (document.getElementById('fAddr')   || {}).value || '';
  var pay    = (document.getElementById('fPay')    || {}).value || '';

  if (!prenom.trim() || !tel.trim() || !addr.trim()) {
    showToast('Remplissez tous les champs obligatoires');
    return;
  }

  // Si Orange Money → ouvre l'app Orange Money
  if (pay === 'Orange Money') {
    var tot = panier.reduce(function(s, p) { return s + (p.prix * p.qte); }, 0);
    payerOrangeMoney(tot, prenom.trim() + ' ' + nom.trim());
  }

  // Enregistre la commande
  if (modeServeur) {
    fetch(API + '/commandes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client:   prenom.trim() + ' ' + nom.trim(),
        tel:      tel.trim(),
        adresse:  addr.trim(),
        articles: panier,
        paiement: pay,
        via:      'site'
      })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      showToast('Commande ' + data.commande.id + ' confirmée ! Nous vous contactons bientôt');
    })
    .catch(function() {
      showToast('Commande confirmée ! Nous vous contactons bientôt');
    });
  } else {
    showToast('Commande confirmée ! Nous vous contactons bientôt');
  }

  closeCO(null, true);
  toggleCart();
  viderPanier();
}

// ===== ORANGE MONEY =====
function payerOrangeMoney(montant, nomClient) {
  // Code USSD marchand Orange Burkina Faso
  // Format : *144*NUM_MARCHAND*MONTANT# — remplace OM par ton code marchand Orange
  var ussd      = '*144*' + OM + '*' + montant + '%23';
  var lienUSSD  = 'tel:' + ussd;
  var nomFormate = OM.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');

  // Supprime un modal existant
  var ancien = document.getElementById('omModal');
  if (ancien) ancien.remove();

  // Injecte le CSS du modal dans le head (une seule fois)
  if (!document.getElementById('om-style')) {
    var s = document.createElement('style');
    s.id = 'om-style';
    s.textContent =
      '@keyframes omIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}' +
      '@keyframes omBg{from{opacity:0}to{opacity:1}}' +
      '.om-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;animation:omBg .2s ease;backdrop-filter:blur(4px)}' +
      '.om-modal{background:#111;border-radius:20px;width:100%;max-width:400px;overflow:hidden;animation:omIn .25s ease;border:1px solid rgba(255,102,0,.25);box-shadow:0 24px 60px rgba(0,0,0,.6)}' +
      '.om-header{background:linear-gradient(135deg,#ff6600,#e65c00);padding:24px 20px;text-align:center;position:relative}' +
      '.om-logo{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:6px}' +
      '.om-logo-icon{width:40px;height:40px;background:rgba(255,255,255,.2);border-radius:10px;display:flex;align-items:center;justify-content:center}' +
      '.om-logo-icon svg{width:22px;height:22px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
      '.om-logo-text{font-size:1.1rem;font-weight:800;color:#fff;letter-spacing:.02em}' +
      '.om-header-sub{font-size:.78rem;color:rgba(255,255,255,.75);font-weight:400}' +
      '.om-close{position:absolute;top:12px;right:14px;background:rgba(255,255,255,.15);border:none;color:#fff;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:.85rem;display:flex;align-items:center;justify-content:center;transition:.2s}' +
      '.om-close:hover{background:rgba(255,255,255,.3)}' +
      '.om-body{padding:20px}' +
      '.om-label{font-size:.68rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:6px}' +
      '.om-amount-card{background:#1a1a1a;border:1px solid rgba(255,102,0,.2);border-radius:12px;padding:16px 20px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between}' +
      '.om-amount{font-size:2rem;font-weight:900;color:#ff6600;letter-spacing:-.02em;line-height:1}' +
      '.om-amount-unit{font-size:.75rem;color:rgba(255,255,255,.4);margin-top:4px}' +
      '.om-check{width:32px;height:32px;background:rgba(255,102,0,.12);border-radius:50%;display:flex;align-items:center;justify-content:center}' +
      '.om-check svg{width:16px;height:16px;stroke:#ff6600;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}' +
      '.om-number-card{background:#1a1a1a;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:14px 20px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between}' +
      '.om-number{font-size:1.25rem;font-weight:800;color:#fff;letter-spacing:.08em}' +
      '.om-copy{background:rgba(255,102,0,.12);border:1px solid rgba(255,102,0,.2);color:#ff6600;padding:6px 12px;border-radius:8px;font-size:.72rem;font-weight:700;cursor:pointer;transition:.2s;white-space:nowrap}' +
      '.om-copy:hover{background:rgba(255,102,0,.22)}' +
      '.om-divider{height:1px;background:rgba(255,255,255,.06);margin:0 0 16px}' +
      '.om-btn-primary{width:100%;padding:14px;background:linear-gradient(135deg,#ff6600,#e65c00);color:#fff;border:none;border-radius:12px;font-size:.92rem;font-weight:700;cursor:pointer;transition:.2s;display:flex;align-items:center;justify-content:center;gap:9px;margin-bottom:9px;letter-spacing:.02em}' +
      '.om-btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(255,102,0,.4)}' +
      '.om-btn-primary:active{transform:scale(.98)}' +
      '.om-btn-primary svg{width:18px;height:18px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
      '.om-btn-wa{width:100%;padding:12px;background:#1a2e1a;color:#4ade80;border:1px solid rgba(74,222,128,.2);border-radius:12px;font-size:.85rem;font-weight:600;cursor:pointer;transition:.2s;display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:12px;text-decoration:none}' +
      '.om-btn-wa:hover{background:#1f381f;border-color:rgba(74,222,128,.35)}' +
      '.om-btn-wa svg{width:16px;height:16px;fill:#4ade80}' +
      '.om-note{font-size:.72rem;color:rgba(255,255,255,.28);text-align:center;line-height:1.6;padding:0 4px}' +
      '.om-steps{display:flex;flex-direction:column;gap:8px;margin-bottom:16px}' +
      '.om-step{display:flex;align-items:center;gap:10px}' +
      '.om-step-num{width:22px;height:22px;background:rgba(255,102,0,.15);border:1px solid rgba(255,102,0,.3);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:800;color:#ff6600;flex-shrink:0}' +
      '.om-step-text{font-size:.78rem;color:rgba(255,255,255,.5);line-height:1.4}' +
      '.om-step-text strong{color:rgba(255,255,255,.8);font-weight:600}';
    document.head.appendChild(s);
  }

  // Crée le modal
  var modal = document.createElement('div');
  modal.id  = 'omModal';
  modal.className = 'om-overlay';
  modal.innerHTML =
    '<div class="om-modal">' +
      // Header orange
      '<div class="om-header">' +
        '<button class="om-close" onclick="document.getElementById(\'omModal\').remove()">' +
          '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button>' +
        '<div class="om-logo">' +
          '<div class="om-logo-icon">' +
            '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>' +
          '</div>' +
          '<span class="om-logo-text">Orange Money</span>' +
        '</div>' +
        '<div class="om-header-sub">Paiement sécurisé — ZenTech Burkina Faso</div>' +
      '</div>' +

      // Corps
      '<div class="om-body">' +

        // Montant
        '<div class="om-label">Montant à payer</div>' +
        '<div class="om-amount-card">' +
          '<div>' +
            '<div class="om-amount">' + montant.toLocaleString('fr-FR') + '</div>' +
            '<div class="om-amount-unit">FCFA</div>' +
          '</div>' +
          '<div class="om-check">' +
            '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>' +
          '</div>' +
        '</div>' +

        // Numéro / Code marchand
        '<div class="om-label">Numéro marchand ZenTech</div>' +
        '<div class="om-number-card">' +
          '<div>' +
            '<div class="om-number">+226 ' + nomFormate + '</div>' +
          '</div>' +
          '<button class="om-copy" id="omCopyBtn" onclick="copierNumero(\'226' + OM + '\')">' +
            'Copier' +
          '</button>' +
        '</div>' +

        '<div class="om-divider"></div>' +

        // Étapes
        '<div class="om-label">Comment payer</div>' +
        '<div class="om-steps">' +
          '<div class="om-step"><div class="om-step-num">1</div><div class="om-step-text">Appuyez sur <strong>"Ouvrir Orange Money"</strong> ci-dessous</div></div>' +
          '<div class="om-step"><div class="om-step-num">2</div><div class="om-step-text">Entrez votre <strong>code secret Orange Money</strong></div></div>' +
          '<div class="om-step"><div class="om-step-num">3</div><div class="om-step-text">Confirmez le paiement de <strong>' + montant.toLocaleString('fr-FR') + ' FCFA</strong></div></div>' +
          '<div class="om-step"><div class="om-step-num">4</div><div class="om-step-text">Envoyez la <strong>capture SMS</strong> sur WhatsApp</div></div>' +
        '</div>' +

        '<div class="om-divider"></div>' +

        // Bouton principal USSD
        '<a class="om-btn-primary" href="' + lienUSSD + '" onclick="document.getElementById(\'omModal\').remove()">' +
          '<svg viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>' +
          'Ouvrir Orange Money' +
        '</a>' +

        // Bouton WhatsApp secours
        '<a class="om-btn-wa" href="https://wa.me/' + WA + '?text=' + encodeURIComponent('Bonjour, je souhaite payer ma commande ZenTech de ' + montant.toLocaleString('fr-FR') + ' FCFA via Orange Money.') + '" target="_blank">' +
          '<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/><path d="M12.004 2C6.479 2 2.005 6.474 2.005 12c0 1.767.465 3.535 1.35 5.086L2 22l5.04-1.322A10.004 10.004 0 0012.004 22C17.529 22 22 17.526 22 12c0-5.525-4.471-10-9.996-10zm0 18.36a8.356 8.356 0 01-4.252-1.163l-.305-.181-3.159.829.845-3.074-.2-.316A8.336 8.336 0 013.649 12c0-4.61 3.745-8.356 8.355-8.356 4.61 0 8.356 3.746 8.356 8.356 0 4.61-3.746 8.36-8.356 8.36z"/></svg>' +
          'Besoin d\'aide ? WhatsApp' +
        '</a>' +

        '<p class="om-note">Après paiement, envoyez votre confirmation SMS sur WhatsApp pour valider votre commande.</p>' +
      '</div>' +
    '</div>';

  document.body.appendChild(modal);

  // Ferme en cliquant sur le fond
  modal.addEventListener('click', function(e) {
    if (e.target === modal) modal.remove();
  });

  // Ferme avec Échap
  document.addEventListener('keydown', function onEsc(e) {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', onEsc);
    }
  });
}

// Copie le numéro dans le presse-papier
function copierNumero(numero) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(numero).then(function() {
      var btn = document.getElementById('omCopyBtn');
      if (btn) { btn.textContent = 'Copié !'; setTimeout(function() { btn.textContent = 'Copier'; }, 2000); }
    });
  } else {
    // Fallback pour les navigateurs sans clipboard API
    var input = document.createElement('input');
    input.value = numero;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    var btn = document.getElementById('omCopyBtn');
    if (btn) { btn.textContent = 'Copié !'; setTimeout(function() { btn.textContent = 'Copier'; }, 2000); }
  }
}

// ===== WHATSAPP =====
function cmdWA() {
  if (!panier.length) { showToast('Panier vide'); return; }
  var tot = panier.reduce(function(s, p) { return s + (p.prix * p.qte); }, 0);
  var msg = '*Commande ZenTech*\n\n';
  panier.forEach(function(p) {
    msg += '• ' + p.nom + ' x' + p.qte + ' = ' + (p.prix * p.qte).toLocaleString('fr-FR') + ' FCFA\n';
  });
  msg += '\n*Total: ' + tot.toLocaleString('fr-FR') + ' FCFA*';

  if (modeServeur) {
    fetch(API + '/commandes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client: 'Client WhatsApp', tel: 'WhatsApp', articles: panier, paiement: 'WhatsApp', via: 'whatsapp' })
    }).catch(function() {});
  }

  window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(msg), '_blank');
}

// ===== RECHERCHE =====
function doSearch(q) {
  var drop = document.getElementById('searchDrop');
  if (!drop) return;
  if (!q.trim()) { drop.classList.remove('open'); return; }
  var qq = sansAccent(q.trim());
  var res = produits.filter(function(p) {
    return sansAccent(p.nom + ' ' + p.categorie + ' ' + p.desc).includes(qq);
  });
  if (!res.length) { drop.classList.remove('open'); return; }
  drop.innerHTML = res.map(function(p) {
    return '<div class="search-item" onclick="openModal(' + p.id + ');document.getElementById(\'searchDrop\').classList.remove(\'open\')">' +
      '<img src="' + esc(p.img) + '" alt="">' +
      '<div class="search-item-info"><span>' + esc(p.nom) + '</span><small>' + prixAff(p) + '</small></div>' +
      '</div>';
  }).join('');
  drop.classList.add('open');
}

document.addEventListener('click', function(e) {
  if (!e.target.closest('.search-wrap')) {
    var drop = document.getElementById('searchDrop');
    if (drop) drop.classList.remove('open');
  }
});

// ===== FILTRES (créés à partir des catégories des articles) =====
function renderFiltres() {
  var box = document.getElementById('filtres');
  if (!box) return;
  var actif = (box.querySelector('a.active') || {}).dataset;
  actif = actif ? actif.f : 'tous';
  var cats = [];
  produits.forEach(function(p) { if (cats.indexOf(p.categorie) === -1) cats.push(p.categorie); });
  if (actif !== 'tous' && cats.indexOf(actif) === -1) actif = 'tous';
  box.innerHTML = '<a href="#" data-f="tous"' + (actif === 'tous' ? ' class="active"' : '') + '>Tous</a>' +
    cats.map(function(c) { return '<a href="#" data-f="' + esc(c) + '"' + (c === actif ? ' class="active"' : '') + '>' + esc(c) + '</a>'; }).join('');
}

document.addEventListener('click', function(e) {
  var lk = e.target.closest('.filtres a');
  if (!lk) return;
  e.preventDefault();
  document.querySelectorAll('.filtres a').forEach(function(l) { l.classList.remove('active'); });
  lk.classList.add('active');
  renderCards(lk.getAttribute('data-f'));
});

// ===== RENDER CARDS =====
function etoiles(p) {
  if (!p.avis) return '';
  return '<div class="stars">' + '★'.repeat(Math.round(p.note)) + '<span>(' + p.avis + ')</span></div>';
}

function renderCards(f) {
  var activeLink = document.querySelector('.filtres a.active');
  f = f || (activeLink ? activeLink.getAttribute('data-f') : 'tous') || 'tous';
  var g  = document.getElementById('artGrid');
  var nr = document.getElementById('noResult');
  if (!g) return;
  Array.from(g.children).forEach(function(c) { if (!c.classList.contains('no-result')) c.remove(); });

  var list = f === 'tous' ? produits : produits.filter(function(p) { return p.categorie === f; });
  if (!list.length) { if (nr) nr.style.display = 'block'; return; }
  if (nr) nr.style.display = 'none';

  list.forEach(function(p) {
    var inWL = wl.includes(p.id);
    var c    = document.createElement('div');
    c.className = 'art-card' + (enRupture(p) ? ' is-out' : '');
    c.setAttribute('onclick', 'openModal(' + p.id + ')');
    var b = enRupture(p)        ? '<span class="badge-pill badge-out">Rupture</span>'
          : enPromo(p)          ? '<span class="badge-pill badge-promo">-' + remise(p) + ' %</span>'
          : p.badge === 'new'   ? '<span class="badge-pill badge-new">Nouveau</span>'
          : p.badge === 'promo' ? '<span class="badge-pill badge-promo">Promo</span>' : '';
    c.innerHTML =
      '<div class="art-img">' + b +
        '<img src="' + esc(p.img) + '" alt="' + esc(p.nom + ' – ' + p.categorie) + '" loading="lazy" decoding="async" width="300" height="300">' +
        '<button class="wl-btn' + (inWL ? ' on' : '') + '" title="Favoris" aria-label="Ajouter aux favoris" onclick="event.stopPropagation();toggleWL(' + p.id + ',this)">' +
          '<i class="fas fa-heart"></i>' +
        '</button>' +
      '</div>' +
      '<p class="art-cat">' + esc(p.categorie) + '</p>' +
      '<h3><a href="' + esc(lienFiche(p)) + '" onclick="event.stopPropagation()">' + esc(p.nom) + '</a></h3>' +
      etoiles(p) +
      '<div class="art-bas">' +
        (surDemande(p)
          ? '<p class="art-prix art-prix-dem">Prix sur demande</p>'
          : '<p class="art-prix">' + prixTxt(p.prix) + (enPromo(p) ? ' <s>' + prixTxt(p.ancienPrix) + '</s>' : '') + '</p>') +
        (enRupture(p)
          ? '<button class="btn-add" disabled onclick="event.stopPropagation()" title="Rupture de stock" aria-label="Rupture de stock"><i class="fas fa-ban"></i></button>'
          : surDemande(p)
          ? '<a class="btn-add btn-dem" href="' + esc(lienDemande(p)) + '" target="_blank" rel="noopener" onclick="event.stopPropagation()" title="Demander le prix sur WhatsApp" aria-label="Demander le prix de ' + esc(p.nom) + ' sur WhatsApp"><i class="fab fa-whatsapp"></i></a>'
          : '<button class="btn-add" onclick="event.stopPropagation();addToCart(produits.find(function(x){return x.id===' + p.id + '}))" title="Ajouter au panier" aria-label="Ajouter ' + esc(p.nom) + ' au panier"><i class="fas fa-plus"></i></button>') +
      '</div>';
    g.appendChild(c);
  });
}

function filtrerPar(cat) {
  var lk = document.querySelector('.filtres a[data-f="' + cat + '"]');
  document.querySelectorAll('.filtres a').forEach(function(l) { l.classList.remove('active'); });
  if (lk) lk.classList.add('active');
  renderCards(cat);
  var sa = document.getElementById('section-articles');
  if (sa) sa.scrollIntoView({ behavior: 'smooth' });
}

// ===== MODAL =====
function openModal(id) {
  var p = produits.find(function(x) { return x.id === id; });
  if (!p) return;
  currentId = id;
  function el(i) { return document.getElementById(i); }
  if (el('mCat'))   el('mCat').textContent  = p.categorie;
  if (el('mImg'))   { el('mImg').src = p.img; el('mImg').alt = p.nom; }
  if (el('mNom'))   el('mNom').textContent  = p.nom;
  if (el('mDesc'))  el('mDesc').textContent = p.desc;
  if (el('mPrix'))  el('mPrix').innerHTML   = (surDemande(p) ? '<span class="m-dem">Prix sur demande</span>' : prixTxt(p.prix)) +
    (enPromo(p) ? ' <s>' + prixTxt(p.ancienPrix) + '</s> <span class="m-remise">-' + remise(p) + ' %</span>' : '') +
    (enRupture(p) ? ' <span class="m-out">Rupture de stock</span>' : '');
  if (el('mStars')) el('mStars').innerHTML  = p.avis ? '★'.repeat(Math.round(p.note)) + ' <small style="color:#999">(' + p.avis + ' avis)</small>' : '';
  if (el('mSpecs')) el('mSpecs').innerHTML  = Object.entries(p.specs || {}).map(function(e) {
    return '<tr><td>' + esc(e[0]) + '</td><td>' + esc(e[1]) + '</td></tr>';
  }).join('');
  if (el('mWlBtn')) el('mWlBtn').classList.toggle('on', wl.includes(id));
  if (el('mFiche')) el('mFiche').href = lienFiche(p);

  var sim = produits.filter(function(x) { return x.categorie === p.categorie && x.id !== id; }).slice(0, 3);
  if (el('mSimilar')) {
    el('mSimilar').innerHTML = sim.map(function(s) {
      return '<div class="similar-item" onclick="openModal(' + s.id + ')">' +
        '<img src="' + esc(s.img) + '" alt=""><span>' + esc(s.nom) + '</span>' +
        '<span class="sp">' + prixAff(s) + '</span>' +
        '</div>';
    }).join('') || '<p style="color:#aaa;font-size:.78rem;grid-column:1/-1">Aucun similaire</p>';
  }

  var btn = el('mAddBtn');
  if (btn && !enRupture(p) && surDemande(p)) {
    btn.disabled = false;
    btn.classList.remove('done');
    btn.innerHTML = '<i class="fab fa-whatsapp"></i> Demander le prix';
    btn.onclick = function() { window.open(lienDemande(p), '_blank'); };
  } else if (btn && enRupture(p)) {
    btn.innerHTML = '<i class="fas fa-ban"></i> Indisponible';
    btn.disabled = true;
    btn.onclick = null;
  } else if (btn) {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-cart-plus"></i> Ajouter au panier';
    btn.classList.remove('done');
    btn.onclick = function() {
      addToCart(p);
      btn.innerHTML = '<i class="fas fa-check"></i> Ajouté !';
      btn.classList.add('done');
      setTimeout(function() {
        btn.innerHTML = '<i class="fas fa-cart-plus"></i> Ajouter au panier';
        btn.classList.remove('done');
      }, 2000);
    };
  }
  var overlay = document.getElementById('overlay');
  if (overlay) overlay.classList.add('on');
  document.body.style.overflow = 'hidden';
}

function closeModal(e, f) {
  var overlay = document.getElementById('overlay');
  if (!overlay) return;
  if (f || (e && e.target === overlay)) {
    overlay.classList.remove('on');
    document.body.style.overflow = '';
  }
}

// ===== FAQ =====
function toggleFaq(btn) {
  var a    = btn.nextElementSibling;
  var open = btn.classList.contains('open');
  document.querySelectorAll('.faq-q').forEach(function(b) {
    b.classList.remove('open');
    if (b.nextElementSibling) b.nextElementSibling.classList.remove('open');
  });
  if (!open) { btn.classList.add('open'); if (a) a.classList.add('open'); }
}

// ===== CONTACT =====
function envoyerContact() {
  var p = (document.getElementById('cPrenom') || {}).value || '';
  var t = (document.getElementById('cTel')    || {}).value || '';
  var s = (document.getElementById('cSujet')  || {}).value || '';
  var m = (document.getElementById('cMsg')    || {}).value || '';
  if (!p || !t || !m) { showToast('Remplissez au moins votre prénom, téléphone et message'); return; }
  var msg = '*Message depuis ZenTech*\n\n*Prénom:* ' + p + '\n*Téléphone:* ' + t + (s ? '\n*Sujet:* ' + s : '') + '\n*Message:* ' + m;
  window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(msg), '_blank');
}

// ===== THEME =====
function toggleTheme() {
  var h = document.documentElement;
  var d = h.getAttribute('data-theme') === 'dark';
  h.setAttribute('data-theme', d ? 'light' : 'dark');
  var ico = document.getElementById('themeIco');
  var lbl = document.getElementById('themeLbl');
  if (ico) ico.className   = d ? 'fas fa-sun'  : 'fas fa-moon';
  if (lbl) lbl.textContent = d ? 'Sombre' : 'Clair';
  localStorage.setItem('zt-theme', d ? 'light' : 'dark');
}

function toggleMobile() {
  var burger    = document.getElementById('burger');
  var mobileNav = document.getElementById('mobileNav');
  if (burger)    burger.classList.toggle('open');
  if (mobileNav) mobileNav.classList.toggle('open');
}

// ===== SCROLL / TOAST =====
window.addEventListener('scroll', function() {
  var bt = document.getElementById('backTop');
  if (bt) bt.classList.toggle('on', window.scrollY > 400);
});

function showToast(m) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = m;
  t.classList.add('on');
  setTimeout(function() { t.classList.remove('on'); }, 2800);
}

// ===== SLIDER =====
var slides = document.querySelectorAll('.slide');
var dots   = document.querySelectorAll('.dots span');
var idx    = 0;

function showSlide(i) {
  slides.forEach(function(s) { s.classList.remove('active'); });
  dots.forEach(function(d)   { d.classList.remove('active'); });
  if (slides[i]) slides[i].classList.add('active');
  if (dots[i])   dots[i].classList.add('active');
}

var slideTimer = null;
function relancerSlides() {
  clearInterval(slideTimer);
  slideTimer = setInterval(function() { idx = (idx + 1) % slides.length; showSlide(idx); }, 6000);
}
if (slides.length > 1) {
  relancerSlides();
  dots.forEach(function(d, i) { d.addEventListener('click', function() { idx = i; showSlide(idx); relancerSlides(); }); });
}

// ===== KEYBOARD =====
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeModal(null, true);
    closeCO(null, true);
    var sb = document.getElementById('cartSidebar');
    if (sb && sb.classList.contains('on')) toggleCart();
    var om = document.getElementById('omModal');
    if (om) om.remove();
  }
});

// ===== THEME LABELS =====
(function() {
  var st = localStorage.getItem('zt-theme');
  if (st === 'light') {
    var ico = document.getElementById('themeIco');
    var lbl = document.getElementById('themeLbl');
    if (ico) ico.className   = 'fas fa-sun';
    if (lbl) lbl.textContent = 'Sombre';
  }
})();

// ===== INIT =====
// le chargeur se ferme dès que la page est prête (la vitesse compte pour Google)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() { setTimeout(fermerLoader, 250); });
} else {
  setTimeout(fermerLoader, 250);
}

// lien « Voir le panier » depuis une page produit : index.html#panier
if (location.hash === '#panier') {
  try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
  setTimeout(function() { var sb = document.getElementById('cartSidebar'); if (sb && !sb.classList.contains('on')) toggleCart(); }, 400);
}

updateCart();
renderCart();
chargerProduits();