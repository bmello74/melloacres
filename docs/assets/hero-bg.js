/* Mello Acres home page: rotating photo background behind the hero.
   Each photo slowly drifts and cross-fades into the next. Photos after the
   first load only as their turn approaches. Reduced-motion visitors get the
   first photo, still. Add or reorder photos in tools/pages/home.html. */
(function () {
  var root = document.querySelector("[data-hero-bg]");
  if (!root) return;
  var layers = [].slice.call(root.querySelectorAll("span"));
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || layers.length < 2) return;
  var DELAY = 6500, cur = 0, timer = null;

  function load(i, done) {
    var s = layers[i], src = s.getAttribute("data-bg");
    if (!src) { if (done) done(); return; }
    var im = new Image();
    im.onload = im.onerror = function () {
      s.style.backgroundImage = "url(" + src + ")";
      s.removeAttribute("data-bg");
      if (done) done();
    };
    im.src = src;
  }

  function next() {
    var n = (cur + 1) % layers.length;
    load(n, function () {
      layers[cur].classList.remove("on");
      void layers[n].offsetWidth;
      layers[n].classList.add("on");
      cur = n;
      load((cur + 1) % layers.length);     // warm the one after
      timer = setTimeout(next, DELAY);
    });
  }

  load(1);
  timer = setTimeout(next, DELAY);
  document.addEventListener("visibilitychange", function () {
    clearTimeout(timer);
    if (!document.hidden) timer = setTimeout(next, DELAY);
  });
})();
