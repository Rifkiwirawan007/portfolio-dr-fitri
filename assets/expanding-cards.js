/* Expanding cards, vanilla port of components/ui/expanding-cards.tsx
 * A row of cards (a column on phones); the active card takes 5fr, the rest 1fr.
 * Hover, focus or click a card to make it active.
 * Markup: <ul class="xcards" data-active="0"><li class="xcard">...</li>...</ul>
 */
(function () {
  "use strict";
  document.querySelectorAll(".xcards").forEach(function (list) {
    var cards = [].slice.call(list.querySelectorAll(".xcard"));
    var active = parseInt(list.dataset.active, 10) || 0;
    var desktop = matchMedia("(min-width: 768px)");

    function layout() {
      var tracks = cards.map(function (_, i) { return i === active ? "minmax(0, 5fr)" : "minmax(0, 1fr)"; }).join(" ");
      if (desktop.matches) {
        /* kartu aktif berukuran 3:4 (lebar = 3/4 tinggi galeri) */
        var w = Math.round(list.clientHeight * 0.75) + "px";
        tracks = cards.map(function (_, i) { return i === active ? w : "minmax(0, 1fr)"; }).join(" ");
        list.style.gridTemplateColumns = tracks;
        list.style.gridTemplateRows = "minmax(0, 1fr)";
      } else {
        /* phone: fixed-height strips + one tall open card */
        list.style.gridTemplateRows = cards.map(function (_, i) { return i === active ? "340px" : "46px"; }).join(" ");
        list.style.gridTemplateColumns = "minmax(0, 1fr)";
      }
      cards.forEach(function (c, i) {
        c.dataset.active = String(i === active);
        c.setAttribute("aria-expanded", String(i === active));
      });
    }
    function set(i) { if (i !== active) { active = i; layout(); } }

    cards.forEach(function (card, i) {
      card.addEventListener("mouseenter", function () { set(i); });
      card.addEventListener("focus", function () { set(i); });
      card.addEventListener("click", function () { set(i); });
      card.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); cards[Math.min(cards.length - 1, i + 1)].focus(); }
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); cards[Math.max(0, i - 1)].focus(); }
      });
    });
    if (desktop.addEventListener) desktop.addEventListener("change", layout);
    addEventListener("resize", layout);
    layout();
  });
})();
