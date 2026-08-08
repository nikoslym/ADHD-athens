/* Minimal cookie consent for Google Analytics (Consent Mode). */
(function () {
  "use strict";

  var KEY = "adhd-athens-cookie-consent";
  var choice = null;
  var previouslyFocused = null;
  try { choice = localStorage.getItem(KEY); } catch (e) {}

  function updateConsent(granted) {
    if (typeof gtag !== "function") return;
    gtag("consent", "update", {
      analytics_storage: granted ? "granted" : "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
  }

  function save(value) {
    try { localStorage.setItem(KEY, value); } catch (e) {}
    updateConsent(value === "granted");
    var el = document.getElementById("cookie-consent");
    if (el) el.remove();
    if (previouslyFocused && typeof previouslyFocused.focus === "function") {
      try { previouslyFocused.focus(); } catch (e) {}
    }
  }

  if (choice === "granted") {
    updateConsent(true);
    return;
  }
  if (choice === "denied") {
    updateConsent(false);
    return;
  }

  function showBanner() {
    if (document.getElementById("cookie-consent")) return;

    previouslyFocused = document.activeElement;

    var bar = document.createElement("div");
    bar.id = "cookie-consent";
    bar.className = "cookie-consent";
    bar.setAttribute("role", "dialog");
    bar.setAttribute("aria-modal", "false");
    bar.setAttribute("aria-labelledby", "cookie-consent-text");
    bar.innerHTML =
      '<div class="cookie-consent-inner">' +
        '<p class="cookie-consent-text" id="cookie-consent-text">' +
          '<span class="en">We use cookies for anonymous analytics (Google Analytics) to improve this site.</span>' +
          '<span class="el">Χρησιμοποιούμε cookies για ανώνυμα στατιστικά (Google Analytics) ώστε να βελτιώνουμε τον ιστότοπο.</span>' +
        "</p>" +
        '<div class="cookie-consent-actions">' +
          '<button type="button" class="btn btn-ghost btn-s" data-consent="denied">' +
            '<span class="en">Decline</span><span class="el">Απόρριψη</span>' +
          "</button>" +
          '<button type="button" class="btn btn-primary btn-s" data-consent="granted">' +
            '<span class="en">Accept</span><span class="el">Αποδοχή</span>' +
          "</button>" +
        "</div>" +
      "</div>";

    document.body.appendChild(bar);

    bar.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-consent]");
      if (!btn) return;
      save(btn.getAttribute("data-consent"));
    });

    document.addEventListener("keydown", function onKey(e) {
      if (!document.getElementById("cookie-consent")) {
        document.removeEventListener("keydown", onKey);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        save("denied");
        document.removeEventListener("keydown", onKey);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showBanner);
  } else {
    showBanner();
  }
})();
