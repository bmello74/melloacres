/* Mello Acres click tracking for Google Analytics.
   Counts phone taps, email taps and guide downloads so the monthly report can
   show who reached out. Page views, scrolling and outbound links are counted
   by Google Analytics itself. No libraries. */
(function () {
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || !window.gtag) return;
    var href = a.getAttribute('href') || '';
    var where = { link_text: (a.textContent || '').trim().slice(0, 80), page_path: location.pathname };
    if (href.indexOf('tel:') === 0) gtag('event', 'phone_click', where);
    else if (href.indexOf('mailto:') === 0) gtag('event', 'email_click', where);
    else if (/\.pdf($|\?)/i.test(href)) { where.file_name = href.split('/').pop(); gtag('event', 'guide_download', where); }
  }, true);
})();
