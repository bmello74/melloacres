/* Mello Acres - "Raised with love" photo wall.
   Plays the gosling clip muted on a loop while it's on screen, pauses it when
   scrolled away, and lets visitors turn the sound on. With reduced motion set,
   the clip waits for a tap instead of playing by itself. */
(function () {
  var tile = document.querySelector('.lw-video');
  if (!tile) return;
  var vid = tile.querySelector('video');
  var btn = tile.querySelector('.lw-sound');
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var userPaused = false;

  function play() { var p = vid.play(); if (p && p.catch) p.catch(function () {}); }

  if (still) { vid.controls = true; }
  else if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !userPaused) play(); else vid.pause();
      });
    }, { threshold: 0.35 }).observe(vid);
  } else { play(); }

  btn.addEventListener('click', function () {
    vid.muted = !vid.muted;
    btn.setAttribute('aria-pressed', String(!vid.muted));
    btn.textContent = vid.muted ? 'Sound on' : 'Sound off';
    if (!vid.muted) { userPaused = false; play(); }
  });
})();
