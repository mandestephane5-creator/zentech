// ===== ZENTECH : application installable (PWA) =====
// Enregistre le service worker et affiche la bannière « Installer ZenTech ».
(function () {
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('service-worker.js').catch(function () {});
    });
  }

  var deferred = null;
  var banner = document.getElementById('pwaBanner');
  var btnInstall = document.getElementById('pwaInstallBtn');
  var btnClose = document.getElementById('pwaCloseBtn');
  var dejaRefuse = false;
  try { dejaRefuse = localStorage.getItem('zt-pwa-refus') === '1'; } catch (e) {}

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    if (banner && !dejaRefuse) setTimeout(function () { banner.classList.remove('hidden'); }, 6000);
  });

  if (btnInstall) btnInstall.addEventListener('click', function () {
    if (!deferred) return;
    deferred.prompt();
    deferred.userChoice.finally(function () {
      deferred = null;
      if (banner) banner.classList.add('hidden');
    });
  });

  if (btnClose) btnClose.addEventListener('click', function () {
    if (banner) banner.classList.add('hidden');
    try { localStorage.setItem('zt-pwa-refus', '1'); } catch (e) {}
  });

  window.addEventListener('appinstalled', function () {
    if (banner) banner.classList.add('hidden');
  });
})();
