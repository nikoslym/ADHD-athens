/* ============================================================
   ADHD ATHENS - Focus Mode interaction layer
   Calm, purposeful motion. Nothing demands attention.
   ============================================================ */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Language toggle (EN / ΕΛ) ---------- */
  var root = document.documentElement;

  // Carry the language through internal links so it persists even when the
  // site is opened from the filesystem (file://), where localStorage is not
  // shared between pages.
  function syncLinks(lang) {
    document.querySelectorAll("a[href]").forEach(function (a) {
      var href = a.getAttribute("href");
      if (!href || /^(https?:|mailto:|tel:|#)/.test(href)) return;
      var hashSplit = href.split("#");
      var base = hashSplit[0].split("?")[0];
      if (!base) return;
      a.setAttribute("href", base + "?lang=" + lang + (hashSplit[1] ? "#" + hashSplit[1] : ""));
    });
  }

  /* Equalize team-card heights when laid out in a multi-column grid */
  function equalizeTeamCards() {
    document.querySelectorAll(".team-grid").forEach(function (grid) {
      var cards = grid.querySelectorAll(".team-card");
      if (!cards.length) return;
      var multiColumn = window.getComputedStyle(grid).gridTemplateColumns.split(" ").length > 1;
      var max = 0;
      cards.forEach(function (c) {
        c.style.minHeight = "";
        max = Math.max(max, c.offsetHeight);
      });
      if (multiColumn) {
        cards.forEach(function (c) { c.style.minHeight = max + "px"; });
      }
    });
  }

  function setLang(lang) {
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang);
    try { localStorage.setItem("adhd-athens-lang", lang); } catch (e) {}
    document.querySelectorAll(".lang-toggle button").forEach(function (btn) {
      var isActive = btn.dataset.lang === lang;
      btn.setAttribute("aria-pressed", String(isActive));
      if (btn.dataset.lang === "en") btn.setAttribute("aria-label", "English");
      else if (btn.dataset.lang === "el") btn.setAttribute("aria-label", "Ελληνικά");
    });
    var langGroup = document.querySelector(".lang-toggle");
    if (langGroup) {
      langGroup.setAttribute("aria-label", lang === "el" ? "Γλώσσα" : "Language");
    }
    // <option> elements can't be hidden via CSS in all browsers
    document.querySelectorAll("option[data-en]").forEach(function (opt) {
      opt.textContent = lang === "el" ? opt.dataset.el : opt.dataset.en;
    });
    syncLinks(lang);
    equalizeTeamCards();
  }

  var savedLang = "en";
  try { savedLang = localStorage.getItem("adhd-athens-lang") || "en"; } catch (e) {}
  var urlLang = new URLSearchParams(window.location.search).get("lang");
  if (urlLang === "el" || urlLang === "en") savedLang = urlLang;
  setLang(savedLang);

  document.querySelectorAll(".lang-toggle button").forEach(function (btn) {
    btn.addEventListener("click", function () { setLang(btn.dataset.lang); });
  });

  /* ---------- Header state + scroll progress ---------- */
  var header = document.querySelector(".site-header");
  var progress = document.querySelector(".scroll-progress");
  function onScroll() {
    var y = window.scrollY;
    var heroPage = document.querySelector("main > .hero:first-child");
    if (header) header.classList.toggle("scrolled", !!heroPage || y > 10);
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var burger = document.querySelector(".nav-burger");
  var mainNav = document.querySelector(".main-nav");
  if (burger && header && mainNav) {
    if (!mainNav.id) mainNav.id = "primary-nav";
    burger.setAttribute("aria-controls", mainNav.id);

    function menuFocusables() {
      return Array.prototype.slice.call(
        header.querySelectorAll(
          ".nav-burger, .main-nav a, .lang-toggle button"
        )
      ).filter(function (el) {
        return !el.disabled && el.offsetParent !== null;
      });
    }

    function setMenuOpen(open) {
      header.classList.toggle("menu-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute(
        "aria-label",
        open ? "Close menu" : "Menu"
      );
      document.body.style.overflow = open ? "hidden" : "";
      if (open) {
        var firstLink = mainNav.querySelector("a");
        if (firstLink) firstLink.focus();
      } else {
        burger.focus();
      }
    }

    burger.addEventListener("click", function () {
      setMenuOpen(!header.classList.contains("menu-open"));
    });

    document.querySelectorAll(".main-nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        if (header.classList.contains("menu-open")) setMenuOpen(false);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (!header.classList.contains("menu-open")) return;
      if (e.key === "Escape") {
        e.preventDefault();
        setMenuOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      var items = menuFocusables();
      if (items.length < 2) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  /* ---------- Reveal-on-scroll (fade-up, staggered) ---------- */
  var revealEls = document.querySelectorAll(".reveal, .draw-path, .journey");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---------- SVG line-draw setup (normalize dash to path length) ---------- */
  document.querySelectorAll(".draw-path").forEach(function (svg) {
    svg.querySelectorAll("path, circle, ellipse").forEach(function (shape) {
      try {
        var len = shape.getTotalLength ? shape.getTotalLength() : 0;
        if (len) {
          shape.style.strokeDasharray = len;
          shape.style.strokeDashoffset = len;
          // re-trigger transition once in view
          var check = function () {
            if (svg.classList.contains("in-view")) shape.style.strokeDashoffset = 0;
            else requestAnimationFrame(check);
          };
          requestAnimationFrame(check);
        }
      } catch (e) {}
    });
  });

  /* ---------- Count-up statistics ---------- */
  function animateCount(el) {
    var target = parseFloat(el.dataset.count);
    var decimals = (el.dataset.count.split(".")[1] || "").length;
    var prefix = el.dataset.prefix || "";
    var suffix = el.dataset.suffix || "";
    if (prefersReducedMotion) {
      el.textContent = prefix + target.toFixed(decimals) + suffix;
      return;
    }
    var duration = 1800;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-list").forEach(function (list, listIndex) {
    list.querySelectorAll(".faq-item").forEach(function (item, i) {
      var btn = item.querySelector(".faq-q");
      var panel = item.querySelector(".faq-a");
      if (!btn || !panel) return;
      var id = "faq-panel-" + listIndex + "-" + i;
      panel.id = id;
      btn.setAttribute("type", "button");
      btn.setAttribute("aria-controls", id);
      var open = item.classList.contains("open");
      btn.setAttribute("aria-expanded", String(open));
      if (open) panel.removeAttribute("inert");
      else panel.setAttribute("inert", "");

      btn.addEventListener("click", function () {
        var isOpen = item.classList.contains("open");
        list.querySelectorAll(".faq-item.open").forEach(function (other) {
          if (other === item) return;
          other.classList.remove("open");
          var ob = other.querySelector(".faq-q");
          var op = other.querySelector(".faq-a");
          if (ob) ob.setAttribute("aria-expanded", "false");
          if (op) op.setAttribute("inert", "");
        });
        item.classList.toggle("open", !isOpen);
        btn.setAttribute("aria-expanded", String(!isOpen));
        if (!isOpen) panel.removeAttribute("inert");
        else panel.setAttribute("inert", "");
      });
    });
  });

  /* ---------- Mini-step expand (coaching) ---------- */
  document.querySelectorAll(".mini-step-header").forEach(function (btn, i) {
    var step = btn.closest(".mini-step");
    var details = step && step.querySelector(".mini-step-details");
    if (!details) return;
    var id = "mini-step-panel-" + i;
    details.id = id;
    btn.setAttribute("type", "button");
    btn.setAttribute("aria-controls", id);
    var open = step.classList.contains("open");
    btn.setAttribute("aria-expanded", String(open));
    details.setAttribute("aria-hidden", String(!open));
    if (open) details.removeAttribute("inert");
    else details.setAttribute("inert", "");

    btn.addEventListener("click", function () {
      var isOpen = step.classList.contains("open");
      step.classList.toggle("open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
      details.setAttribute("aria-hidden", String(isOpen));
      if (!isOpen) details.removeAttribute("inert");
      else details.setAttribute("inert", "");
    });
  });

  /* ---------- Carousel helper (testimonials + gallery) ---------- */
  function initCarousel(wrap, opts) {
    if (!wrap) return;
    var track = wrap.querySelector(opts.track);
    var slides = wrap.querySelectorAll(opts.slide);
    var dotsWrap = wrap.querySelector(opts.dots);
    var prevBtn = wrap.querySelector(opts.prev);
    var nextBtn = wrap.querySelector(opts.next);
    if (!track || !slides.length || !dotsWrap || !prevBtn || !nextBtn) return;
    var idx = 0;
    var label = opts.label || "Slide";

    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.className = "t-dot";
      dot.type = "button";
      dot.setAttribute("aria-label", label + " " + (i + 1));
      dot.addEventListener("click", function () { go(i); });
      dotsWrap.appendChild(dot);
    });

    var dots = dotsWrap.querySelectorAll(".t-dot");

    function go(i) {
      idx = (i + slides.length) % slides.length;
      track.style.transform = "translateX(-" + idx * 100 + "%)";
      dots.forEach(function (d, di) {
        d.setAttribute("aria-current", String(di === idx));
      });
      slides.forEach(function (s, si) {
        s.setAttribute("aria-hidden", String(si !== idx));
      });
    }

    prevBtn.addEventListener("click", function () { go(idx - 1); });
    nextBtn.addEventListener("click", function () { go(idx + 1); });

    // gentle auto-advance, paused on hover/focus (calm, not demanding)
    var timer = null;
    function startAuto() {
      if (prefersReducedMotion) return;
      stopAuto();
      timer = setInterval(function () { go(idx + 1); }, opts.interval || 8000);
    }
    function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }
    wrap.addEventListener("mouseenter", stopAuto);
    wrap.addEventListener("mouseleave", startAuto);
    wrap.addEventListener("focusin", stopAuto);
    wrap.addEventListener("focusout", startAuto);
    go(0);
    startAuto();
  }

  initCarousel(document.querySelector(".testimonials-wrap"), {
    track: ".testimonial-track",
    slide: ".testimonial",
    dots: ".t-dots",
    prev: ".t-prev",
    next: ".t-next",
    label: "Testimonial",
    interval: 8000
  });

  initCarousel(document.querySelector(".gallery-wrap"), {
    track: ".gallery-track",
    slide: ".gallery-slide",
    dots: ".g-dots",
    prev: ".g-prev",
    next: ".g-next",
    label: "Photo",
    interval: 6000
  });

  /* ---------- Scrollspy (sticky nav + side nav orientation) ---------- */
  function scrollSpy(linkSelector) {
    var links = Array.prototype.slice.call(document.querySelectorAll(linkSelector));
    var targets = links
      .map(function (a) {
        var href = a.getAttribute("href");
        if (href && href.charAt(0) === "#") {
          var t = document.querySelector(href);
          return t ? { link: a, el: t } : null;
        }
        return null;
      })
      .filter(Boolean);
    if (!targets.length) return;

    function update() {
      var pos = window.scrollY + window.innerHeight * 0.32;
      var current = null;
      targets.forEach(function (t) {
        if (t.el.offsetTop <= pos) current = t;
      });
      links.forEach(function (a) { a.classList.remove("active"); });
      if (current) current.link.classList.add("active");
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
  }
  scrollSpy(".side-nav a");
  scrollSpy(".main-nav a[href^='#']");

  /* ---------- Subtle hero parallax (decorative, light) ---------- */
  var heroVisual = document.querySelector(".hero-visual .photo-card");
  var heroOrbits = document.querySelector(".hero-orbits");
  if (!prefersReducedMotion && (heroVisual || heroOrbits)) {
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      if (y < 900) {
        if (heroVisual) heroVisual.style.transform = "rotate(1.5deg) translateY(" + y * 0.04 + "px)";
        if (heroOrbits) heroOrbits.style.transform = "translateY(" + y * -0.06 + "px)";
      }
    }, { passive: true });
  }

  /* ---------- Team card height equalization ---------- */
  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(equalizeTeamCards, 150);
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(equalizeTeamCards);
  }
  window.addEventListener("load", equalizeTeamCards);

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Booking form → Formspree ---------- */
  var bookingForm = document.getElementById("booking-form");
  if (bookingForm) {
    var statusEl = document.getElementById("booking-status");
    var submitBtn = document.getElementById("booking-submit");

    function showStatus(kind, en, el) {
      if (!statusEl) return;
      statusEl.hidden = false;
      statusEl.className = "form-status is-" + kind;
      statusEl.setAttribute("role", kind === "error" ? "alert" : "status");
      statusEl.setAttribute("tabindex", "-1");
      statusEl.innerHTML =
        '<span class="en">' + en + "</span>" +
        '<span class="el">' + el + "</span>";
      statusEl.focus();
    }

    bookingForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var endpoint = bookingForm.getAttribute("action") || "";
      if (endpoint.indexOf("YOUR_FORM_ID") !== -1 || !endpoint) {
        showStatus(
          "error",
          "The booking form is not connected yet. Please email info@adhd-athens.com.",
          "Η φόρμα δεν είναι ακόμα συνδεδεμένη. Στείλτε email στο info@adhd-athens.com."
        );
        return;
      }

      bookingForm.classList.add("is-sending");
      bookingForm.setAttribute("aria-busy", "true");
      if (submitBtn) submitBtn.disabled = true;
      if (statusEl) statusEl.hidden = true;

      var data = new FormData(bookingForm);
      var contact = (data.get("contact") || "").toString().trim();
      if (contact.indexOf("@") !== -1) data.set("_replyto", contact);

      fetch(endpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (res.ok) {
            bookingForm.reset();
            showStatus(
              "success",
              "Thank you — your request was sent. We’ll get back to you shortly.",
              "Ευχαριστούμε — το αίτημά σας στάλθηκε. Θα επικοινωνήσουμε σύντομα μαζί σας."
            );
            return;
          }
          return res.json().then(function (body) {
            var msg = (body && body.error) || "";
            throw new Error(msg || "Request failed");
          }).catch(function () {
            throw new Error("Request failed");
          });
        })
        .catch(function () {
          showStatus(
            "error",
            "Something went wrong. Please try again or email info@adhd-athens.com.",
            "Κάτι πήγε στραβά. Δοκιμάστε ξανά ή στείλτε email στο info@adhd-athens.com."
          );
        })
        .finally(function () {
          bookingForm.classList.remove("is-sending");
          bookingForm.removeAttribute("aria-busy");
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }
})();