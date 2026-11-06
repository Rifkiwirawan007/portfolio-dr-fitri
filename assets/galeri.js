/* Gallery page: full-screen slider where the next card grows into the background, plus a grid of the whole collection. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var root = document.documentElement;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var GATHER = "Conjioo Hotel, Maluk · 27 Feb 2025";
  var MALUK = "Maluk, West Sumbawa";

  var slides = [
    { n: 6,  pos: "30% 50%", kicker: "Customer Gathering 2025", title: "MCU Talk", desc: "Presenting the background of medical check-ups to the clinic’s partner companies.", meta: GATHER },
    { n: 7,  pos: "50% 45%", kicker: "Customer Gathering 2025", title: "Questions from the Floor", desc: "Partner companies and their workers joining the discussion after the talk.", meta: GATHER },
    { n: 10, pos: "50% 45%", kicker: "Customer Gathering 2025", title: "Growing Together", desc: "Sustaining Partnership, We Grow Together: the full group after the session.", meta: GATHER },
    { n: 8,  pos: "50% 45%", kicker: "Customer Gathering 2025", title: "The Cakra Medika Team", desc: "The clinic team in front of the gathering banner.", meta: GATHER },
    { n: 9,  pos: "50% 40%", kicker: "Customer Gathering 2025", title: "With Our Partners", desc: "With colleagues and partner representatives at the gathering.", meta: GATHER },
    { n: 2,  pos: "45% 40%", kicker: "Klinik Utama Cakra Medika", title: "Patient Consultation", desc: "Walking a patient through the consent form before his examination.", meta: MALUK },
    { n: 4,  pos: "45% 40%", kicker: "Klinik Utama Cakra Medika", title: "Clear Answers", desc: "Explaining every step, so patients know exactly what to expect.", meta: MALUK },
    { n: 5,  pos: "50% 40%", kicker: "Klinik Utama Cakra Medika", title: "Doctors & Staff", desc: "dr. Fitri with the doctors and staff of the clinic.", meta: MALUK },
    { n: 3,  pos: "50% 40%", kicker: "Klinik Utama Cakra Medika", title: "Team Meeting", desc: "Planning together with the clinic team, outdoors in Maluk.", meta: MALUK },
    { n: 11, pos: "50% 55%", kicker: "Accreditation Survey", title: "Accreditation", desc: "The team of Klinik Utama Cakra Medika Maluk during the survey by the KAKP accreditation surveyors.", meta: MALUK },
    { n: 12, pos: "50% 30%", kicker: "Accreditation Survey", title: "On Duty", desc: "Accompanying the surveyor through the clinic during the accreditation visit.", meta: MALUK },
    { n: 1,  pos: "50% 30%", kicker: "Cardiology Training", title: "Exercise Stress Test", desc: "At the Exercise Stress Test for Medics and Paramedics workshop.", meta: "Workshop" },
    { n: 19, pos: "50% 55%", kicker: "Cardiology Training", title: "Workshop Class", desc: "Participants of the Exercise Stress Test for Medics and Paramedics workshop.", meta: "InaPRevent · Bandung, 16 May 2025" },
    { n: 18, pos: "50% 30%", kicker: "Conference", title: "BCU 2025 x InaPRevent", desc: "Bandung Cardiovascular Update 2025 at Pullman Bandung Grand Central.", meta: "Bandung · 2025" },
    { n: 13, pos: "50% 60%", kicker: "Cardiology Training", title: "Cath Lab", desc: "The medical team performing a procedure in the cardiac cath lab.", meta: "Cardiac cath lab" },
    { n: 16, pos: "50% 40%", kicker: "Cardiology Training", title: "Procedure Team", desc: "With the team in the procedure room, catheter tools laid out on the table.", meta: "Cardiac cath lab" },
    { n: 17, pos: "50% 30%", kicker: "Cardiology Training", title: "Control Room", desc: "Wearing a radiation apron, with cardiac monitors behind.", meta: "Cardiac cath lab" },
    { n: 14, pos: "50% 40%", kicker: "Hospital", title: "With Colleagues", desc: "dr. Fitri with fellow doctors under the operating room lights.", meta: "Operating room" },
    { n: 15, pos: "50% 25%", kicker: "ACSA 2026", title: "Echocardiography", desc: "ACSA participant, trying the echocardiography machine hands-on.", meta: "ACSA 2026" },
    { n: 24, pos: "50% 40%", kicker: "ACSA 2026", title: "Poster Presentation", desc: "Case report on Stanford type A aortic dissection with right coronary malperfusion.", meta: "ACSA 2026" },
    { n: 21, pos: "50% 45%", kicker: "ACSA 2026", title: "Colleagues at ACSA", desc: "With colleagues in front of the digital poster.", meta: "ACSA 2026" },
    { n: 23, pos: "50% 50%", kicker: "InaHRS 2026", title: "Menjaga Irama Negeri", desc: "The stage of the 13th Annual Scientific Meeting of InaHRS.", meta: "InaHRS 2026" },
    { n: 22, pos: "50% 45%", kicker: "InaHRS 2026", title: "Poster PS 198", desc: "Case report “When Adenosine Is Absent”: intravenous diltiazem for SVT in early pregnancy.", meta: "InaHRS 2026" },
    { n: 25, pos: "50% 50%", kicker: "Lombok Cardiovascular Update", title: "RBBB Case Report", desc: "Right Bundle Branch Block case report poster, with colleagues in traditional dress.", meta: "Lombok" },
    { n: 20, pos: "50% 35%", kicker: "Volunteering", title: "BSMI Volunteer", desc: "Examining residents at an Indonesian Red Crescent (BSMI) health event.", meta: "Community health" }
  ];
  var src = function (s, thumb) { var k = (s.n < 10 ? "0" : "") + s.n; return "galeri/koleksi/koleksi-" + k + (thumb ? "-thumb" : "") + ".jpg"; };
  var pad = function (i) { return (i + 1 < 10 ? "0" : "") + (i + 1); };

  var gx = $(".gx"), bg = $(".gx-bg"), stage = $(".gx-stage"), list = $(".gx-cards");
  var tKick = $(".gx-kicker-t"), tTitle = $(".gx-title-t"), tDesc = $(".gx-desc-t"), tMeta = $(".gx-meta-t"), tNum = $(".gx-num-t");
  var bar = $(".gx-progress i");
  var cur = 0, busy = false, VISIBLE = 5, DUR = 7000;

  /* preload full-size images in the background */
  slides.forEach(function (s) { var im = new Image(); im.decoding = "async"; im.src = src(s); });

  var setCopy = function (i) {
    var s = slides[i];
    tKick.textContent = s.kicker; tTitle.textContent = s.title; tDesc.textContent = s.desc; tMeta.textContent = s.meta; tNum.textContent = pad(i);
    bg.src = src(s); bg.style.objectPosition = s.pos;
  };

  var renderCards = function (animate) {
    list.innerHTML = "";
    for (var k = 1; k <= VISIBLE; k++) {
      var i = (cur + k) % slides.length, s = slides[i];
      var li = document.createElement("li");
      li.className = "gx-card";
      li.innerHTML = '<button type="button" aria-label="Show ' + s.title + '"><img src="' + src(s, true) + '" alt="" style="object-position:' + s.pos + '"><span class="gx-card-k">' + s.kicker + '</span><span class="gx-card-t">' + s.title + "</span></button>";
      li.dataset.index = i;
      if (animate && !reduce) { li.style.animationDelay = (k - 1) * 70 + "ms"; li.classList.add("enter"); }
      list.appendChild(li);
    }
  };

  /* text leaves (slides up out of its mask), then the new text rises in */
  var swapText = function (i, done) {
    if (reduce) { setCopy(i); done && done(); return; }
    gx.classList.add("text-out");
    setTimeout(function () {
      done && done();
      gx.classList.remove("text-out"); gx.classList.add("text-in");
      void gx.offsetWidth;
      gx.classList.remove("text-in");
    }, 520);
  };

  var go = function (i, fromCard) {
    if (busy || i === cur) return;
    i = (i + slides.length) % slides.length;
    busy = true; bar._p = 0; bar.style.transform = "scaleX(0)";
    var s = slides[i];
    var card = fromCard || null;
    var finish = function () { cur = i; setCopy(i); renderCards(true); busy = false; restart(); };

    if (reduce) { finish(); return; }

    var grow = document.createElement("div");
    grow.className = "gx-grow";
    grow.innerHTML = '<img src="' + src(s) + '" alt="" style="object-position:' + s.pos + '">';
    if (card) {
      var r = card.getBoundingClientRect(), g = gx.getBoundingClientRect();
      grow.style.cssText = "top:" + (r.top - g.top) + "px;left:" + (r.left - g.left) + "px;width:" + r.width + "px;height:" + r.height + "px;border-radius:16px";
      card.style.visibility = "hidden";
      stage.appendChild(grow);
      void grow.offsetWidth;
      grow.classList.add("grow-full");
    } else {
      grow.classList.add("fade-in");
      stage.appendChild(grow);
    }
    list.classList.add("shift");
    swapText(i, function () {
      tKick.textContent = s.kicker; tTitle.textContent = s.title; tDesc.textContent = s.desc; tMeta.textContent = s.meta; tNum.textContent = pad(i);
    });
    setTimeout(function () {
      bg.src = src(s); bg.style.objectPosition = s.pos;
      var swap = function () { grow.remove(); list.classList.remove("shift"); finish(); };
      bg.decode ? bg.decode().then(swap, swap) : swap();
    }, 1000);
  };

  list.addEventListener("click", function (e) {
    var li = e.target.closest(".gx-card"); if (!li) return;
    go(+li.dataset.index, li);
  });
  var next = function () { var li = list.firstElementChild; go(cur + 1, li); };
  var prev = function () { go(cur - 1, null); };
  document.querySelectorAll(".gx-btn").forEach(function (b) {
    b.addEventListener("click", function () { b.dataset.dir === "1" ? next() : prev(); });
  });
  document.addEventListener("keydown", function (e) {
    if (gx.getBoundingClientRect().bottom < innerHeight * 0.5) return;
    if (e.key === "ArrowRight") next(); else if (e.key === "ArrowLeft") prev();
  });
  /* swipe */
  var sx = null;
  gx.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
  gx.addEventListener("touchend", function (e) {
    if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
  });

  /* autoplay with a progress line; pauses off-screen, in hidden tabs and while hovering the cards */
  var t0 = 0, paused = false, inView = true, raf = 0;
  var restart = function () { t0 = performance.now(); };
  var tick = function (now) {
    raf = requestAnimationFrame(tick);
    if (paused || !inView || document.hidden || busy) { t0 = now - (bar._p || 0) * DUR; return; }
    var p = Math.min(1, (now - t0) / DUR); bar._p = p;
    bar.style.transform = "scaleX(" + p + ")";
    if (p >= 1) { bar._p = 0; next(); }
  };
  if (!reduce) {
    list.addEventListener("mouseenter", function () { paused = true; });
    list.addEventListener("mouseleave", function () { paused = false; });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { inView = en[0].isIntersecting; }, { threshold: 0.4 }).observe(gx);
    restart(); raf = requestAnimationFrame(tick);
  }

  setCopy(0); renderCards(false);

  /* grid of the whole collection: clicking a photo opens it in the slider */
  var grid = $(".gx-grid");
  slides.forEach(function (s, i) {
    var li = document.createElement("li");
    li.className = "gx-tile";
    li.innerHTML = '<button type="button" aria-label="Open ' + s.title + ' in the slider"><img src="' + src(s, true) + '" alt="' + s.desc.replace(/"/g, "&quot;") + '" loading="lazy" decoding="async"><span class="gx-tile-cap"><b>' + s.title + "</b>" + s.kicker + "</span></button>";
    li.querySelector("button").addEventListener("click", function () {
      scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      setTimeout(function () { go(i, null); }, reduce ? 0 : 450);
    });
    grid.appendChild(li);
  });
  var cnt = $(".gx-all-count"); if (cnt) cnt.textContent = slides.length + " photos";

  /* navbar hides on scroll down, returns on scroll up */
  var nav = $(".nav"), lastY = 0;
  addEventListener("scroll", function () {
    var y = scrollY; if (nav) { nav.classList.toggle("hide", y > lastY && y > 120); nav.classList.toggle("on-photo", y < gx.offsetHeight - 60); } lastY = y;
  }, { passive: true });
  if (nav) nav.classList.add("on-photo");

  /* theme toggle (shared with the home page through localStorage) */
  var themeBtn = $(".theme-toggle");
  var sync = function () { if (themeBtn) themeBtn.setAttribute("aria-label", root.dataset.theme === "light" ? "Switch to dark theme" : "Switch to light theme"); };
  sync();
  if (themeBtn) themeBtn.addEventListener("click", function () {
    var light = root.dataset.theme !== "light";
    root.classList.add("theme-anim");
    if (light) root.dataset.theme = "light"; else delete root.dataset.theme;
    try { localStorage.setItem("theme", light ? "light" : "dark"); } catch (e) {}
    sync();
    setTimeout(function () { root.classList.remove("theme-anim"); }, 500);
  });
})();
