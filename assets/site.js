/* Syntropica — script unico (spec v7, parte 4). Nessuna libreria. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var params = new URLSearchParams(location.search);

  /* 3.8 About: #custodia porta a Stewardship */
  if (location.hash === '#custodia' && /\/about\/$/.test(location.pathname)) location.replace((root.lang.indexOf('en') === 0 ? '/en' : '') + '/stewardship/#custodia');

  /* 4.5 Pagine bilingui in un solo file (404, catalogo): testi EN da data-en */
  if (root.hasAttribute('data-bilingual') &&
      (location.pathname.indexOf('/en/') === 0 || params.get('lang') === 'en')) {
    root.lang = 'en-GB';
    if (root.dataset.enTitle) doc.title = root.dataset.enTitle;
    $$('[data-en]').forEach(function (el) { el.textContent = el.dataset.en; });
    $$('[data-en-href]').forEach(function (el) { el.setAttribute('href', el.dataset.enHref); });
    $$('[data-en-label]').forEach(function (el) { el.setAttribute('aria-label', el.dataset.enLabel); });
    $$('[data-en-alt]').forEach(function (el) { el.setAttribute('data-alt', el.dataset.enAlt); });
    $$('.lang').forEach(function (l) {
      var cur = $('.lang-cur', l), alt = $('.lang-alt', l);
      if (!cur || !alt) return;
      var ph = doc.createComment('');
      cur.replaceWith(ph); alt.replaceWith(cur); ph.replaceWith(alt);
      var t = cur.firstElementChild.textContent;
      cur.firstElementChild.textContent = alt.firstElementChild.textContent; alt.firstElementChild.textContent = t;
      alt.setAttribute('hreflang', 'it'); alt.setAttribute('lang', 'it');
      alt.setAttribute('aria-label', 'Italiano');
      cur.removeAttribute('lang');
    });
  }
  var EN = root.lang.indexOf('en') === 0;
  var T = EN ? {
    menu: 'Menu', close: 'Close', copied: 'Copied', req: 'This field is required.',
    email: 'Please enter a valid email address.', choose: 'Please choose an option.',
    fail: 'Your message could not be sent. Please try again in a few minutes, or write to contact@syntropica.earth.',
    sending: 'Sending…'
  } : {
    menu: 'Menu', close: 'Chiudi', copied: 'Copiato', req: 'Campo obbligatorio.',
    email: 'Inserite un indirizzo email valido.', choose: 'Scegliete una voce.',
    fail: 'Invio non riuscito. Riprovate fra qualche minuto, oppure scriveteci a contact@syntropica.earth.',
    sending: 'Invio in corso…'
  };

  /* Regione live unica per pagina */
  var live = $('#live');
  if (!live) {
    live = doc.createElement('div');
    live.id = 'live'; live.className = 'visually-hidden';
    live.setAttribute('aria-live', 'polite');
    doc.body.appendChild(live);
  }
  function announce(msg) { live.textContent = ''; setTimeout(function () { live.textContent = msg; }, 30); }

  /* 1.3 · 4.3 Selettore: stessa pagina nell'altra lingua, con ?chi= e ancora */
  function langLinks() {
    var chi = params.get('chi');
    $$('.lang-alt[data-alt]').forEach(function (a) {
      var u = a.dataset.alt;
      if (chi) u += (u.indexOf('?') > -1 ? '&' : '?') + 'chi=' + encodeURIComponent(chi);
      a.setAttribute('href', u + location.hash);
    });
  }
  langLinks();
  window.addEventListener('hashchange', langLinks);

  /* 2.13 Pannello «Per chi» */
  var perchi = $('.perchi'), pp = perchi && doc.getElementById(perchi.getAttribute('aria-controls'));
  function perchiSet(open, focusBtn) {
    if (!perchi) return;
    perchi.setAttribute('aria-expanded', open ? 'true' : 'false');
    pp.hidden = !open;
    if (!open && focusBtn) perchi.focus();
  }
  if (perchi && pp) {
    perchi.addEventListener('click', function () { perchiSet(perchi.getAttribute('aria-expanded') !== 'true'); });
    doc.addEventListener('click', function (e) {
      if (!pp.hidden && !pp.contains(e.target) && !perchi.contains(e.target)) perchiSet(false);
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !pp.hidden) { perchiSet(false, true); }
    });
    pp.addEventListener('focusout', function (e) {
      if (e.relatedTarget && !pp.contains(e.relatedTarget) && e.relatedTarget !== perchi) perchiSet(false);
    });
  }

  /* 2.13 Pannello mobile e dialogo */
  var header = $('.site-header'), dlg = $('.menu-dialog'), mbtn = $('.menu-btn'),
      panel = mbtn && doc.getElementById(mbtn.getAttribute('aria-controls'));
  var outside = function () { return $$('.skip, main, .site-footer'); };
  function focusables() {
    return $$('.menu-btn, .btn--compact', dlg).concat($$('a[href], button', panel))
      .filter(function (el) { return el.offsetParent !== null || el === mbtn; });
  }
  function menuSet(open) {
    if (!dlg || !mbtn || !panel) return;
    var isOpen = header.classList.contains('menu-open');
    if (open === isOpen) return;
    header.classList.toggle('menu-open', open);
    root.classList.toggle('menu-lock', open);
    mbtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    var lbl = $('.menu-label', mbtn); if (lbl) lbl.textContent = open ? T.close : T.menu;
    outside().forEach(function (el) { open ? el.setAttribute('inert', '') : el.removeAttribute('inert'); });
    if (open) {
      dlg.setAttribute('role', 'dialog'); dlg.setAttribute('aria-modal', 'true'); dlg.setAttribute('aria-label', 'Menu');
      panel.removeAttribute('aria-hidden');
      var first = $('a[href]', panel); if (first) setTimeout(function () { first.focus(); }, 20);
    } else {
      dlg.removeAttribute('role'); dlg.removeAttribute('aria-modal'); dlg.removeAttribute('aria-label');
      mbtn.focus();
    }
  }
  if (mbtn && panel) {
    mbtn.addEventListener('click', function () { menuSet(!header.classList.contains('menu-open')); });
    doc.addEventListener('keydown', function (e) {
      if (!header.classList.contains('menu-open')) return;
      if (e.key === 'Escape') { e.preventDefault(); menuSet(false); return; }
      if (e.key !== 'Tab') return;
      var f = focusables(); if (!f.length) return;
      var i = f.indexOf(doc.activeElement);
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    });
    $$('a[href]', panel).forEach(function (a) {
      a.addEventListener('click', function () {
        header.classList.remove('menu-open'); root.classList.remove('menu-lock');
        outside().forEach(function (el) { el.removeAttribute('inert'); });
      });
    });
    var mq = window.matchMedia('(min-width: 1080px)');
    var onMq = function () { if (mq.matches) menuSet(false); };
    mq.addEventListener ? mq.addEventListener('change', onMq) : mq.addListener(onMq);
  }

  /* 2.9.16 Copia al clic */
  if (navigator.clipboard && window.isSecureContext) {
    $$('.copy').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.dataset.value || b.textContent.trim();
        navigator.clipboard.writeText(v).then(function () {
          var n = b.nextElementSibling;
          if (!n || !n.classList.contains('copy-done')) {
            n = doc.createElement('span'); n.className = 'copy-done'; n.setAttribute('aria-hidden', 'true');
            b.parentNode.insertBefore(n, b.nextSibling);
          }
          n.textContent = T.copied; announce(T.copied);
          clearTimeout(b._t); b._t = setTimeout(function () { n.remove(); }, 1500);
        }, function () {});
      });
    });
  } else {
    $$('.copy').forEach(function (b) { b.style.setProperty('cursor', 'text'); });
  }

  /* 4.1 Modulo */
  var form = $('form.form');
  if (form) {
    var CHI = { investitore: 'Investitore', impresa: 'Impresa', ente: 'Ente pubblico',
      proprietario: 'Proprietario forestale', comunita: 'Comunità locale', altro: 'Altro' };
    var sel = form.elements.siete, subj = form.elements._subject;
    var setSubject = function () { subj.value = 'Sito syntropica: ' + (sel.value || 'nuovo messaggio'); };
    form.prefill = function (key) { if (CHI[key]) { sel.value = CHI[key]; setSubject(); if (form._tried) validate(sel); } };
    form.prefill(params.get('chi'));
    sel.addEventListener('change', setSubject);
    $$('[data-chi]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault(); form.prefill(a.dataset.chi);
        var u = new URL(location.href); u.searchParams.set('chi', a.dataset.chi); u.hash = 'modulo';
        history.replaceState(null, '', u); params = new URLSearchParams(u.search); langLinks();
        form.scrollIntoView(); (form.elements.nome || sel).focus({ preventScroll: true });
      });
    });

    var fields = $$('input:not([type=hidden]):not([name=_gotcha]), select, textarea', form);
    var errBox = $('.form-error', form), ok = form.parentNode.querySelector('.form-ok');
    var btn = $('button[type=submit]', form);
    var setErr = function (el, msg) {
      var id = el.id + '-err', m = doc.getElementById(id);
      if (msg) {
        if (!m) { m = doc.createElement('p'); m.id = id; m.className = 'field-error'; el.closest('.field').appendChild(m); }
        m.textContent = '— ' + msg;
        el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', id);
      } else {
        if (m) m.remove();
        el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby');
      }
    };
    var validate = function (el) {
      var v = el.value.trim(), msg = '';
      if (el.required && !v) msg = el.tagName === 'SELECT' ? T.choose : T.req;
      else if (el.type === 'email' && v && !el.checkValidity()) msg = T.email;
      setErr(el, msg); return !msg;
    };
    fields.forEach(function (el) { el.addEventListener('blur', function () { if (form._tried) validate(el); }); });
    var busy = function (on) {
      btn.disabled = on; btn.classList.toggle('is-loading', on);
      form.setAttribute('aria-busy', on ? 'true' : 'false');
      fields.forEach(function (el) { if (el.tagName !== 'SELECT') el.readOnly = on; });
      var l = $('.loader', btn);
      if (on && !l) {
        btn.insertAdjacentHTML('beforeend', '<svg class="loader" viewBox="0 0 16 16" aria-hidden="true" focusable="false" shape-rendering="crispEdges"><rect x="0" y="0" width="4" height="4"/><rect x="6" y="0" width="4" height="4"/><rect x="12" y="0" width="4" height="4"/><rect x="12" y="6" width="4" height="4"/><rect x="12" y="12" width="4" height="4"/><rect x="6" y="12" width="4" height="4"/><rect x="0" y="12" width="4" height="4"/><rect x="0" y="6" width="4" height="4"/></svg>');
        announce(T.sending);
      } else if (!on && l) l.remove();
    };
    var general = function (msg) { errBox.textContent = msg; errBox.hidden = !msg; };
    form.addEventListener('submit', function (e) {
      e.preventDefault(); form._tried = true; general('');
      var bad = fields.filter(function (el) { return !validate(el); });
      if (bad.length) { bad[0].focus(); return; }
      busy(true);
      var opts = { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } };
      if (window.AbortSignal && AbortSignal.timeout) opts.signal = AbortSignal.timeout(15000);
      fetch(form.action, opts).then(function (r) {
        if (r.ok) {
          busy(false); form.reset(); setSubject(); form.hidden = true;
          if (ok) { ok.hidden = false; ok.focus(); }
          return;
        }
        return r.json().catch(function () { return {}; }).then(function (j) {
          busy(false);
          var rest = [], first = null;
          (j && j.errors || []).forEach(function (er) {
            var el = er.field && form.elements[er.field];
            if (el && el.closest && el.closest('.field')) { setErr(el, er.message); first = first || el; }
            else rest.push(er.message);
          });
          general(rest.length ? rest.join(' ') : (first ? '' : T.fail));
          if (first) first.focus();
        });
      }).catch(function () { busy(false); general(T.fail); });
    });
  }

})();
