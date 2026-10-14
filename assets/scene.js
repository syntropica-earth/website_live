(function () {
  var s = document.querySelector('.map404'); if (!s) return;
  var $ = function (i) { return s.querySelector(i); };
  var P = $('#m4-ink').children, sat = $('#m4-sat'), beam = $('#m4-beam'), ret = $('#m4-reticle'), wipe = $('#m4-wipe');
  var rm = matchMedia('(prefers-reduced-motion: reduce)'), wide = matchMedia('(min-width: 820px)');
  var RS = 4346, SY = 40, D = 305, CY = 345, SP = 509, X0 = -44, CYC = 3.3, HW = 18, HOLD = 1.05, FADE = .45, HH = 130;
  var tc = [], op = [], n = P.length, raf = 0, t0 = 0, i;
  for (i = 0; i < n; i++) { tc[i] = ((+P[i].getAttribute('data-x') - D / RS * 720) / (1 - D / RS) - X0) / SP; op[i] = 1; }
  function r1(v) { return Math.round(v * 10) / 10; }
  function place(xs) {
    var dx = xs - 720, s_ = dx / RS, c_ = Math.sqrt(1 - s_ * s_), y = SY + RS * (1 - c_);
    var gx = xs - D * s_, gy = y + D * c_, l = gx - HW, r = gx + HW, t = CY - HH, b = CY + HH;
    sat.setAttribute('transform', 'translate(' + r1(xs) + ' ' + r1(y) + ') rotate(' + r1(Math.asin(s_) * 57.2958) + ')');
    beam.setAttribute('d', 'M' + r1(xs) + ' ' + r1(y + 5) + 'L' + r1(gx) + ' ' + r1(gy));
    ret.setAttribute('d', 'M' + r1(l - 7) + ' ' + t + 'H' + r1(l) + 'V' + b + 'H' + r1(l - 7) + 'M' + r1(r + 7) + ' ' + t + 'H' + r1(r) + 'V' + b + 'H' + r1(r + 7));
    wipe.setAttribute('x', r1(l)); return gx;
  }
  function set(k, o) { if (op[k] !== o) { op[k] = o; P[k].setAttribute('opacity', o); } }
  function frame(now) {
    if (!t0) t0 = now;
    var t = ((now - t0) / 1000) % CYC, k, a, o;
    place(X0 + SP * t);
    for (k = 0; k < n; k++) {
      a = t - tc[k]; if (a < -HW / SP) a += CYC;   /* eta' del passaggio sulla colonna; <0: colonna ancora davanti, vale il passaggio precedente */
      if (a <= HW / SP) o = 1;
      else { a = (a - HOLD) / FADE; a = a < 0 ? 0 : a > 1 ? 1 : a; o = 1 - a * a * (3 - 2 * a); }
      set(k, Math.round(o * 20) / 20);
    }
    raf = requestAnimationFrame(frame);
  }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
  function still() {
    stop(); s.classList.remove('is-live'); s.classList.add('is-static');
    for (i = 0; i < n; i++) set(i, 1);
    wipe.setAttribute('width', 0); place(720);
  }
  function run() {
    if (raf || document.hidden) return;
    s.classList.remove('is-static'); s.classList.add('is-live');
    wipe.setAttribute('width', HW * 2); t0 = 0; raf = requestAnimationFrame(frame);
  }
  function apply() { if (rm.matches || !wide.matches) still(); else run(); }
  document.addEventListener('visibilitychange', function () {
    if (rm.matches || !wide.matches) return;
    if (document.hidden) { s.classList.add('is-hidden'); stop(); } else { s.classList.remove('is-hidden'); run(); }
  });
  [rm, wide].forEach(function (m) { m.addEventListener ? m.addEventListener('change', apply) : m.addListener(apply); });
  apply();
})();
