// ===== ZENTECH : pages produit et catalogue =====
(function () {
  window.ztMotion = true;
  document.documentElement.classList.add('js');

  function lirePanier() {
    try { return JSON.parse(localStorage.getItem('zt-panier') || '[]'); } catch (e) { return []; }
  }
  function compter() {
    var n = lirePanier().reduce(function (s, i) { return s + (Number(i.qte) || 0); }, 0);
    var c = document.getElementById('ppCount');
    if (c) c.textContent = n;
  }
  compter();

  // ----- ajout au panier (même panier que la page d'accueil) -----
  var data = null;
  try { data = JSON.parse(document.getElementById('ppData').textContent); } catch (e) {}
  var btn = document.getElementById('ppAdd');
  var toast = document.getElementById('ppToast');
  var minuterie;

  if (data && btn) {
    btn.addEventListener('click', function () {
      var panier = lirePanier();
      var ex = panier.find(function (x) { return x.id === data.id; });
      if (ex) ex.qte++;
      else panier.push({ id: data.id, nom: data.nom, prix: data.prix, img: data.img, categorie: data.categorie || '', qte: 1 });
      try { localStorage.setItem('zt-panier', JSON.stringify(panier)); } catch (e) {}
      compter();
      btn.classList.add('done');
      btn.innerHTML = '<i class="fas fa-check"></i> Ajouté au panier';
      setTimeout(function () {
        btn.classList.remove('done');
        btn.innerHTML = '<i class="fas fa-cart-plus"></i> Ajouter au panier';
      }, 1800);
      if (toast) {
        toast.innerHTML = '<span>« ' + data.nom.replace(/</g, '&lt;') + ' » est dans votre panier</span><a href="../index.html#panier">Voir le panier</a>';
        toast.classList.add('on');
        clearTimeout(minuterie);
        minuterie = setTimeout(function () { toast.classList.remove('on'); }, 3500);
      }
    });
  }

  // ----- apparitions au défilement -----
  var items = document.querySelectorAll('.reveal');
  var calme = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (calme || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  items.forEach(function (el) { io.observe(el); });
})();
