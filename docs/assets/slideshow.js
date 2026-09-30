/* Mello Acres dahlia slideshow.
   Plain JavaScript, no libraries. Every change of slide uses a different
   entrance effect from the list below, in turn. Autoplays, pauses on hover or
   keyboard focus, and has a Pause button; arrows, dots, swipe and the arrow
   keys all work. People who ask their device for reduced motion get a gentle
   fade and no autoplay. */
(function () {
  var EFFECTS = ["fade", "slide", "circle", "zoom", "wipe", "blur", "diagonal", "rise", "bloom"];
  var DELAY = 5500;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("[data-slideshow]").forEach(function (root) {
    var slides = [].slice.call(root.querySelectorAll(".ss-slide"));
    var dotsBox = root.querySelector(".ss-dots");
    var count = root.querySelector(".ss-count");
    var toggle = root.querySelector(".ss-toggle");
    var bar = root.querySelector(".ss-progress");
    var live = root.querySelector(".ss-live");
    var n = slides.length, cur = 0, fx = 0, timer = null;
    var playing = !reduce, hovered = false;

    var dots = slides.map(function (s, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Show photo " + (i + 1) + " of " + n);
      b.addEventListener("click", function () { go(i, i < cur); });
      dotsBox.appendChild(b);
      return b;
    });

    function clean(s) {
      EFFECTS.forEach(function (e) { s.classList.remove("fx-" + e); });
      s.classList.remove("rev", "is-leaving");
    }

    function show(i, back, first) {
      var prev = slides[cur];
      slides.forEach(function (s) { if (s !== prev) clean(s); });
      if (!first && prev !== slides[i]) {
        clean(prev);
        prev.classList.remove("is-active");
        prev.classList.add("is-leaving");
        prev.setAttribute("aria-hidden", "true");
      }
      var next = slides[i];
      clean(next);
      next.classList.remove("is-active");
      void next.offsetWidth;                         // restart the animations
      if (!first) {
        var name = reduce ? "fade" : EFFECTS[fx++ % EFFECTS.length];
        next.classList.add("fx-" + name);
        if (back) next.classList.add("rev");
      }
      next.classList.add("is-active");
      next.removeAttribute("aria-hidden");
      slides.forEach(function (s, k) { if (k !== i && k !== cur) s.setAttribute("aria-hidden", "true"); });
      cur = i;
      dots.forEach(function (d, k) { d.setAttribute("aria-current", k === i ? "true" : "false"); });
      count.textContent = (i + 1) + " / " + n;
      if (live && !first) live.textContent = "Photo " + (i + 1) + " of " + n + ": " + (next.querySelector(".ss-img").alt || "");
      // warm the next picture so it's ready when its turn comes
      [].slice.call(slides[(i + 1) % n].querySelectorAll("img")).forEach(function (im) {
        im.loading = "eager";
      });
      schedule();
    }

    function go(i, back) { if (i !== cur) show((i + n) % n, back); }
    function nextSlide() { go((cur + 1) % n, false); }
    function prevSlide() { go((cur - 1 + n) % n, true); }

    function schedule() {
      clearTimeout(timer);
      bar.classList.remove("run"); void bar.offsetWidth;
      if (playing && !hovered) {
        bar.style.animationDuration = DELAY + "ms";
        bar.classList.add("run");
        timer = setTimeout(nextSlide, DELAY);
      }
      root.classList.toggle("is-playing", playing && !hovered);
    }

    function setPlaying(p) {
      playing = p;
      toggle.textContent = p ? "Pause" : "Play";
      toggle.setAttribute("aria-pressed", p ? "false" : "true");
      schedule();
    }

    root.querySelector(".ss-next").addEventListener("click", nextSlide);
    root.querySelector(".ss-prev").addEventListener("click", prevSlide);
    toggle.addEventListener("click", function () { setPlaying(!playing); });

    var stage = root.querySelector(".ss-stage");
    stage.addEventListener("mouseenter", function () { hovered = true; schedule(); });
    stage.addEventListener("mouseleave", function () { hovered = false; schedule(); });
    root.addEventListener("focusin", function () { hovered = true; schedule(); });
    root.addEventListener("focusout", function (e) {
      if (!root.contains(e.relatedTarget)) { hovered = false; schedule(); }
    });
    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { nextSlide(); e.preventDefault(); }
      if (e.key === "ArrowLeft") { prevSlide(); e.preventDefault(); }
    });

    var x0 = null;
    stage.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) { dx < 0 ? nextSlide() : prevSlide(); }
    }, { passive: true });

    // stop the clock while the tab is hidden, pick up again on return
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) clearTimeout(timer); else schedule();
    });

    root.classList.add("is-ready");
    setPlaying(playing);
    show(0, false, true);
  });
})();
