/* ============================================
   Cookie Consent — ISO 27701 Compliant
   Blocks GA/GTM until explicit user consent
   ============================================ */
(function () {
  var CONSENT_KEY = 'ais_cookie_consent';
  var GA_ID = 'G-CVF4MDVKJS';

  function hasConsent() {
    try { return localStorage.getItem(CONSENT_KEY) === 'accepted'; } catch (e) { return false; }
  }

  function hasDeclined() {
    try { return localStorage.getItem(CONSENT_KEY) === 'declined'; } catch (e) { return false; }
  }

  function loadGA() {
    if (document.getElementById('ga-script')) return;
    var s = document.createElement('script');
    s.id = 'ga-script';
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  }

  function showBanner() {
    if (document.getElementById('cookie-consent-banner')) return;
    var banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML =
      '<div class="cc-inner">' +
        '<p class="cc-text">We use cookies and analytics to improve your experience. By clicking "Accept," you consent to our use of cookies for analytics purposes. See our <a href="/terms#privacy-policy">Privacy Policy</a> for details.</p>' +
        '<div class="cc-actions">' +
          '<button id="cc-decline" class="cc-btn cc-btn-decline">Decline</button>' +
          '<button id="cc-accept" class="cc-btn cc-btn-accept">Accept</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(banner);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        banner.classList.add('cc-visible');
      });
    });

    document.getElementById('cc-accept').addEventListener('click', function () {
      try { localStorage.setItem(CONSENT_KEY, 'accepted'); } catch (e) {}
      loadGA();
      closeBanner();
    });

    document.getElementById('cc-decline').addEventListener('click', function () {
      try { localStorage.setItem(CONSENT_KEY, 'declined'); } catch (e) {}
      closeBanner();
    });
  }

  function closeBanner() {
    var banner = document.getElementById('cookie-consent-banner');
    if (banner) {
      banner.classList.remove('cc-visible');
      setTimeout(function () { banner.remove(); }, 400);
    }
  }

  // On load: either load GA (if consented) or show banner
  if (hasConsent()) {
    loadGA();
  } else if (!hasDeclined()) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showBanner);
    } else {
      showBanner();
    }
  }
})();
