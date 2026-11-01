/* ============================================================
   ZENTECH — Espace admin sans serveur
   Les articles sont dans data/produits.json, sur GitHub.
   Cette page lit ce fichier, permet de le modifier, puis publie
   les changements (et les nouvelles photos) en un seul envoi.
   ============================================================ */
(function () {
  "use strict";
  // Jamais dans le cadre d'un autre site (protection contre le « clickjacking »)
  if (window.top !== window.self) return;

  /* ---------- Réglages (facultatifs) ----------
     Sur GitHub Pages, le compte et le dépôt sont détectés tout seuls.
     Remplissez-les seulement si le site est hébergé ailleurs. */
  const CONFIG = {
    owner: "",                    // ex. "mandestephane5-creator"
    repo: "",                     // ex. "zentech"
    branch: "",                   // vide = branche principale du dépôt
    dataPath: "data/produits.json",
    sitePath: "data/site.json",       // adresse du site et réglages Google
    newsPath: "data/actualites.json", // page Actualités
    imgDir: "img/produits",
  };
  const SEO = window.ZTSEO;           // js/seo-pages.js : fabrique les pages pour Google

  /* ---------- outils ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fcfa = (n) => Number(n || 0).toLocaleString("fr-FR").replace(/ | /g, " ") + " FCFA";
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const keep = {
    get(k, s) { try { return (s ? sessionStorage : localStorage).getItem(k); } catch (e) { return null; } },
    set(k, v, s) { try { (s ? sessionStorage : localStorage).setItem(k, v); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); sessionStorage.removeItem(k); } catch (e) {} },
  };
  const slug = (t) => String(t).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "article";

  function b64ToUtf8(b64) {
    const bin = atob(b64.replace(/\s/g, ""));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder("utf-8").decode(bytes);
  }
  async function gitBlobSha(text) {
    const body = new TextEncoder().encode(text);
    const head = new TextEncoder().encode("blob " + body.length + "\0");
    const all = new Uint8Array(head.length + body.length);
    all.set(head); all.set(body, head.length);
    const h = await crypto.subtle.digest("SHA-1", all);
    return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  function normaliser(p) {
    const num = (v) => (v === null || v === undefined || v === "" ? null : Number(v));
    const specs = {};
    Object.entries(p.specs || {}).forEach(([k, v]) => { if (String(k).trim()) specs[String(k).trim()] = String(v == null ? "" : v).trim(); });
    return {
      id: Number(p.id),
      nom: String(p.nom || "").trim(),
      categorie: String(p.categorie || "Autres").trim(),
      prix: Math.max(0, Math.round(Number(p.prix) || 0)),
      ancienPrix: num(p.ancienPrix) ? Math.round(num(p.ancienPrix)) : null,
      qte: num(p.qte) === null ? null : Math.max(0, Math.round(num(p.qte))),
      visible: p.visible !== false,
      badge: p.badge === "new" || p.badge === "promo" ? p.badge : "",
      img: String(p.img || ""),
      desc: String(p.desc || "").trim(),
      note: Math.min(5, Math.max(0, Number(p.note) || 0)),
      avis: Math.max(0, Math.round(Number(p.avis) || 0)),
      specs,
      slug: String(p.slug || ""),
    };
  }

  /* ---------- référencement : adresse du site et outils Google ---------- */
  function adresseDetectee() {
    if (!/^https?:$/.test(location.protocol)) return "";
    if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])$/.test(location.hostname)) return "";
    return location.origin + location.pathname.replace(/[^/]*$/, "");
  }
  function normSite(o) {
    o = o || {};
    let a = String(o.adresse || "").trim();
    if (a) a = SEO ? (SEO.base(a) === SEO.SITE_PAR_DEFAUT && !/zentech\.bf/i.test(a) ? "" : SEO.base(a)) : "";
    return { adresse: a, ga: SEO ? SEO.idGA(o.ga) : "", gsc: SEO ? SEO.codeGSC(o.gsc) : "" };
  }
  const adresseSite = () => S.site.adresse || adresseDetectee() || (SEO ? SEO.SITE_PAR_DEFAUT : "");
  function siteChange() {
    if (!SEO) return false;
    return S.siteOriginal === null || JSON.stringify(normSite(S.site)) !== JSON.stringify(S.siteOriginal);
  }

  /* ---------- état ---------- */
  const S = {
    owner: "", repo: "", branch: "", token: "",
    baseSha: null,          // version du fichier en ligne sur laquelle on travaille
    original: [],           // articles tels qu'en ligne
    produits: [],           // articles avec les modifications
    images: {},             // nouvelles photos à envoyer : chemin -> data URL
    shown: {},              // photos déjà envoyées, gardées pour l'affichage
    site: normSite({}),     // réglages du référencement (modifiés)
    siteOriginal: null,     // réglages en ligne (null = jamais publiés)
    news: [], newsOriginal: [], // actualités (modifiées / en ligne)
    filtre: "tous", q: "", cat: "",
  };
  const draftKey = () => `zt-admin-brouillon:${S.owner}/${S.repo}`.toLowerCase();

  /* ---------- message et confirmation ---------- */
  let toastT;
  function toast(msg, ms = 2800) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("on");
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove("on"), ms);
  }
  function ask(title, text, yes = "Confirmer", no = "Annuler") {
    return new Promise((resolve) => {
      const d = $("#dialog");
      $("#dlgTitle").textContent = title;
      $("#dlgText").textContent = text;
      $("#dlgYes").textContent = yes;
      $("#dlgNo").textContent = no;
      d.hidden = false;
      $("#dlgYes").focus();
      const done = (v) => { d.hidden = true; $("#dlgYes").onclick = $("#dlgNo").onclick = null; resolve(v); };
      $("#dlgYes").onclick = () => done(true);
      $("#dlgNo").onclick = () => done(false);
    });
  }

  /* ---------- API GitHub ---------- */
  async function gh(path, opts = {}) {
    let res;
    try {
      res = await fetch("https://api.github.com" + path, {
        method: opts.method || "GET",
        headers: Object.assign(
          { Accept: "application/vnd.github+json", Authorization: "Bearer " + S.token, "X-GitHub-Api-Version": "2022-11-28" },
          opts.body ? { "Content-Type": "application/json" } : {}
        ),
        body: opts.body ? JSON.stringify(opts.body) : undefined,
      });
    } catch (e) {
      const err = new Error("Pas de connexion internet. Vérifiez votre réseau et réessayez.");
      err.status = 0;
      throw err;
    }
    if (!res.ok) {
      let msg = "";
      try { msg = (await res.json()).message || ""; } catch (e) {}
      const err = new Error(msg || res.statusText);
      err.status = res.status;
      throw err;
    }
    return res.status === 204 ? null : res.json();
  }
  const R = () => `/repos/${encodeURIComponent(S.owner)}/${encodeURIComponent(S.repo)}`;
  const enc = (p) => p.split("/").map(encodeURIComponent).join("/");

  function messageErreur(e, quoi) {
    if (e.status === 0) return e.message;
    if (e.status === 401) return "Clé refusée par GitHub : elle est incorrecte ou a expiré. Créez-en une nouvelle.";
    if (e.status === 403 && /rate limit/i.test(e.message)) return "GitHub limite les envois pour l'instant. Réessayez dans quelques minutes.";
    if (e.status === 403 || (e.status === 404 && quoi === "publier"))
      return "Cette clé n'a pas le droit de modifier le dépôt. Sur GitHub, donnez-lui la permission « Contents : Read and write ».";
    if (e.status === 404) return `Dépôt « ${S.owner}/${S.repo} » introuvable. Vérifiez son nom, et que la clé a bien accès à ce dépôt.`;
    if (e.status === 409) return "Le dépôt est vide. Envoyez d'abord les fichiers du site sur GitHub.";
    return "Erreur GitHub : " + e.message;
  }

  /* ---------- dépôt : détection et réglages ---------- */
  function detecter() {
    const h = location.hostname.toLowerCase();
    if (h.endsWith(".github.io")) {
      const owner = h.replace(/\.github\.io$/, "");
      const seg = location.pathname.split("/").filter(Boolean)[0];
      return { owner, repo: seg && !seg.includes(".") ? seg : h };
    }
    return null;
  }
  function chargerReglages() {
    let saved = null;
    try { saved = JSON.parse(keep.get("zt-admin-depot") || "null"); } catch (e) {}
    const d = detecter();
    S.owner = (saved && saved.owner) || (d && d.owner) || CONFIG.owner;
    S.repo = (saved && saved.repo) || (d && d.repo) || CONFIG.repo;
    $("#repoLabel").textContent = S.owner && S.repo ? `${S.owner}/${S.repo}` : "à indiquer";
    $("#inOwner").value = S.owner;
    $("#inRepo").value = S.repo;
    if (!S.owner || !S.repo) { $("#repoFields").hidden = false; $("#repoLine").hidden = true; }
  }

  /* ---------- verrouillage ----------
     La clé GitHub n'est jamais enregistrée en clair : elle est chiffrée
     (AES-GCM) avec une clé tirée du code de verrouillage (PBKDF2).
     Sans le code, ce qui reste sur l'appareil est illisible. */
  const COFFRE = "zt-admin-coffre", ESSAIS = "zt-admin-essais";
  const MAX_ESSAIS = 5, VEILLE_MIN = 10, TOURS = 600000;
  const masqueCss = !!(window.CSS && CSS.supports && CSS.supports("-webkit-text-security", "disc"));
  function remasquer() {
    $$("[data-eye]").forEach((b) => {
      const i = document.getElementById(b.dataset.eye);
      if (masqueCss) i.classList.add("secret"); else i.type = "password";
      b.querySelector("i").className = "fas fa-eye";
    });
  }
  let coffreMemo = null, verrouille = false, modeVerrou = "ouvrir", derniereActivite = Date.now();
  const b64 = (u8) => { let s = ""; u8.forEach((c) => (s += String.fromCharCode(c))); return btoa(s); };
  const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

  async function cleDuCode(code, sel, tours) {
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(code), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name: "PBKDF2", salt: sel, iterations: tours, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  }
  async function sceller(token, code, local) {
    const sel = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    const k = await cleDuCode(code, sel, TOURS);
    const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, k, new TextEncoder().encode(token)));
    coffreMemo = { v: 1, it: TOURS, sel: b64(sel), iv: b64(iv), ct: b64(ct) };
    oublierCle(true);
    if (!keep.set(COFFRE, JSON.stringify(coffreMemo), !local))
      toast("Cet appareil ne peut pas garder la clé : il faudra la recoller à la prochaine ouverture.", 5000);
  }
  function coffre() {
    try { return JSON.parse(keep.get(COFFRE, true) || keep.get(COFFRE) || "null") || coffreMemo; } catch (e) { return coffreMemo; }
  }
  async function ouvrirCoffre(code) {
    const c = coffre();
    if (!c) return null;
    try {
      const k = await cleDuCode(code, unb64(c.sel), c.it || TOURS);
      return new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(c.iv) }, k, unb64(c.ct)));
    } catch (e) { return null; }
  }
  function oublierCle(garderMemo) {
    keep.del(COFFRE); keep.del(ESSAIS); keep.del("zt-admin-cle");
    if (!garderMemo) coffreMemo = null;
  }
  function codeFaible(c) {
    if (c.length < 6) return "Le code doit faire au moins 6 caractères.";
    if (/^(.)\1+$/.test(c)) return "Ce code est trop simple : évitez de répéter le même caractère.";
    if ("01234567890 09876543210 abcdefghijklmnopqrstuvwxyz azertyuiop qwertyuiop".includes(c.toLowerCase()))
      return "Ce code est trop simple : évitez les suites comme 123456 ou abcdef.";
    if (/^(password|motdepasse|zentech|admin)/i.test(c)) return "Ce code est trop facile à deviner.";
    return "";
  }
  function inerte(on) {
    ["#app", "#editor", "#newsPanel", "#seoPanel", "#veil", "#dialog"].forEach((s) => { const el = $(s); if (el) el.inert = on; });
  }
  function montrerVerrou(mode, msg) {
    modeVerrou = mode;
    const choisir = mode === "choisir";
    $("#lockTitle").textContent = choisir ? "Protégez l'admin" : "Admin verrouillé";
    $("#lockSub").textContent = msg || (choisir
      ? `Choisissez un code de verrouillage. Il vous sera demandé sur cet appareil à chaque ouverture et après ${VEILLE_MIN} minutes sans activité.`
      : "Entrez votre code de verrouillage pour continuer.");
    $("#lockCode2").hidden = !choisir;
    $("#inUnlock").placeholder = choisir ? "6 caractères minimum" : "";
    $("#unlockBtn").innerHTML = choisir ? '<i class="fas fa-shield-halved"></i> Enregistrer le code' : '<i class="fas fa-unlock"></i> Déverrouiller';
    $("#lockForgot").textContent = choisir ? "Utiliser une autre clé GitHub" : "Code oublié ? Se reconnecter avec la clé GitHub";
    $("#inUnlock").value = $("#inUnlock2").value = "";
    remasquer();
    $("#lockErr").hidden = true;
    $("#login").hidden = true;
    $("#lock").hidden = false;
    inerte(true);
    setTimeout(() => $("#inUnlock").focus(), 60);
  }
  function deverrouiller() {
    verrouille = false;
    $("#lock").hidden = true;
    inerte(false);
    derniereActivite = Date.now();
  }
  function verrouiller(auto) {
    if (!S.token || verrouille) return;
    if (!coffre()) return retourConnexion("Session terminée. Reconnectez-vous avec votre clé GitHub.");
    verrouille = true;
    S.token = "";
    montrerVerrou("ouvrir", auto ? `Verrouillé après ${VEILLE_MIN} minutes sans activité. Entrez votre code pour continuer.` : "");
  }
  function retourConnexion(msg) {
    verrouille = false;
    S.token = "";
    S.ancien = null;
    $("#lock").hidden = true;
    $("#app").hidden = true;
    inerte(false);
    $("#login").hidden = false;
    const e = $("#loginErr");
    e.textContent = msg || "";
    e.hidden = !msg;
    setTimeout(() => $("#inToken").focus(), 60);
  }
  function verifierVeille() {
    if (S.token && !verrouille && !publishing && Date.now() - derniereActivite > VEILLE_MIN * 60000) verrouiller(true);
  }

  /* ---------- connexion ---------- */
  async function connecter(token, scelle) {
    S.token = token.trim();
    const repo = await gh(R());
    S.branch = CONFIG.branch || repo.default_branch || "main";
    if (repo.permissions && repo.permissions.push === false)
      throw Object.assign(new Error(""), { status: 403 });
    await chargerArticles();
    if (scelle) await sceller(S.token, scelle.code, scelle.local);
    keep.set("zt-admin-depot", JSON.stringify({ owner: S.owner, repo: S.repo }));
    ["#inToken", "#inCode", "#inCode2", "#inUnlock", "#inUnlock2"].forEach((s) => ($(s).value = ""));
    remasquer();
    $("#login").hidden = true;
    $("#lock").hidden = true;
    inerte(false);
    verrouille = false;
    S.ancien = null;
    derniereActivite = Date.now();
    $("#app").hidden = false;
    $("#repoInfo").textContent = `Dépôt ${S.owner}/${S.repo} · branche ${S.branch}`;
    await reprendreBrouillon();
    rendre();
    S.pret = true;
  }

  async function chargerArticles() {
    let r = null;
    try {
      r = await gh(`${R()}/contents/${enc(CONFIG.dataPath)}?ref=${encodeURIComponent(S.branch)}&t=${Date.now()}`);
    } catch (e) {
      if (e.status !== 404) throw e;
    }
    if (!r) {
      S.baseSha = null;
      S.original = [];
      toast(`Le fichier ${CONFIG.dataPath} n'existe pas encore : il sera créé à la première publication.`, 5000);
    } else {
      let b64 = r.content;
      if (!b64 && r.sha) b64 = (await gh(`${R()}/git/blobs/${r.sha}`)).content; // fichier de plus de 1 Mo
      let data;
      try { data = JSON.parse(b64ToUtf8(b64)); } catch (e) { throw new Error(`Le fichier ${CONFIG.dataPath} est abîmé (JSON invalide).`); }
      S.baseSha = r.sha;
      S.original = (Array.isArray(data) ? data : []).map(normaliser);
    }
    S.produits = clone(S.original);
    S.images = {};
    // réglages du référencement
    S.siteOriginal = null;
    try {
      const f = await gh(`${R()}/contents/${enc(CONFIG.sitePath)}?ref=${encodeURIComponent(S.branch)}&t=${Date.now()}`);
      S.siteOriginal = normSite(JSON.parse(b64ToUtf8(f.content || "")));
    } catch (e) {
      if (e.status && e.status !== 404) throw e;
    }
    S.site = S.siteOriginal ? clone(S.siteOriginal) : normSite({ adresse: adresseDetectee() });
    // actualités
    S.newsOriginal = [];
    try {
      const f = await gh(`${R()}/contents/${enc(CONFIG.newsPath)}?ref=${encodeURIComponent(S.branch)}&t=${Date.now()}`);
      const d = JSON.parse(b64ToUtf8(f.content || "[]")); if (Array.isArray(d)) S.newsOriginal = d;
    } catch (e) { if (e.status && e.status !== 404) throw e; }
    S.news = clone(S.newsOriginal);
  }
  const newsChange = () => JSON.stringify(S.news) !== JSON.stringify(S.newsOriginal);

  async function reprendreBrouillon() {
    let d = null;
    try { d = JSON.parse(keep.get(draftKey()) || "null"); } catch (e) {}
    if (!d || !Array.isArray(d.produits)) return;
    const pareil = JSON.stringify(d.produits.map(normaliser)) === JSON.stringify(S.original);
    if (pareil) { if (d.site) S.site = normSite(d.site); if (!siteChange()) keep.del(draftKey()); return; }
    if (d.site) S.site = normSite(d.site);
    if (Array.isArray(d.news)) S.news = d.news;
    if (d.baseSha === S.baseSha) {
      S.produits = d.produits.map(normaliser);
      S.images = d.images || {};
      toast("Vos modifications non publiées ont été récupérées.");
      return;
    }
    const ok = await ask(
      "Modifications non publiées",
      "Vous aviez des modifications non publiées, mais les articles ont changé en ligne depuis. Les reprendre quand même ? Elles remplaceront la version en ligne quand vous publierez.",
      "Les reprendre", "Les abandonner"
    );
    if (ok) { S.produits = d.produits.map(normaliser); S.images = d.images || {}; }
    else keep.del(draftKey());
  }

  let draftT;
  function sauverBrouillon() {
    clearTimeout(draftT);
    draftT = setTimeout(() => {
      if (!nbChangements()) { keep.del(draftKey()); return; }
      const ok = keep.set(draftKey(), JSON.stringify({ baseSha: S.baseSha, produits: S.produits, images: S.images, site: S.site, news: S.news, date: Date.now() }));
      if (!ok) toast("Photos trop lourdes pour être gardées sur l'appareil : publiez avant de fermer la page.", 4500);
    }, 300);
  }

  /* ---------- modifications ---------- */
  function idsModifies() {
    const o = new Map(S.original.map((p) => [p.id, JSON.stringify(p)]));
    const set = new Set();
    S.produits.forEach((p) => { if (o.get(p.id) !== JSON.stringify(p)) set.add(p.id); });
    return set;
  }
  function nbChangements() {
    const n = new Set(S.produits.map((p) => p.id));
    return idsModifies().size + S.original.filter((p) => !n.has(p.id)).length + (siteChange() ? 1 : 0) + (newsChange() ? 1 : 0);
  }
  function apresModif() { sauverBrouillon(); rendre(); }

  /* ---------- affichage ---------- */
  const imgSrc = (p) => S.images[p] || S.shown[p] || p;
  const enPromo = (p) => p.ancienPrix && p.ancienPrix > p.prix;

  function rendre() {
    const all = S.produits, mod = idsModifies();
    // chiffres
    const vis = all.filter((p) => p.visible).length;
    const promo = all.filter(enPromo).length;
    const rupt = all.filter((p) => p.qte === 0).length;
    const valeur = all.reduce((s, p) => s + (p.qte ? p.qte * p.prix : 0), 0);
    $("#stats").innerHTML =
      `<div class="stat"><b>${all.length}</b><span>articles · ${vis} visibles</span></div>` +
      `<div class="stat red"><b>${promo}</b><span>en promotion</span></div>` +
      `<div class="stat ${rupt ? "warn" : ""}"><b>${rupt}</b><span>en rupture de stock</span></div>` +
      `<div class="stat"><b>${valeur.toLocaleString("fr-FR")}</b><span>FCFA de stock (prix de vente)</span></div>`;
    // catégories
    const cats = [...new Set(all.map((p) => p.categorie))].sort((a, b) => a.localeCompare(b, "fr"));
    const sel = $("#catSel"), cur = S.cat;
    sel.innerHTML = '<option value="">Toutes les catégories</option>' + cats.map((c) => `<option${c === cur ? " selected" : ""}>${esc(c)}</option>`).join("");
    $("#catList").innerHTML = cats.map((c) => `<option value="${esc(c)}">`).join("");
    // liste
    const q = S.q.toLowerCase();
    const list = all.filter((p) => {
      if (S.cat && p.categorie !== S.cat) return false;
      if (q && !`${p.nom} ${p.categorie}`.toLowerCase().includes(q)) return false;
      if (S.filtre === "promo") return enPromo(p);
      if (S.filtre === "rupture") return p.qte === 0;
      if (S.filtre === "masques") return !p.visible;
      if (S.filtre === "modifies") return mod.has(p.id);
      return true;
    });
    $("#list").innerHTML = list.length
      ? list.map((p) => ligne(p, mod.has(p.id))).join("")
      : `<div class="empty"><i class="fas fa-box-open"></i>${all.length ? "Aucun article ne correspond." : "Aucun article pour l'instant. Cliquez sur « Ajouter un article »."}</div>`;
    // barre de publication
    const n = nbChangements();
    $("#pubbar").hidden = n === 0;
    $("#pubCount").textContent = n;
    $("#pubLabel").textContent = n > 1 ? "modifications non publiées"
      : siteChange() ? (S.siteOriginal === null ? "mise en place du référencement Google" : "réglage du référencement à publier")
      : "modification non publiée";
  }

  function ligne(p, modifie) {
    const neuf = !S.original.some((o) => o.id === p.id);
    const tags = (neuf ? '<span class="tagx mod">ajouté</span>' : modifie ? '<span class="tagx mod">modifié</span>' : "") +
      (p.badge === "new" ? '<span class="tagx new">Nouveau</span>' : "") +
      (enPromo(p) || p.badge === "promo" ? '<span class="tagx promo">Promo</span>' : "");
    const q = p.qte === null ? '<span class="none">—</span>' : `<span class="${p.qte === 0 ? "zero" : ""}">${p.qte}</span>`;
    return `<div class="item${modifie ? " changed" : ""}${p.visible ? "" : " hidden-item"}" data-id="${p.id}">
      <div class="thumb">${p.img ? `<img src="${esc(imgSrc(p.img))}" alt="" loading="lazy">` : '<i class="fas fa-image"></i>'}</div>
      <div class="it-name"><b>${esc(p.nom)}</b><small>${esc(p.categorie)}</small>${tags}</div>
      <div class="it-price">${p.prix > 0 ? `<b>${fcfa(p.prix)}</b>` : '<b class="dem">Prix sur demande</b>'}${enPromo(p) ? `<s>${fcfa(p.ancienPrix)}</s>` : ""}</div>
      <div class="it-stock"><div class="mini-qty"><button type="button" data-q="-1" aria-label="Retirer 1 du stock"><i class="fas fa-minus"></i></button>${q}<button type="button" data-q="1" aria-label="Ajouter 1 au stock"><i class="fas fa-plus"></i></button></div></div>
      <div class="it-vis"><span class="sw"><input type="checkbox" data-vis aria-label="Visible sur le site"${p.visible ? " checked" : ""}><i></i></span></div>
      <div class="it-acts"><button class="ib" type="button" data-act="edit" title="Modifier" aria-label="Modifier"><i class="fas fa-pen"></i></button><button class="ib" type="button" data-act="dup" title="Dupliquer" aria-label="Dupliquer"><i class="fas fa-copy"></i></button></div>
    </div>`;
  }

  /* ---------- fiche article ---------- */
  let edit = null; // { id|null, img, imgData }
  function ouvrir(p, copie) {
    const neuf = !p || copie;
    edit = { id: neuf ? null : p.id, img: p ? p.img : "", imgData: null };
    $("#edTitle").textContent = neuf ? (copie ? "Nouvel article (copie)" : "Nouvel article") : "Modifier l'article";
    $("#edDelete").hidden = neuf;
    $("#fNom").value = p ? p.nom + (copie ? " (copie)" : "") : "";
    $("#fCat").value = p ? p.categorie : S.cat || "";
    $("#fPrix").value = p ? p.prix : "";
    $("#fAncien").value = p && p.ancienPrix ? p.ancienPrix : "";
    $("#fQte").value = p && p.qte !== null ? p.qte : "";
    $("#fVisible").checked = p ? p.visible : true;
    $("#fDesc").value = p ? p.desc : "";
    $("#fNote").value = p ? p.note : 0;
    $("#fAvis").value = p ? p.avis : 0;
    $$('#fBadge input').forEach((r) => (r.checked = r.value === (p ? p.badge : "")));
    $("#specs").innerHTML = "";
    Object.entries(p ? p.specs : {}).forEach(([k, v]) => ajouterSpec(k, v));
    if (!p) ajouterSpec("", "");
    montrerPhoto(edit.img ? imgSrc(edit.img) : "");
    $("#edErr").hidden = true;
    $$(".bad", $("#edForm")).forEach((x) => x.classList.remove("bad"));
    majPromo();
    majApercu();
    $("#veil").hidden = false;
    $("#editor").classList.add("on");
    $("#editor").setAttribute("aria-hidden", "false");
    document.body.classList.add("lock");
    $("#edForm").scrollTop = 0;
    setTimeout(() => $("#fNom").focus({ preventScroll: true }), 300);
  }
  function fermer() {
    $("#editor").classList.remove("on");
    $("#editor").setAttribute("aria-hidden", "true");
    $("#veil").hidden = true;
    document.body.classList.remove("lock");
    edit = null;
  }
  function montrerPhoto(src) {
    const img = $("#edImg");
    if (src) img.src = src; else img.removeAttribute("src");
    $("#photoBox").classList.toggle("has-img", !!src);
    $("#photoBtnTxt").textContent = src ? "Changer la photo" : "Choisir une photo";
  }
  function ajouterSpec(k, v) {
    const d = document.createElement("div");
    d.className = "spec";
    d.innerHTML = `<input class="sk" placeholder="Ex. Autonomie" value="${esc(k)}" maxlength="40"><input class="sv" placeholder="Ex. 12 heures" value="${esc(v)}" maxlength="80"><button type="button" class="ib" aria-label="Retirer"><i class="fas fa-xmark"></i></button>`;
    d.querySelector("button").onclick = () => d.remove();
    $("#specs").appendChild(d);
    return d;
  }
  // aperçu de l'article tel qu'il apparaîtra dans les résultats Google
  function majApercu() {
    if (!SEO || !$("#serpUrl")) return;
    const nom = $("#fNom").value.trim() || "Nom de l'article";
    const ancien = edit && edit.id !== null ? S.produits.find((p) => p.id === edit.id) : null;
    const p = { nom, prix: Number($("#fPrix").value) || 0, desc: $("#fDesc").value, qte: $("#fQte").value === "" ? null : Number($("#fQte").value) };
    let sl = ancien && ancien.slug ? ancien.slug : SEO.slugify(nom);
    const url = SEO.base(adresseSite()) + "produit/" + sl + ".html";
    $("#serpUrl").textContent = url.replace(/^https?:\/\//, "").replace(/\//g, " › ").replace(/ › $/, "");
    $("#serpTitle").textContent = SEO.titre(p);
    $("#serpDesc").textContent = SEO.description(p);
    const n = $("#fDesc").value.trim().length, h = $("#descHint");
    h.textContent = n === 0 ? "Ajoutez une description : Google l'affiche sous le titre."
      : n < 50 ? `${n} caractères : un peu court. Ajoutez ce que le client recherche (marque, usage, ville).`
      : n > 300 ? `${n} caractères : Google n'en affiche qu'environ 150, mettez l'essentiel au début.`
      : `${n} caractères : bien.`;
    h.className = "hint" + (n >= 50 && n <= 300 ? " ok" : "");
  }

  function majPromo() {
    const prix = Number($("#fPrix").value), anc = Number($("#fAncien").value), h = $("#promoHint");
    if (prix > 0 && anc > prix) { h.hidden = false; h.textContent = `Promo affichée sur le site : -${Math.round((1 - prix / anc) * 100)} %, avec l'ancien prix barré.`; }
    else if (!(prix > 0)) { h.hidden = false; h.textContent = "Sans prix, le site affiche « Prix sur demande » et un bouton pour demander le prix sur WhatsApp."; }
    else h.hidden = true;
  }

  async function lirePhoto(file) {
    if (!file || !/^image\//.test(file.type)) throw new Error("Ce fichier n'est pas une image.");
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = url; });
      const transparent = /png|webp|gif/.test(file.type);
      let max = 1200, data = "";
      for (let essai = 0; essai < 3; essai++) {
        const sc = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement("canvas");
        c.width = Math.round(img.naturalWidth * sc);
        c.height = Math.round(img.naturalHeight * sc);
        const ctx = c.getContext("2d");
        if (!transparent) { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); }
        ctx.drawImage(img, 0, 0, c.width, c.height);
        data = transparent ? c.toDataURL("image/png") : c.toDataURL("image/jpeg", 0.85);
        if (data.length < 1.4e6) break;
        max = Math.round(max * 0.7);
      }
      return { data, ext: transparent ? "png" : "jpg" };
    } catch (e) {
      throw new Error("Impossible de lire cette photo. Utilisez une image JPG ou PNG.");
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function enregistrer() {
    const err = (msg, el) => { const e = $("#edErr"); e.textContent = msg; e.hidden = false; if (el) { el.classList.add("bad"); el.focus(); } };
    $$(".bad", $("#edForm")).forEach((x) => x.classList.remove("bad"));
    const nom = $("#fNom").value.trim(), cat = $("#fCat").value.trim();
    const prix = $("#fPrix").value, anc = $("#fAncien").value, qte = $("#fQte").value;
    if (!nom) return err("Indiquez le nom de l'article.", $("#fNom"));
    if (!cat) return err("Indiquez la catégorie.", $("#fCat"));
    if (prix !== "" && !(Number(prix) >= 0)) return err("Le prix doit être un nombre positif (ou 0 pour « Prix sur demande »).", $("#fPrix"));
    if (anc !== "" && Number(anc) > 0 && !(Number(prix) > 0)) return err("Indiquez d'abord le prix de vente pour faire une promotion.", $("#fPrix"));
    if (anc !== "" && Number(anc) > 0 && Number(anc) <= Number(prix)) return err("L'ancien prix doit être plus élevé que le prix de vente (ou laissez-le vide).", $("#fAncien"));
    if (qte !== "" && !(Number(qte) >= 0)) return err("Le stock doit être un nombre positif, ou vide.", $("#fQte"));

    const specs = {};
    $$("#specs .spec").forEach((r) => { const k = r.querySelector(".sk").value.trim(); if (k) specs[k] = r.querySelector(".sv").value.trim(); });
    const ancien = S.produits.find((p) => p.id === edit.id);
    let img = edit.img;
    if (edit.imgData) {
      img = `${CONFIG.imgDir}/${slug(nom)}-${Date.now().toString(36)}.${edit.imgData.ext}`;
      if (ancien && S.images[ancien.img]) delete S.images[ancien.img]; // photo jamais publiée, remplacée
      S.images[img] = edit.imgData.data;
    }
    const p = normaliser({
      id: edit.id !== null ? edit.id : S.produits.concat(S.original).reduce((m, x) => Math.max(m, x.id), 0) + 1,
      nom, categorie: cat, prix: prix === "" ? 0 : prix, ancienPrix: anc === "" ? null : anc, qte: qte === "" ? null : qte,
      visible: $("#fVisible").checked, badge: ($('#fBadge input:checked') || {}).value || "",
      img, desc: $("#fDesc").value, note: $("#fNote").value, avis: $("#fAvis").value, specs,
      slug: ancien ? ancien.slug : "",
    });
    if (ancien) S.produits[S.produits.indexOf(ancien)] = p;
    else S.produits.unshift(p);
    fermer();
    apresModif();
    toast(ancien ? "Article modifié. Pensez à publier." : "Article ajouté. Pensez à publier.");
  }

  async function supprimer() {
    const p = S.produits.find((x) => x.id === edit.id);
    if (!p) return;
    const ok = await ask("Supprimer cet article ?", `« ${p.nom} » sera retiré du site à la prochaine publication. Pour le cacher sans le supprimer, décochez plutôt « Visible sur le site ».`, "Supprimer");
    if (!ok) return;
    if (S.images[p.img]) delete S.images[p.img];
    S.produits = S.produits.filter((x) => x.id !== p.id);
    fermer();
    apresModif();
    toast("Article supprimé. Pensez à publier.");
  }

  /* ---------- publication ---------- */
  let publishing = false;
  async function publier(essai = 0) {
    if (publishing) return;
    publishing = true;
    const btn = $("#publishBtn");
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-circle-notch spin"></i> Publication…';
    try {
      // 1. quelqu'un a-t-il publié entre-temps ?
      let enLigne = null;
      try { enLigne = (await gh(`${R()}/contents/${enc(CONFIG.dataPath)}?ref=${encodeURIComponent(S.branch)}&t=${Date.now()}`)).sha; }
      catch (e) { if (e.status !== 404) throw e; }
      if (essai === 0 && enLigne !== S.baseSha) {
        const ok = await ask("Articles modifiés ailleurs", "Les articles ont été modifiés en ligne depuis que vous avez ouvert cette page (par un autre appareil ?). Publier quand même ? Votre version remplacera celle en ligne.", "Publier quand même");
        if (!ok) return;
      }
      // 2. dernière version du dépôt
      const ref = await gh(`${R()}/git/ref/heads/${enc(S.branch)}`);
      const head = ref.object.sha;
      const commit = await gh(`${R()}/git/commits/${head}`);
      // 3. nouvelles photos utilisées par les articles
      const utilisees = new Set(S.produits.map((p) => p.img).concat(S.news.map((a) => a.image)));
      const tree = [];
      for (const [path, data] of Object.entries(S.images)) {
        if (!utilisees.has(path)) continue;
        const blob = await gh(`${R()}/git/blobs`, { method: "POST", body: { content: data.split(",")[1], encoding: "base64" } });
        tree.push({ path, mode: "100644", type: "blob", sha: blob.sha });
      }
      // 4. pages pour Google : une page par article, catalogue, plan du site, robots.txt, page 404
      //    (les nouveaux articles reçoivent ici l'adresse de leur page, enregistrée dans le fichier des articles)
      const noms = [...idsModifies()].map((id) => (S.produits.find((p) => p.id === id) || {}).nom).filter(Boolean);
      const n = nbChangements(), refChange = siteChange(), nwChange = newsChange();
      const site = normSite(S.site);
      const adresse = adresseSite();
      if (SEO) {
        const gen = SEO.generer(S.produits, adresse, site, S.news);
        for (const [path, content] of Object.entries(gen.fichiers)) tree.push({ path, mode: "100644", type: "blob", content });
        // pages d'articles supprimés ou cachés : on les retire
        let anciennes = [];
        try { anciennes = await gh(`${R()}/contents/produit?ref=${encodeURIComponent(head)}`); } catch (e) { if (e.status !== 404) throw e; }
        (Array.isArray(anciennes) ? anciennes : []).forEach((f) => {
          if (f.type === "file" && /\.html$/.test(f.path) && !gen.fichiers[f.path]) tree.push({ path: f.path, mode: "100644", type: "blob", sha: null });
        });
        // accueil : adresse du site, informations de la boutique, outils Google
        try {
          const idx = await gh(`${R()}/contents/index.html?ref=${encodeURIComponent(head)}`);
          const html = b64ToUtf8(idx.content || "");
          const neuf = SEO.majAccueil(html, adresse, site, S.produits);
          if (neuf && neuf !== html) tree.push({ path: "index.html", mode: "100644", type: "blob", content: neuf });
        } catch (e) { if (e.status !== 404) throw e; }
        tree.push({ path: CONFIG.sitePath, mode: "100644", type: "blob", content: JSON.stringify(site, null, 2) + "\n" });
        tree.push({ path: CONFIG.newsPath, mode: "100644", type: "blob", content: JSON.stringify(S.news, null, 2) + "\n" });
      }
      // 5. fichier des articles
      const json = JSON.stringify(S.produits, null, 2) + "\n";
      tree.push({ path: CONFIG.dataPath, mode: "100644", type: "blob", content: json });
      const newTree = await gh(`${R()}/git/trees`, { method: "POST", body: { base_tree: commit.tree.sha, tree } });
      // 6. un seul envoi pour tout
      const nArt = Math.max(0, n - (refChange ? 1 : 0) - (nwChange ? 1 : 0));
      const message = (nArt
        ? `Admin : ${nArt} modification${nArt > 1 ? "s" : ""} des articles` + (noms.length ? ` (${noms.slice(0, 3).join(", ")}${noms.length > 3 ? ", …" : ""})` : "")
        : nwChange ? "Admin : actualités" : "Admin : référencement Google") + (nArt && refChange ? " + référencement" : "") + ((nArt || refChange) && nwChange ? " + actualités" : "");
      const nc = await gh(`${R()}/git/commits`, { method: "POST", body: { message, tree: newTree.sha, parents: [head] } });
      try {
        await gh(`${R()}/git/refs/heads/${enc(S.branch)}`, { method: "PATCH", body: { sha: nc.sha, force: false } });
      } catch (e) {
        if (e.status === 422 && essai < 2) { publishing = false; return publier(essai + 1); } // le dépôt a bougé pendant l'envoi : on recommence
        throw e;
      }
      // 7. c'est en ligne sur GitHub
      S.baseSha = await gitBlobSha(json);
      Object.assign(S.shown, S.images);
      S.images = {};
      S.original = clone(S.produits);
      if (SEO) { S.site = site; S.siteOriginal = clone(site); }
      S.newsOriginal = clone(S.news);
      keep.del(draftKey());
      rendre();
      toast("Publié ! Le site sera à jour dans une minute environ.", 4000);
      suivreMiseEnLigne(json);
    } catch (e) {
      ask("Publication impossible", messageErreur(e, "publier"), "OK", "Fermer");
    } finally {
      publishing = false;
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-cloud-arrow-up"></i> Publier sur le site';
    }
  }

  // vérifie quand GitHub Pages sert la nouvelle version
  let suiviT;
  function suivreMiseEnLigne(json) {
    clearInterval(suiviT);
    const chip = $("#sync");
    if (!/^https?:$/.test(location.protocol)) return;
    chip.hidden = false;
    chip.className = "sync wait";
    chip.innerHTML = '<i class="fas fa-circle-notch spin"></i> Mise en ligne…';
    const debut = Date.now();
    suiviT = setInterval(async () => {
      if (Date.now() - debut > 4 * 60 * 1000) { clearInterval(suiviT); chip.hidden = true; return; }
      try {
        const r = await fetch(`${CONFIG.dataPath}?t=${Date.now()}`, { cache: "no-store" });
        if (r.ok && (await r.text()).trim() === json.trim()) {
          clearInterval(suiviT);
          chip.className = "sync ok";
          chip.innerHTML = '<i class="fas fa-check"></i> En ligne';
          setTimeout(() => (chip.hidden = true), 8000);
        }
      } catch (e) {}
    }, 8000);
  }

  /* ---------- panneau « Actualités » ---------- */
  let nEdit = null; // { id|null, image, imgData }
  const today = () => new Date().toISOString().slice(0, 10);
  function newsListe() {
    const l = S.news.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
    $("#newsItems").innerHTML = l.length ? l.map((a) => `<div class="news-it" data-id="${a.id}"><span class="th">${a.image ? `<img src="${esc(imgSrc(a.image))}" alt="">` : '<i class="fas fa-newspaper"></i>'}</span>
      <span><b>${esc(a.titre)}</b><small>${esc(SEO ? SEO.dateFr(a.date) : a.date)}${a.visible === false ? ' · <span class="off">brouillon</span>' : ""}</small></span><i class="fas fa-pen" style="color:var(--text3)"></i></div>`).join("")
      : '<p class="muted" style="margin-top:12px">Aucune actualité. Cliquez sur « Nouvelle actualité ».</p>';
  }
  function newsMode(form) {
    $("#newsList").hidden = form; $("#newsForm").hidden = !form;
    $("#nSave").hidden = !form; $("#nDelete").hidden = !form || nEdit.id === null;
    $("#nCancel").textContent = form ? "Annuler" : "Fermer";
    $("#nTitle").textContent = form ? (nEdit.id === null ? "Nouvelle actualité" : "Modifier l'actualité") : "Actualités";
  }
  function ouvrirNews() {
    nEdit = null; newsListe(); newsMode(false);
    $("#veil").hidden = false; $("#newsPanel").classList.add("on"); $("#newsPanel").setAttribute("aria-hidden", "false"); document.body.classList.add("lock");
  }
  function fermerNews() {
    $("#newsPanel").classList.remove("on"); $("#newsPanel").setAttribute("aria-hidden", "true");
    if (!edit) $("#veil").hidden = true; document.body.classList.remove("lock");
  }
  function editerNews(a) {
    nEdit = { id: a ? a.id : null, image: a ? a.image || "" : "", imgData: null };
    $("#nTitre").value = a ? a.titre : ""; $("#nDate").value = a ? a.date : today();
    $("#nResume").value = a ? a.resume || "" : ""; $("#nTexte").value = a ? a.texte || "" : "";
    $("#nVisible").checked = a ? a.visible !== false : true; $("#nErr").hidden = true;
    const src = nEdit.image ? imgSrc(nEdit.image) : "";
    if (src) $("#nImg").src = src; else $("#nImg").removeAttribute("src");
    $("#nPhotoBox").classList.toggle("has-img", !!src);
    newsMode(true); $("#newsForm").scrollTop = 0;
  }
  function enregistrerNews() {
    const titre = $("#nTitre").value.trim();
    if (!titre) { $("#nErr").textContent = "Indiquez un titre."; $("#nErr").hidden = false; $("#nTitre").focus(); return; }
    let image = nEdit.image;
    if (nEdit.imgData) { image = `${CONFIG.imgDir}/actu-${slug(titre)}-${Date.now().toString(36)}.${nEdit.imgData.ext}`; S.images[image] = nEdit.imgData.data; }
    const a = { id: nEdit.id !== null ? nEdit.id : S.news.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1,
      titre, date: $("#nDate").value || today(), visible: $("#nVisible").checked, image,
      resume: $("#nResume").value.trim(), texte: $("#nTexte").value.trim() };
    const i = S.news.findIndex((x) => x.id === a.id);
    if (i >= 0) S.news[i] = a; else S.news.push(a);
    nEdit = null; newsListe(); newsMode(false); apresModif();
    toast("Actualité enregistrée. Pensez à publier.");
  }
  async function supprimerNews() {
    const a = S.news.find((x) => x.id === nEdit.id); if (!a) return;
    if (!(await ask("Supprimer cette actualité ?", `« ${a.titre} » sera retirée du site à la prochaine publication.`, "Supprimer"))) return;
    S.news = S.news.filter((x) => x.id !== a.id); nEdit = null; newsListe(); newsMode(false); apresModif();
  }

  /* ---------- panneau « Référencement Google » ---------- */
  function ouvrirSeo() {
    const det = adresseDetectee();
    $("#sAdresse").value = S.site.adresse || "";
    $("#sAdresse").placeholder = det || (SEO ? SEO.SITE_PAR_DEFAUT : "https://");
    $("#sAdresseHint").textContent = det
      ? `Laissez vide pour utiliser l'adresse actuelle : ${det}`
      : "Adresse complète du site, par exemple https://votre-compte.github.io/zentech/";
    $("#sGa").value = S.site.ga || "";
    $("#sGsc").value = S.site.gsc || "";
    $("#seoErr").hidden = true;
    majSeoLiens();
    $("#veil").hidden = false;
    $("#seoPanel").classList.add("on");
    $("#seoPanel").setAttribute("aria-hidden", "false");
    document.body.classList.add("lock");
  }
  function fermerSeo() {
    $("#seoPanel").classList.remove("on");
    $("#seoPanel").setAttribute("aria-hidden", "true");
    if (!edit) $("#veil").hidden = true;
    document.body.classList.remove("lock");
  }
  function majSeoLiens() {
    let a = $("#sAdresse").value.trim() || adresseDetectee() || (SEO ? SEO.SITE_PAR_DEFAUT : "");
    a = normSite({ adresse: a }).adresse;
    $("#sSitemap").textContent = a + "sitemap.xml";
    $("#sPages").textContent = S.produits.filter((p) => p.visible).length;
  }
  function enregistrerSeo() {
    const err = (m, el) => { const e = $("#seoErr"); e.textContent = m; e.hidden = false; if (el) el.focus(); };
    const a = $("#sAdresse").value.trim(), ga = $("#sGa").value.trim(), gsc = $("#sGsc").value.trim();
    if (a) { try { const u = new URL(/^https?:\/\//i.test(a) ? a : "https://" + a); if (!/\./.test(u.hostname)) throw 0; } catch (e) { return err("Adresse du site invalide. Exemple : https://votre-compte.github.io/zentech/", $("#sAdresse")); } }
    if (ga && !SEO.idGA(ga)) return err("ID Google Analytics invalide : il commence par G- (ex. G-AB12CD34EF).", $("#sGa"));
    if (gsc && !SEO.codeGSC(gsc)) return err("Code Search Console invalide : collez la balise donnée par Google, ou seulement le code qu'elle contient.", $("#sGsc"));
    S.site = normSite({ adresse: a, ga, gsc });
    fermerSeo();
    apresModif();
    toast(siteChange() ? "Réglages enregistrés. Publiez pour les mettre en ligne." : "Aucun changement.");
  }

  /* ---------- événements ---------- */
  function brancher() {
    // connexion
    $("#repoEdit").onclick = () => { $("#repoFields").hidden = false; $("#repoLine").hidden = true; $("#inOwner").focus(); };
    // champs secrets : masqués sans être des « mots de passe », pour que le navigateur
    // ne propose jamais de les enregistrer. La clé GitHub ne peut ni être affichée ni copiée.
    $$("input.secret").forEach((i) => {
      if (!masqueCss) i.type = "password";
      i.name = "z" + Math.random().toString(36).slice(2);   // pas d'historique de saisie
      ["copy", "cut", "dragstart"].forEach((ev) => i.addEventListener(ev, (e) => e.preventDefault()));
    });
    $$("[data-eye]").forEach((b) => (b.onclick = () => {
      const i = document.getElementById(b.dataset.eye);
      const show = masqueCss ? i.classList.contains("secret") : i.type === "password";
      if (masqueCss) i.classList.toggle("secret", !show); else i.type = show ? "text" : "password";
      b.querySelector("i").className = show ? "fas fa-eye-slash" : "fas fa-eye";
    }));
    $("#loginForm").onsubmit = async (e) => {
      e.preventDefault();
      const errBox = $("#loginErr"), btn = $("#loginBtn");
      const stop = (m, champ) => { errBox.textContent = m; errBox.hidden = false; if (champ) champ.focus(); };
      errBox.hidden = true;
      if (!$("#repoFields").hidden) {
        S.owner = $("#inOwner").value.trim().replace(/^https?:\/\/github\.com\//, "").replace(/\/.*$/, "");
        S.repo = $("#inRepo").value.trim().replace(/\.git$/, "");
      }
      const tok = $("#inToken").value.trim(), code = $("#inCode").value;
      if (!S.owner || !S.repo) return stop("Indiquez le compte GitHub et le nom du dépôt.");
      if (!tok) return stop("Collez votre clé d'accès GitHub.", $("#inToken"));
      const pb = codeFaible(code);
      if (pb) return stop(pb, $("#inCode"));
      if (code !== $("#inCode2").value) return stop("Les deux codes ne sont pas identiques.", $("#inCode2"));
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-circle-notch spin"></i> Connexion…';
      try {
        await connecter(tok, { code, local: $("#inRemember").checked });
      } catch (er) {
        S.token = "";
        stop(er.status === undefined ? er.message : messageErreur(er));
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-right-to-bracket"></i> Se connecter';
      }
    };

    // verrouillage
    $("#lockForm").onsubmit = async (e) => {
      e.preventDefault();
      const errBox = $("#lockErr"), btn = $("#unlockBtn"), code = $("#inUnlock").value;
      const stop = (m) => { errBox.textContent = m; errBox.hidden = false; $("#inUnlock").focus(); };
      errBox.hidden = true;
      if (modeVerrou === "choisir") {
        const pb = codeFaible(code) || (code !== $("#inUnlock2").value ? "Les deux codes ne sont pas identiques." : "");
        if (pb) return stop(pb);
      } else if (!code) return stop("Entrez votre code.");
      const avant = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-circle-notch spin"></i> Vérification…';
      try {
        if (modeVerrou === "choisir") { await connecter(S.ancien.token, { code, local: S.ancien.local }); return; }
        const tok = await ouvrirCoffre(code);
        if (!tok) {
          const n = (Number(keep.get(ESSAIS)) || 0) + 1, reste = MAX_ESSAIS - n;
          if (reste <= 0) {
            oublierCle();
            return retourConnexion("Trop d'essais incorrects. Pour votre sécurité, la clé a été retirée de cet appareil. Reconnectez-vous avec votre clé GitHub et choisissez un nouveau code.");
          }
          keep.set(ESSAIS, String(n));
          $("#inUnlock").value = "";
          return stop(`Code incorrect. Encore ${reste} essai${reste > 1 ? "s" : ""}, ensuite la clé sera retirée de cet appareil.`);
        }
        keep.del(ESSAIS);
        if (S.pret) { S.token = tok; deverrouiller(); }
        else await connecter(tok, null);
      } catch (er) {
        S.token = "";
        if (er.status === 0) stop(er.message);            // pas d'internet : la clé reste gardée
        else { oublierCle(); retourConnexion(er.status === undefined ? er.message : messageErreur(er)); }
      } finally {
        btn.disabled = false;
        if (!$("#lock").hidden) btn.innerHTML = avant;
      }
    };
    $("#lockForgot").onclick = () => { oublierCle(); retourConnexion(""); };
    $("#lockBtn").onclick = () => verrouiller(false);
    const bouge = () => { if (!verrouille) derniereActivite = Date.now(); };
    ["pointerdown", "keydown", "wheel", "touchstart", "input", "scroll"].forEach((ev) => document.addEventListener(ev, bouge, { passive: true, capture: true }));
    let dernierMvt = 0;
    document.addEventListener("mousemove", () => { const t = Date.now(); if (t - dernierMvt > 4000) { dernierMvt = t; bouge(); } }, { passive: true });
    setInterval(verifierVeille, 20000);
    document.addEventListener("visibilitychange", verifierVeille);

    // en-tête
    $("#themeBtn").onclick = () => {
      const h = document.documentElement, t = h.getAttribute("data-theme") === "light" ? "dark" : "light";
      h.setAttribute("data-theme", t);
      keep.set("zt-theme", t);
    };
    $("#logoutBtn").onclick = async () => {
      const n = nbChangements();
      const ok = await ask("Se déconnecter ?", n ? "Vos modifications non publiées restent enregistrées sur cet appareil." : "La clé sera retirée de cet appareil.", "Se déconnecter");
      if (!ok) return;
      oublierCle();
      S.pret = false;
      retourConnexion("");
    };

    // outils
    $("#addBtn").onclick = () => ouvrir(null);
    $("#q").oninput = (e) => { S.q = e.target.value.trim(); rendre(); };
    $("#catSel").onchange = (e) => { S.cat = e.target.value; rendre(); };
    $("#chips").onclick = (e) => {
      const c = e.target.closest(".chip");
      if (!c) return;
      $$(".chip").forEach((x) => x.classList.toggle("on", x === c));
      S.filtre = c.dataset.v;
      rendre();
    };

    // liste : stock rapide, visibilité, modifier, dupliquer
    $("#list").addEventListener("click", (e) => {
      const it = e.target.closest(".item");
      if (!it) return;
      const p = S.produits.find((x) => x.id === Number(it.dataset.id));
      const qb = e.target.closest("[data-q]"), act = e.target.closest("[data-act]");
      if (qb) {
        const d = Number(qb.dataset.q);
        if (p.qte === null) { if (d > 0) p.qte = 1; else return; }
        else p.qte = Math.max(0, p.qte + d);
        apresModif();
      } else if (act && act.dataset.act === "dup") ouvrir(p, true);
      else if (act || e.target.closest(".it-name, .thumb, .it-price")) ouvrir(p);
    });
    $("#list").addEventListener("change", (e) => {
      if (!e.target.matches("[data-vis]")) return;
      const p = S.produits.find((x) => x.id === Number(e.target.closest(".item").dataset.id));
      p.visible = e.target.checked;
      apresModif();
      toast(p.visible ? "Article visible sur le site (après publication)." : "Article caché du site (après publication).");
    });

    // publication
    $("#publishBtn").onclick = () => publier();
    $("#discardBtn").onclick = async () => {
      const ok = await ask("Annuler les modifications ?", "Toutes les modifications non publiées seront perdues.", "Tout annuler", "Garder");
      if (!ok) return;
      S.produits = clone(S.original);
      S.images = {};
      if (S.siteOriginal) S.site = clone(S.siteOriginal);
      S.news = clone(S.newsOriginal);
      keep.del(draftKey());
      rendre();
    };

    // actualités
    $("#newsBtn").onclick = ouvrirNews;
    $("#newsClose").onclick = fermerNews;
    $("#newsAdd").onclick = () => editerNews(null);
    $("#newsItems").onclick = (e) => { const it = e.target.closest(".news-it"); if (it) editerNews(S.news.find((a) => String(a.id) === it.dataset.id)); };
    $("#nCancel").onclick = () => { if (nEdit) { nEdit = null; newsMode(false); } else fermerNews(); };
    $("#nSave").onclick = enregistrerNews;
    $("#nDelete").onclick = supprimerNews;
    $("#newsForm").onsubmit = (e) => { e.preventDefault(); enregistrerNews(); };
    $("#nPhotoBox").onclick = () => $("#nFile").click();
    $("#nFile").onchange = async (e) => {
      const f = e.target.files[0]; e.target.value = ""; if (!f || !nEdit) return;
      try { nEdit.imgData = await lirePhoto(f); $("#nImg").src = nEdit.imgData.data; $("#nPhotoBox").classList.add("has-img"); }
      catch (er) { toast(er.message, 4000); }
    };
    // référencement
    $("#seoBtn").onclick = ouvrirSeo;
    $("#seoClose").onclick = $("#seoCancel").onclick = fermerSeo;
    $("#seoSave").onclick = enregistrerSeo;
    $("#seoForm").onsubmit = (e) => { e.preventDefault(); enregistrerSeo(); };
    $("#sAdresse").oninput = majSeoLiens;
    $("#sCopy").onclick = async () => {
      try { await navigator.clipboard.writeText($("#sSitemap").textContent); toast("Adresse copiée."); }
      catch (e) { toast("Copie impossible : sélectionnez l'adresse à la main."); }
    };

    // fiche article
    $("#edClose").onclick = $("#edCancel").onclick = fermer;
    $("#veil").onclick = () => { if ($("#seoPanel").classList.contains("on")) fermerSeo(); else if ($("#newsPanel").classList.contains("on")) fermerNews(); else fermer(); };
    ["#fNom", "#fDesc", "#fQte", "#fCat"].forEach((id) => $(id).addEventListener("input", majApercu));
    $("#edSave").onclick = enregistrer;
    $("#edDelete").onclick = supprimer;
    $("#edForm").onsubmit = (e) => { e.preventDefault(); enregistrer(); };
    $("#specAdd").onclick = () => ajouterSpec("", "").querySelector(".sk").focus();
    $("#fPrix").oninput = () => { majPromo(); majApercu(); };
    $("#fAncien").oninput = majPromo;
    $$(".qty [data-d]").forEach((b) => (b.onclick = () => {
      const i = $("#fQte"), v = i.value === "" ? 0 : Number(i.value);
      i.value = Math.max(0, v + Number(b.dataset.d));
    }));
    const choisir = () => $("#edFile").click();
    $("#photoBox").onclick = choisir;
    $("#photoBtn").onclick = choisir;
    $("#edFile").onchange = async (e) => {
      const f = e.target.files[0];
      e.target.value = "";
      if (!f || !edit) return;
      try {
        edit.imgData = await lirePhoto(f);
        montrerPhoto(edit.imgData.data);
      } catch (er) {
        toast(er.message, 4000);
      }
    };

    // photo introuvable dans la liste : icône à la place (sans code dans la page)
    document.addEventListener("error", (e) => {
      const t = e.target;
      if (t && t.tagName === "IMG" && t.closest(".thumb")) t.replaceWith(Object.assign(document.createElement("i"), { className: "fas fa-image" }));
    }, true);

    // clavier, fermeture de la page
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape" || !$("#lock").hidden) return;
      if (!$("#dialog").hidden) $("#dlgNo").click();
      else if ($("#seoPanel").classList.contains("on")) fermerSeo();
      else if ($("#newsPanel").classList.contains("on")) { if (nEdit) { nEdit = null; newsMode(false); } else fermerNews(); }
      else if (edit) fermer();
    });
    window.addEventListener("beforeunload", (e) => {
      if (S.token && nbChangements()) { e.preventDefault(); e.returnValue = ""; }
    });
  }

  /* ---------- démarrage ---------- */
  async function demarrer() {
    brancher();
    chargerReglages();
    if (!S.owner || !S.repo) return;
    // clé chiffrée : on demande le code
    if (coffre()) return montrerVerrou("ouvrir");
    // ancienne version : la clé était gardée en clair. On la protège tout de suite.
    const ancienne = keep.get("zt-admin-cle", true) || keep.get("zt-admin-cle");
    if (ancienne) {
      S.ancien = { token: ancienne, local: !!keep.get("zt-admin-cle") };
      montrerVerrou("choisir");
    }
  }
  demarrer();
})();
