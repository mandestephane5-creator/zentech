// ===== ZENTECH : fonds tech et animations =====
// Circuit imprimé animé dans l'accueil, apparitions au défilement, compteurs,
// inclinaison des catégories. Tout s'arrête si l'appareil demande moins d'animations.
(function () {
  'use strict';
  window.ztMotion = true;
  var html = document.documentElement;
  html.classList.add('js');

  var calme = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pointeurFin = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* =================================================================
     1. CIRCUIT IMPRIMÉ DE L'ACCUEIL (canvas)
     ================================================================= */
  var canvas = document.getElementById('heroCanvas');
  if (canvas && canvas.getContext) circuit(canvas);

  function circuit(cv) {
    var ctx = cv.getContext('2d');
    var hero = cv.parentElement;
    var DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    var W = 0, H = 0, fond = null, pistes = [], impulsions = [], eclairs = [];
    var enVue = true, enMarche = false, dernier = 0, prochaine = 0;
    var DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];

    function hasard(n) { return Math.floor(Math.random() * n); }

    // --- fabrique un réseau de pistes : lignes droites, virages à 45°, pastilles ---
    function fabriquer() {
      var G = W < 700 ? 18 : 22;
      var cols = Math.ceil(W / G) + 2, rows = Math.ceil(H / G) + 2;
      var occ = new Uint8Array(cols * rows);
      var cible = Math.round((W * H) / (W < 700 ? 9000 : 7000));
      pistes = [];

      function libre(x, y, px, py) {
        if (x < 0 || y < 0 || x >= cols || y >= rows) return false;
        if (occ[y * cols + x]) return false;
        // garde une case vide entre deux pistes
        for (var i = 0; i < 8; i += 2) {
          var nx = x + DIRS[i][0], ny = y + DIRS[i][1];
          if (nx === px && ny === py) continue;
          if (nx >= 0 && ny >= 0 && nx < cols && ny < rows && occ[ny * cols + nx]) return false;
        }
        return true;
      }

      for (var essai = 0; essai < cible * 6 && pistes.length < cible; essai++) {
        var cx = hasard(cols), cy = hasard(rows);
        // moins de pistes derrière le texte, à gauche
        if (W > 700 && Math.random() > 0.25 + 0.75 * (cx / cols)) continue;
        if (!libre(cx, cy, -1, -1)) continue;
        var d = hasard(4) * 2, pts = [[cx, cy]], pas = 0, seg = 3 + hasard(9), dansSeg = 0;
        var trace = [[cx, cy]];
        occ[cy * cols + cx] = 1;
        for (var k = 0; k < 70; k++) {
          if (dansSeg >= seg) {
            d = (d + (Math.random() < 0.5 ? 1 : 7)) % 8;
            seg = d % 2 ? 1 + hasard(3) : 3 + hasard(10);
            pts.push([cx, cy]);
            dansSeg = 0;
          }
          var nx = cx + DIRS[d][0], ny = cy + DIRS[d][1];
          if (!libre(nx, ny, cx, cy)) break;
          // en diagonale, on n'enjambe pas une autre piste
          if (d % 2 && (occ[cy * cols + nx] || occ[ny * cols + cx])) break;
          cx = nx; cy = ny;
          occ[cy * cols + cx] = 1;
          trace.push([cx, cy]);
          pas++; dansSeg++;
        }
        if (pas < 4) {
          trace.forEach(function (c) { occ[c[1] * cols + c[0]] = 0; });
          continue;
        }
        pts.push([cx, cy]);
        // en pixels, avec la longueur de chaque segment
        var p = [], lg = [0];
        for (var j = 0; j < pts.length; j++) {
          var X = (pts[j][0] - 1) * G + 0.5, Y = (pts[j][1] - 1) * G + 0.5;
          if (p.length && p[p.length - 1][0] === X && p[p.length - 1][1] === Y) continue;
          p.push([X, Y]);
          if (p.length > 1) {
            var a = p[p.length - 2];
            lg.push(lg[lg.length - 1] + Math.hypot(X - a[0], Y - a[1]));
          }
        }
        if (p.length > 1) pistes.push({ p: p, lg: lg, total: lg[lg.length - 1] });
      }
    }

    // --- dessine le décor fixe une seule fois ---
    function dessinerFond() {
      fond = document.createElement('canvas');
      fond.width = W * DPR; fond.height = H * DPR;
      var f = fond.getContext('2d');
      f.scale(DPR, DPR);
      f.lineCap = 'round';
      f.lineJoin = 'round';
      pistes.forEach(function (t) {
        f.strokeStyle = 'rgba(255,255,255,' + (0.05 + Math.random() * 0.05).toFixed(3) + ')';
        f.lineWidth = Math.random() < 0.15 ? 2.2 : 1.2;
        f.beginPath();
        f.moveTo(t.p[0][0], t.p[0][1]);
        for (var i = 1; i < t.p.length; i++) f.lineTo(t.p[i][0], t.p[i][1]);
        f.stroke();
        // pastilles aux extrémités
        [t.p[0], t.p[t.p.length - 1]].forEach(function (q, n) {
          f.beginPath();
          f.arc(q[0], q[1], n ? 3 : 2.2, 0, Math.PI * 2);
          if (n && Math.random() < 0.5) {
            f.strokeStyle = 'rgba(255,255,255,0.16)'; f.lineWidth = 1.2; f.stroke();
          } else {
            f.fillStyle = 'rgba(255,255,255,0.13)'; f.fill();
          }
        });
      });
    }

    // point situé à la distance s sur une piste
    function pointA(t, s) {
      if (s <= 0) return t.p[0];
      if (s >= t.total) return t.p[t.p.length - 1];
      var i = 1;
      while (i < t.lg.length && t.lg[i] < s) i++;
      var a = t.p[i - 1], b = t.p[i], r = (s - t.lg[i - 1]) / (t.lg[i] - t.lg[i - 1]);
      return [a[0] + (b[0] - a[0]) * r, a[1] + (b[1] - a[1]) * r];
    }

    function nouvelleImpulsion() {
      if (!pistes.length) return;
      var t = pistes[hasard(pistes.length)];
      if (t.total < 80) t = pistes[hasard(pistes.length)];
      impulsions.push({ t: t, s: 0, v: 110 + Math.random() * 130, sens: Math.random() < 0.5 ? 1 : -1, queue: 50 + Math.random() * 50 });
    }

    function image(temps) {
      if (!enMarche) return;
      var dt = Math.min((temps - dernier) / 1000, 0.05);
      dernier = temps;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(fond, 0, 0, W, H);

      if (temps > prochaine && impulsions.length < (W < 700 ? 3 : 6)) {
        nouvelleImpulsion();
        prochaine = temps + 600 + Math.random() * 900;
      }

      ctx.lineCap = 'round';
      for (var i = impulsions.length - 1; i >= 0; i--) {
        var m = impulsions[i];
        m.s += m.v * dt;
        var tete = m.sens > 0 ? m.s : m.t.total - m.s;
        var bout = m.sens > 0 ? m.s - m.queue : m.t.total - m.s + m.queue;
        // traînée : on suit la piste entre la queue et la tête
        var n = 8, prec = pointA(m.t, bout);
        for (var k = 1; k <= n; k++) {
          var q = pointA(m.t, bout + (tete - bout) * (k / n));
          ctx.strokeStyle = 'rgba(255,60,60,' + (0.55 * k / n).toFixed(3) + ')';
          ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(prec[0], prec[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
          prec = q;
        }
        var h = pointA(m.t, tete);
        ctx.fillStyle = 'rgba(255,70,70,0.9)';
        ctx.beginPath(); ctx.arc(h[0], h[1], 1.8, 0, Math.PI * 2); ctx.fill();
        if (m.s - m.queue > m.t.total) {
          eclairs.push({ x: h[0], y: h[1], age: 0 });
          impulsions.splice(i, 1);
        }
      }
      // petite onde quand une impulsion arrive au bout de sa piste
      for (var e = eclairs.length - 1; e >= 0; e--) {
        var c = eclairs[e];
        c.age += dt;
        var r = c.age / 0.6;
        if (r >= 1) { eclairs.splice(e, 1); continue; }
        ctx.strokeStyle = 'rgba(255,60,60,' + (0.6 * (1 - r)).toFixed(3) + ')';
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(c.x, c.y, 3 + r * 12, 0, Math.PI * 2); ctx.stroke();
      }
      requestAnimationFrame(image);
    }

    function demarrer() {
      if (enMarche || calme || !enVue || document.hidden) return;
      enMarche = true;
      dernier = performance.now();
      requestAnimationFrame(image);
    }
    function arreter() { enMarche = false; }

    function taille() {
      var r = hero.getBoundingClientRect();
      if (!r.width || !r.height) return;
      W = Math.round(r.width); H = Math.round(r.height);
      cv.width = W * DPR; cv.height = H * DPR;
      impulsions = []; eclairs = [];
      fabriquer();
      dessinerFond();
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(fond, 0, 0, W, H);
    }

    taille();
    var attente;
    var largeur = W;
    window.addEventListener('resize', function () {
      clearTimeout(attente);
      attente = setTimeout(function () {
        // sur téléphone, la barre d'adresse change la hauteur : on ne redessine que si la largeur change
        var r = hero.getBoundingClientRect();
        if (Math.abs(r.width - largeur) < 2 && Math.abs(r.height - H) < 120) return;
        largeur = r.width;
        taille();
      }, 200);
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        enVue = e[0].isIntersecting;
        if (enVue) demarrer(); else arreter();
      }).observe(hero);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) arreter(); else demarrer();
    });
    demarrer();
  }

  /* =================================================================
     2. PRODUIT DE L'ACCUEIL QUI SUIT LÉGÈREMENT LA SOURIS
     ================================================================= */
  var heroEl = document.querySelector('.hero');
  if (heroEl && pointeurFin && !calme) {
    var cadre = 0;
    heroEl.addEventListener('mousemove', function (ev) {
      if (cadre) return;
      cadre = requestAnimationFrame(function () {
        cadre = 0;
        var r = heroEl.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width - 0.5;
        var y = (ev.clientY - r.top) / r.height - 0.5;
        document.querySelectorAll('.slide-img').forEach(function (el) {
          el.style.translate = (x * -22).toFixed(1) + 'px ' + (y * -16).toFixed(1) + 'px';
        });
      });
    });
    heroEl.addEventListener('mouseleave', function () {
      document.querySelectorAll('.slide-img').forEach(function (el) { el.style.translate = '0px 0px'; });
    });
    document.querySelectorAll('.slide-img').forEach(function (el) { el.style.transition = 'translate 0.6s cubic-bezier(.2,.7,.2,1)'; });
  }

  /* =================================================================
     3. APPARITIONS AU DÉFILEMENT
     ================================================================= */
  var io = null;
  function montrer(el) { el.classList.add('in'); }
  if (!calme && 'IntersectionObserver' in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { montrer(e.target); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  }
  function observer(el, i) {
    if (i !== undefined) el.style.setProperty('--d', (Math.min(i, 7) * 0.07) + 's');
    if (io) io.observe(el); else montrer(el);
  }
  // décalage en cascade à l'intérieur d'une même grille
  document.querySelectorAll('.cat-grid, .pourquoi-grid, .temo-grid').forEach(function (grille) {
    Array.prototype.forEach.call(grille.querySelectorAll('.reveal'), function (el, i) { observer(el, i); });
  });
  document.querySelectorAll('.reveal').forEach(function (el) {
    if (!el.closest('.cat-grid, .pourquoi-grid, .temo-grid')) observer(el);
  });
  document.querySelectorAll('h2.titre').forEach(function (el) { observer(el); });

  // sécurité : tout ce qui devait apparaître au défilement s'affiche au bout de 2,5 s quoi qu'il arrive
  setTimeout(function () { document.querySelectorAll('.reveal:not(.in), h2.titre:not(.in)').forEach(montrer); }, 2500);

  // en-tête : ombre douce dès qu'on quitte le haut de la page
  var tete = document.querySelector('.header');
  if (tete) {
    var majTete = function () { tete.classList.toggle('defile', window.scrollY > 8); };
    window.addEventListener('scroll', majTete, { passive: true }); majTete();
  }

  /* =================================================================
     4. COMPTEURS DE LA BANDE ROUGE (500+, 24h, 100%)
     ================================================================= */
  var nums = document.querySelectorAll('.stat-item .num[data-count]');
  if (nums.length && !calme && 'IntersectionObserver' in window) {
    var compte = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        compte.unobserve(e.target);
        var el = e.target, fin = Number(el.getAttribute('data-count')), suf = el.getAttribute('data-suffix') || '';
        var t0 = performance.now(), duree = 1400;
        (function pas(t) {
          var r = Math.min((t - t0) / duree, 1);
          var v = Math.round(fin * (1 - Math.pow(1 - r, 3)));
          el.textContent = v + suf;
          if (r < 1) requestAnimationFrame(pas);
        })(t0);
      });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { compte.observe(n); });
  }

  /* =================================================================
     5. CATÉGORIES : INCLINAISON 3D AU SURVOL
     ================================================================= */
  if (false) {
    document.querySelectorAll('.cat-card').forEach(function (c) {
      c.addEventListener('mousemove', function (ev) {
        var r = c.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
        c.style.transform = 'perspective(800px) rotateX(' + ((0.5 - y) * 3).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * 4).toFixed(2) + 'deg) translateY(-2px)';
        c.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        c.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      });
      c.addEventListener('mouseleave', function () { c.style.transform = ''; });
    });
  }
})();
