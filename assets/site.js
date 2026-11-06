/* dr. Fitri Ramanda Prawita — one-page portfolio interactions (no dependencies besides Lenis). */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- smooth scroll (Lenis) ---- */
  var lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: { offset: -88 }, autoRaf: true });
    window.__lenis = lenis;
  }
  var scrollToEl = function (el) { if (!el) return; lenis ? lenis.scrollTo(el, { offset: -88 }) : el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); };

  /* ---- split headings into words ---- */
  $$("[data-split]").forEach(function (el) {
    var i = 0;
    var walk = function (node) {
      [].slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parts = n.textContent.split(/(\s+)/), frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            var w = document.createElement("span"); w.className = "w"; w.style.setProperty("--i", i++); w.textContent = p; frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && !n.classList.contains("tw")) { walk(n); }
      });
    };
    walk(el);
  });

  /* ---- long paragraph fills word by word while scrolling ---- */
  var fills = $$("[data-fill]");
  fills.forEach(function (el) {
    el.innerHTML = el.textContent.trim().split(/\s+/).map(function (w) { return '<span class="fw">' + w + "</span>"; }).join(" ");
  });
  var fillTick = function () {
    fills.forEach(function (el) {
      var r = el.getBoundingClientRect(), vh = innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      var words = el.children, n = Math.round(p * words.length);
      for (var k = 0; k < words.length; k++) words[k].classList.toggle("on", k < n);
    });
  };

  /* ---- reveal on enter ---- */
  var revealAll = function () { $$("[data-split],[data-reveal]").forEach(function (el) { el.classList.add("in"); }); };
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
    $$("[data-split],[data-reveal]").forEach(function (el) { io.observe(el); });
    $$("[data-stagger]").forEach(function (box) { $$("[data-reveal]", box).forEach(function (c, k) { c.style.setProperty("--i", k % 4); }); });
  } else { revealAll(); fills.forEach(function (el) { $$(".fw", el).forEach(function (w) { w.classList.add("on"); }); }); }

  /* ---- hero: typing loop on "Ramanda Prawita" ---- */
  var typed = $(".hero-title .ht-2");
  if (typed && !reduce) {
    var word = typed.textContent.trim();
    typed.innerHTML = '<span class="tw"><span class="tw-ghost">' + word + '</span><span class="tw-live"><span class="tw-text"></span><span class="tw-caret"></span></span></span>';
    var out = $(".tw-text", typed), i = 0, dir = 1;
    var tick = function () {
      if (document.hidden) return setTimeout(tick, 600);
      i += dir; out.textContent = word.slice(0, i);
      var wait = dir > 0 ? 95 : 45;
      if (i >= word.length) { dir = -1; wait = 2600; } else if (i <= 0) { dir = 1; wait = 500; }
      setTimeout(tick, wait);
    };
    setTimeout(tick, 900);
  }

  /* ---- counters ---- */
  var counters = $$("[data-count]");
  var runCount = function (el) {
    var to = parseFloat(el.dataset.count), suffix = el.dataset.suffix || "", t0 = performance.now(), dur = 1600;
    if (reduce) { el.textContent = to + suffix; return; }
    (function f(now) {
      var t = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.round(to * e) + suffix;
      if (t < 1) requestAnimationFrame(f);
    })(t0);
  };
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { c.textContent = "0" + (c.dataset.suffix || ""); cio.observe(c); });
  }

  /* ---- quote photo parallax ---- */
  var qImg = $(".quote-card > img");
  var parallax = function () {
    if (!qImg || reduce) return;
    var r = qImg.parentNode.getBoundingClientRect(), vh = innerHeight;
    if (r.bottom < 0 || r.top > vh) return;
    var p = (r.top + r.height / 2 - vh / 2) / (vh + r.height);
    qImg.style.transform = "translate3d(0," + (p * -12 - 6) + "%,0)";
  };

  /* ---- navbar: solid after the hero, hides on scroll down; full-screen menu ---- */
  var root = document.documentElement, nav = $(".nav"), lastY = 0;
  var panel = $("#menuPanel"), menuBtn = $(".menu-btn"), label = $(".menu-label");
  if (!menuBtn) menuBtn = null;
  var isOpen = function () { return root.classList.contains("menu-open"); };
  var setMenu = function (open) {
    root.classList.toggle("menu-open", open);
    if (panel) { if (open) panel.hidden = false; panel.setAttribute("aria-hidden", String(!open)); }
    if (menuBtn) { menuBtn.setAttribute("aria-expanded", String(open)); label.textContent = open ? "Close" : "Menu"; }
    if (lenis) open ? lenis.stop() : lenis.start();
    if (open) { var f = $(".menu-links a", panel); if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 200); }
  };
  if (menuBtn) menuBtn.addEventListener("click", function () { setMenu(!isOpen()); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && isOpen()) { setMenu(false); if (menuBtn) menuBtn.focus(); } });
  var navTick = function () {
    var y = window.scrollY, heroH = ($(".hero") || {}).offsetHeight || 600;
    if (!nav) return;
    nav.classList.toggle("hide", y > lastY && y > 120 && !isOpen());
    lastY = y;
  };
  var links = $$(".menu-links a[href^='#']");
  if ("IntersectionObserver" in window) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(function (a) { var s = $(a.getAttribute("href")); if (s) sio.observe(s); });
  }
  $$("a[href^='#']").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var t = $(a.getAttribute("href")); if (!t) return;
      e.preventDefault();
      if (isOpen()) setMenu(false);
      scrollToEl(t);
    });
  });

  /* ---- theme toggle: dark <-> warm ivory, remembered ---- */
  var themeBtn = $(".theme-toggle");
  var syncThemeBtn = function () {
    if (!themeBtn) return;
    var light = root.dataset.theme === "light";
    themeBtn.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
  };
  syncThemeBtn();
  if (themeBtn) themeBtn.addEventListener("click", function () {
    var light = root.dataset.theme !== "light";
    root.classList.add("theme-anim");
    if (light) root.dataset.theme = "light"; else delete root.dataset.theme;
    try { localStorage.setItem("theme", light ? "light" : "dark"); } catch (e) {}
    syncThemeBtn();
    document.dispatchEvent(new CustomEvent("themechange", { detail: { light: light } }));
    setTimeout(function () { root.classList.remove("theme-anim"); }, 500);
  });

  /* one scroll loop for everything scroll-linked */
  var frame = 0;
  var onScroll = function () { if (frame) return; frame = requestAnimationFrame(function () { frame = 0; fillTick(); parallax(); navTick(); }); };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* ---- FAQ accordion ---- */
  $$(".faq-item").forEach(function (item) {
    var q = $(".faq-q", item);
    q.addEventListener("click", function () {
      var open = !item.classList.contains("open");
      $$(".faq-item.open").forEach(function (o) { if (o !== item) { o.classList.remove("open"); $(".faq-q", o).setAttribute("aria-expanded", "false"); } });
      item.classList.toggle("open", open); q.setAttribute("aria-expanded", open);
    });
  });

  /* ---- training list: show more ---- */
  var list = $("#trainList"), more = $("#trainMore");
  if (list && more) more.addEventListener("click", function () {
    var open = list.classList.toggle("show-all");
    more.setAttribute("aria-expanded", open);
    $(".label", more).textContent = open ? "Show less" : "View more training (" + $$(".is-extra", list).length + ")";
  });

  /* ---- booking form: composes an email ---- */
  var form = $("#bookForm");
  if (form) {
    var fName = $("#fName"), fDate = $("#fDate"), fTime = $("#fTime"), fNote = $("#fNote"), help = $("#bookHelp"), count = $("#noteCount");
    var d = new Date(); fDate.min = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    var dateText = function (v) { return v ? new Date(v + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : ""; };
    var purpose = function () { var r = form.querySelector('input[name="jenis"]:checked'); return r ? r.value : "a general consultation"; };
    var message = function () {
      var n = fName.value.trim();
      var lines = ["Hello dr. Fitri, my name is " + (n || "[your name]") + "."];
      var when = (fDate.value ? " on " + dateText(fDate.value) : "") + (fTime.value ? (fDate.value ? ", in the " : " in the ") + fTime.value : "");
      lines.push("I would like to book an appointment for " + purpose() + when + ".");
      if (fNote.value.trim()) lines.push("Complaint: " + fNote.value.trim());
      lines.push("Thank you.");
      return lines.join("\n");
    };
    fNote.addEventListener("input", function () { count.textContent = fNote.value.length + "/300"; });
    fName.addEventListener("input", function () { if (fName.value.trim()) { fName.removeAttribute("aria-invalid"); help.textContent = ""; } });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!fName.value.trim()) { fName.setAttribute("aria-invalid", "true"); help.textContent = "Please enter your name so dr. Fitri knows who is getting in touch."; fName.focus(); return; }
      if (fDate.value && fDate.value < fDate.min) { help.textContent = "That date has passed. Please choose today or a later date."; fDate.focus(); return; }
      help.textContent = "Opening your email app…";
      var subj = "Consultation appointment - " + fName.value.trim();
      window.location.href = "mailto:" + form.dataset.email + "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(message());
    });
  }

  /* footer year */
  var yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();
})();
