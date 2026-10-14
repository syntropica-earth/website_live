(function () {
  var s = document.getElementById('ingresso'); if (!s) return;
  var root = document.documentElement, ref = document.referrer, force = location.search === '?ingresso', seen = false, open = false;
  try { seen = sessionStorage.getItem('syn-splash') === '1'; } catch (e) {}
  var others = [].slice.call(document.body.children).filter(function (n) { return n !== s && n.tagName !== 'SCRIPT'; });
  function show() {
    open = true; s.hidden = false; root.classList.add('has-splash');
    others.forEach(function (n) { n.setAttribute('inert', ''); });
    s.focus({ preventScroll: true });
  }
  function hide() {
    open = false; s.hidden = true; root.classList.remove('has-splash');
    others.forEach(function (n) { n.removeAttribute('inert'); });
    if (location.search === '?ingresso') history.replaceState(null, '', location.pathname);
  }
  s.hidden = true;
  if (force || !(seen || location.hash || location.search || (ref && ref.indexOf(location.origin) === 0))) {
    try { sessionStorage.setItem('syn-splash', '1'); } catch (e) {}
    show();
  } else { s.hidden = true; }
  s.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (a && (a.getAttribute('hreflang') || '') !== (root.lang || 'it').slice(0, 2)) return;
    e.preventDefault(); hide();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) hide(); });
  /* sulla Home, il logo riapre la schermata d'ingresso */
  var logo = document.querySelector('.site-header a.lockup');
  if (logo && (location.pathname === '/' || location.pathname === '/en/')) logo.addEventListener('click', function (e) { e.preventDefault(); window.scrollTo(0, 0); show(); });
})();
