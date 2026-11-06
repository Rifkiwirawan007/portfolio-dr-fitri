/* Clinic map — vanilla port of 21st.dev "mapcn-marker-tooltip.tsx".
 * MapLibre GL + CARTO basemap, one custom marker with a hover tooltip
 * (MapLibre Popup, no close button, closes on map click), as in the original.
 * Additions for a static site: MapLibre is loaded only when the map nears the
 * viewport, the marker is a focusable button (tooltip on focus and tap), wheel
 * zoom is off so page scroll is never hijacked, zoom buttons instead.
 *
 * Markup: <figure data-clinic-map data-lng data-lat data-name [data-zoom]
 *   [data-style="dark|light"]><div class="clinic-map-canvas"></div>…</figure>
 */
(function () {
  "use strict";
  var STYLES = {
    dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
    light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  };
  var base = (document.currentScript && document.currentScript.src.replace(/[^/]*$/, "")) || "./assets/";
  var loading = null;

  function loadLib() {
    if (window.maplibregl) return Promise.resolve(window.maplibregl);
    if (loading) return loading;
    loading = new Promise(function (resolve, reject) {
      var css = document.createElement("link");
      css.rel = "stylesheet"; css.href = base + "maplibre-gl.css";
      document.head.appendChild(css);
      var s = document.createElement("script");
      s.src = base + "maplibre-gl.js";
      s.onload = function () { resolve(window.maplibregl); };
      s.onerror = reject;
      document.head.appendChild(s);
    });
    return loading;
  }

  function themeStyle() {
    return document.documentElement.dataset.theme === "light" ? STYLES.light : STYLES.dark;
  }

  function mount(fig) {
    var box = fig.querySelector(".clinic-map-canvas");
    var lng = parseFloat(fig.dataset.lng), lat = parseFloat(fig.dataset.lat);
    var name = fig.dataset.name || "Lokasi";
    var zoom = parseFloat(fig.dataset.zoom) || 15;
    fig.classList.add("is-loading");

    loadLib().then(function (ml) {
      var map = new ml.Map({
        container: box,
        style: themeStyle(),
        center: [lng, lat],
        zoom: zoom,
        renderWorldCopies: false,
        attributionControl: { compact: true },
        scrollZoom: false,
        pitchWithRotate: false,
        dragRotate: false
      });
      map.addControl(new ml.NavigationControl({ showCompass: false }), "top-right");
      map.on("load", function () {
        fig.classList.remove("is-loading"); fig.classList.add("is-ready");
        // Compact attribution starts collapsed (just the ⓘ) so it never covers the Maps button.
        var attr = box.querySelector(".maplibregl-ctrl-attrib");
        if (attr) attr.classList.remove("maplibregl-compact-show");
      });

      // MarkerContent: a custom element (here a real button for keyboard/touch)
      var el = document.createElement("button");
      el.type = "button";
      el.className = "clinic-pin";
      el.setAttribute("aria-label", name);
      el.innerHTML = '<span class="clinic-pin-dot" aria-hidden="true"></span>';
      var marker = new ml.Marker({ element: el, anchor: "center" }).setLngLat([lng, lat]).addTo(map);

      // MarkerTooltip: Popup, offset 16, no close button, closes on map click
      var tip = document.createElement("div");
      tip.className = "clinic-tip-body";
      tip.textContent = name;
      var popup = new ml.Popup({ offset: 16, closeButton: false, closeOnClick: true, className: "clinic-tip" })
        .setMaxWidth("none").setDOMContent(tip);
      var show = function () { popup.setLngLat(marker.getLngLat()).addTo(map); };
      var hide = function () { popup.remove(); };
      el.addEventListener("mouseenter", show);
      el.addEventListener("mouseleave", hide);
      el.addEventListener("focus", show);
      el.addEventListener("blur", hide);
      el.addEventListener("click", function (e) { e.stopPropagation(); popup.isOpen() ? hide() : show(); });

      new ResizeObserver(function () { map.resize(); }).observe(box);
      document.addEventListener("themechange", function () { map.setStyle(themeStyle()); });
    }, function () {
      fig.classList.remove("is-loading");
      fig.classList.add("is-failed");
    });
  }

  function init() {
    var figs = document.querySelectorAll("[data-clinic-map]");
    if (!figs.length) return;
    if (!("IntersectionObserver" in window)) { figs.forEach(mount); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { io.unobserve(en.target); mount(en.target); }
      });
    }, { rootMargin: "600px 0px" });
    figs.forEach(function (f) { io.observe(f); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
