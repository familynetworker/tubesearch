/* Tube Search website v3: smooth scroll, card fan, journey line, product demo and the interactive tools. Every link works without it. */
(function () {
  // ---- where things live: change these when the new domain is ready ----
  var MEMBERS = 'https://tubesearch-members.tubesearch.workers.dev';
  var PAY = {
    basic: 'https://buy.stripe.com/cNibJ196O8Gyc8A3NP4ZG01',
    pro: 'https://buy.stripe.com/14A4gz96O8Gy8Wo7014ZG02',
    premiere: 'https://buy.stripe.com/cNi28r2Iq7Cu7Sk5VX4ZG03'
  };
  var D = window.TS_DATA || { niches: [], breakouts: [] };
  var reduce = false;   // motion always plays, even when Windows animation effects are off
  var fine = window.matchMedia && matchMedia('(pointer:fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s) }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)) };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)) };
  var big = function (n) { return n >= 1e9 ? (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B' : n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : String(Math.round(n)) };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] }) };

  $$('[data-m]').forEach(function (a) { a.href = MEMBERS + a.getAttribute('data-m') });
  $$('[data-pay]').forEach(function (a) { a.href = PAY[a.getAttribute('data-pay')]; a.target = '_blank'; a.rel = 'noopener' });
  $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear() });

  // ---- one scroll loop for everything ----
  var scrollers = [], ticking = false;
  function onScroll() { if (ticking) return; ticking = true; requestAnimationFrame(function () { ticking = false; scrollers.forEach(function (f) { f() }) }) }
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll);

  // ---- smooth scroll (Lenis) when it loads; plain scroll otherwise ----
  var lenis = null;
  function startLenis() {
    if (reduce || !window.Lenis || lenis) return;
    try { lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: .95 }); window.lenis = lenis; (function raf(t) { lenis.raf(t); requestAnimationFrame(raf) })(performance.now()); lenis.on('scroll', onScroll) } catch (_) { lenis = null }
  }
  if (window.Lenis) startLenis(); else addEventListener('load', startLenis);
  function goTo(el, n) {   // the page can grow while gliding (pictures load on the way), so check on arrival and finish the trip
    n = n || 0;
    if (lenis) lenis.scrollTo(el, { offset: -70, duration: n ? .7 : 1.15, onComplete: function () { if (n < 3 && Math.abs(el.getBoundingClientRect().top - 70) > 40) goTo(el, n + 1) } });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
  }
  $$('a[href^="#"]').forEach(function (a) {
    var id = a.getAttribute('href'); if (id.length < 2 || a.hasAttribute('data-video')) return;
    a.addEventListener('click', function (e) { var t = $(id); if (!t) return; e.preventDefault(); closeMenu(); goTo(t); history.replaceState(null, '', id) });
  });

  // ---- nav: solid after the top, hidden below the top area ----
  var nav = $('.nav'), lastY = 0, prog = $('#prog'), sticky = $('.sticky'), pricing = $('#pricing');
  scrollers.push(function () {
    var y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle('solid', y > 30);
    // menu hides once you scroll down and only comes back near the top (Craig, Nov 10: no popping up mid-page)
    nav.classList.toggle('hide', y > 140 && !document.body.classList.contains('menu'));
    lastY = y;
    if (prog) prog.style.transform = 'scaleX(' + clamp(y / Math.max(1, h), 0, 1) + ')';
    if (sticky && pricing) { var pr = pricing.getBoundingClientRect(); sticky.classList.toggle('on', y > innerHeight * .9 && (pr.top > innerHeight || pr.bottom < 0)) }
  });

  // ---- phone menu ----
  var burger = $('.burger'), mnav = $('.mnav');
  function closeMenu() { if (!burger) return; burger.setAttribute('aria-expanded', 'false'); mnav.classList.remove('on'); document.body.classList.remove('menu') }
  if (burger) burger.addEventListener('click', function () { var o = burger.getAttribute('aria-expanded') !== 'true'; burger.setAttribute('aria-expanded', o); mnav.classList.toggle('on', o); document.body.classList.toggle('menu', o) });

  // ---- reveals: lines rise out of masks, blocks fade up (position checks, plus a safety net) ----
  var revs = $$('.rv,.ln,.cmp,.team,.mark');
  function reveal() {
    var lim = innerHeight * .9;
    revs = revs.filter(function (el) {
      var r = el.getBoundingClientRect(); if (r.top < lim && r.bottom > -40) {
        var sib = el.parentNode ? [].indexOf.call(el.parentNode.children, el) : 0;
        el.style.transitionDelay = (el.classList.contains('ln') ? sib * 0.09 : el.classList.contains('rv') ? Math.min(sib, 6) * 0.06 : 0) + 's';
        el.classList.add('in'); return false;
      } return true;
    });
  }
  scrollers.push(reveal);
  setTimeout(function () { revs.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < innerHeight * 1.2) el.classList.add('in') }) }, 4000);
  if (reduce) $$('.rv,.ln,.cmp,.team,.mark').forEach(function (el) { el.classList.add('in') });

  // ---- stars in the sky ----
  var sc = $('#stars');
  if (sc) {
    var cx = sc.getContext('2d'), S = [], dpr = Math.min(devicePixelRatio || 1, 2), W, H;
    var size = function () { W = innerWidth; H = innerHeight; sc.width = W * dpr; sc.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); S = []; var n = Math.round(W * H / 6500); for (var i = 0; i < n; i++) S.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.3 + .2, d: Math.random() * .6 + .1, p: Math.random() * 6.3 }) };
    size(); addEventListener('resize', size);
    var draw = function (t) {
      cx.clearRect(0, 0, W, H); var off = scrollY;
      S.forEach(function (s) { var y = ((s.y - off * s.d * .25) % H + H) % H, a = reduce ? .6 : .35 + .45 * Math.sin(t / 900 + s.p); cx.globalAlpha = a; cx.fillStyle = s.r > 1.1 ? '#F5D0FE' : '#fff'; cx.beginPath(); cx.arc(s.x, y, s.r, 0, 6.29); cx.fill() });
      if (!reduce) requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw); if (reduce) scrollers.push(function () { draw(0) });
  }

  // ---- hero card fan: deals in, tilts to the mouse, holo follows the light ----
  var fan = $('#fan');
  if (fan) {
    var cards = $$('.ccard', fan), base = cards.map(function (c) { return getComputedStyle(c).transform });
    if (!reduce) {
      cards.forEach(function (c, i) { c.style.transition = 'none'; c.style.opacity = '0'; c.style.transform = 'translateY(120px) rotate(0deg) scale(.7)' });
      setTimeout(function () { cards.forEach(function (c, i) { setTimeout(function () { c.style.transition = 'transform 1.2s cubic-bezier(.16,1,.3,1),opacity .8s'; c.style.opacity = '1'; c.style.transform = '' }, 250 + i * 160) }) }, 60);
    }
    if (fine && !reduce) {
      var mx = 0, my = 0, tx = 0, ty = 0, live = false;
      fan.addEventListener('mousemove', function (e) { var r = fan.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - .5; my = (e.clientY - r.top) / r.height - .5; if (!live) { live = true; loop() } });
      fan.addEventListener('mouseleave', function () { mx = 0; my = 0 });
      var loop = function () {
        tx += (mx - tx) * .08; ty += (my - ty) * .08;
        cards.forEach(function (c, i) {
          var depth = i === 2 ? 1 : .6;   // the front card moves most
          c.style.transform = base[i].replace('none', '') + ' rotateY(' + (tx * 22 * depth) + 'deg) rotateX(' + (-ty * 18 * depth) + 'deg) translateZ(' + (depth * 30) + 'px)';
          var h = $('.holo', c); h.style.setProperty('--hx', (50 + tx * 120) + '%'); h.style.setProperty('--hy', (50 + ty * 120) + '%');
        });
        if (Math.abs(mx - tx) > .001 || Math.abs(my - ty) > .001 || mx || my) requestAnimationFrame(loop); else live = false;
      };
      cards.forEach(function (c) { c.addEventListener('transitionend', function () { c.style.transition = 'box-shadow .5s' }, { once: true }) });
    }
    // fan opens a little more as you scroll away
    if (innerWidth > 1020) scrollers.push(function () { var p = clamp(scrollY / innerHeight, 0, 1); fan.style.transform = 'translateY(' + (p * 60) + 'px) scale(' + (1 - p * .08) + ')'; fan.style.opacity = 1 - p * .7 });
  }

  // ---- count-up numbers ----
  $$('[data-count]').forEach(function (el) {
    var to = +el.dataset.count, dec = +(el.dataset.dec || 0), suf = el.dataset.suf || '', done = false;
    var fmt = function (v) { return (dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US')) + suf };
    if (reduce) { el.textContent = fmt(to); return }
    el.textContent = fmt(0);
    scrollers.push(function () {
      if (done) return; var r = el.getBoundingClientRect(); if (r.top > innerHeight * .92) return; done = true;
      var t0 = performance.now(); (function tw(t) { var p = clamp((t - t0) / 1800, 0, 1), e = 1 - Math.pow(1 - p, 4); el.textContent = fmt(to * e); if (p < 1) requestAnimationFrame(tw) })(t0);
    });
  });

  // ---- statement: words light up as you scroll ----
  var stp = $('.statement p');
  if (stp) {
    stp.innerHTML = stp.textContent.trim().split(/\s+/).map(function (w) { var m = /^\*(.+)\*$/.test(w); return '<span class="w' + (m ? ' m' : '') + '">' + esc(w.replace(/\*/g, '')) + '</span>' }).join(' ');
    var ws = $$('.w', stp);
    scrollers.push(function () { var r = stp.getBoundingClientRect(), p = clamp((innerHeight * .85 - r.top) / (r.height + innerHeight * .35), 0, 1), n = Math.round(p * ws.length * 1.05); ws.forEach(function (w, i) { w.classList.toggle('lit', i < n) }) });
    if (reduce) ws.forEach(function (w) { w.classList.add('lit') });
  }

  (function () {
  // ---- curved journey path: glowing layers, flowing color, pulses, sparks, comet head, chapters light up ----
  var jw = $('#jw'), jsv = $('#jpath');
  if (jw && jsv) {
    var NS = 'http://www.w3.org/2000/svg', DR = $$('.dr', jsv), pB = $('.base', jsv), pD = $('.draw', jsv);
    var jfx = $('#jfx'), head = $('.spark', jfx), aura = $('.aura', jfx), rings = $$('.ring', jfx), jgr = $('#jg'), gP = $('.pulses', jfx), gS = $('.sparks', jfx);
    var lastOff = -1, LEN = 0, TAB = [], CH = [], cur = 0, tgt = 0, lastHX = 0, lastHY = 0, jt = 0, built = false;
    var PAL = ['#FFFFFF', '#F5D0FE', '#F0ABFC', '#E040FB', '#A78BFA', '#5EEAD4'];
    var mk = function (tag, at, par) { var e = document.createElementNS(NS, tag); for (var k in at) e.setAttribute(k, at[k]); par.appendChild(e); return e };
    var pulses = []; for (var i = 0; i < 6; i++) pulses.push(mk('circle', { r: 7, fill: 'url(#jdot)' }, gP));
    var sparks = []; for (i = 0; i < 70; i++) sparks.push({ el: mk('circle', { r: 0, fill: PAL[i % PAL.length] }, gS), life: 0 });
    var si2 = 0, spawn = function (x, y, vx, vy, life, r) { var sp = sparks[si2 = (si2 + 1) % sparks.length]; sp.x = x; sp.y = y; sp.vx = vx; sp.vy = vy; sp.life = sp.max = life; sp.r = r };
    var burst = function (x, y, n) { for (var k = 0; k < n; k++) { var an = Math.random() * 6.283, v = 2 + Math.random() * 5; spawn(x, y, Math.cos(an) * v, Math.sin(an) * v, 40 + Math.random() * 40, 1.5 + Math.random() * 2.5) } };
    var lenAtY = function (y) {
      if (!TAB.length || y <= TAB[0][1]) return 0;
      for (var i = 1; i < TAB.length; i++) if (TAB[i][1] >= y) { var A = TAB[i - 1], B = TAB[i], f = (y - A[1]) / ((B[1] - A[1]) || 1); return A[0] + (B[0] - A[0]) * f }
      return LEN;
    };
    var buildJ = function () {
      if (innerWidth <= 780) return;
      var W = jw.offsetWidth, H = jw.offsetHeight, top0 = jw.getBoundingClientRect().top + scrollY, cx = W / 2;
      var wrapW = Math.min(1200, W - 48), gut = Math.max(100, (W - wrapW) / 4), sides = [gut, W - gut];
      CH = $$('.chapter .chap', jw).map(function (c) { var r = c.getBoundingClientRect(), sr = c.closest('.chapter').getBoundingClientRect(); return { el: c, y: r.top + scrollY - top0 + r.height / 2, end: sr.bottom + scrollY - top0 + 30 } });
      if (!CH.length) return;
      var d = 'M' + cx + ',0', y = 0;
      CH.forEach(function (c, i) {
        if (c.y - y < 640 || c.el.closest('[data-jmid]')) {   // data-jmid: keep this stretch in the middle (earnings: between the two boxes)
 d += ' L' + cx + ',' + (c.y - 16) + ' M' + cx + ',' + c.end; y = c.end; return }
        var sx = sides[i % 2], yIn = c.y - 300;
        d += ' C' + cx + ',' + (y + 190) + ' ' + sx + ',' + (y + 90) + ' ' + sx + ',' + (y + 300);
        if (yIn > y + 300) d += ' L' + sx + ',' + yIn;
        d += ' C' + sx + ',' + (c.y - 110) + ' ' + cx + ',' + (c.y - 200) + ' ' + cx + ',' + (c.y - 16);
        d += ' M' + cx + ',' + c.end; y = c.end;
      });
      var ls = sides[CH.length % 2];
      d += ' C' + cx + ',' + (y + 190) + ' ' + ls + ',' + (y + 90) + ' ' + ls + ',' + (y + 300) + ' L' + ls + ',' + Math.max(y + 320, H - 20);
      [jsv, jfx].forEach(function (v) { v.setAttribute('viewBox', '0 0 ' + W + ' ' + H); v.style.height = H + 'px' });
      pB.setAttribute('d', d); DR.forEach(function (e) { e.setAttribute('d', d) });
      LEN = pD.getTotalLength(); TAB = [];
      var lastY = -1;
      for (var i = 0; i <= 1400; i++) { var l = LEN * i / 1400, pt = pD.getPointAtLength(l); if (pt.y > lastY) { TAB.push([l, pt.y]); lastY = pt.y } }
      DR.forEach(function (e) { e.style.strokeDasharray = LEN + ' ' + LEN });
      built = true;
    };
    var loopJ = function () {
      requestAnimationFrame(loopJ);
      if (!built || document.hidden) return;
      var r = jw.getBoundingClientRect();
      if (r.bottom < -200 || r.top > innerHeight + 200) return;
      jt += 1 / 60;
      tgt = lenAtY(innerHeight * .62 - r.top);
      cur += (tgt - cur) * .1; if (Math.abs(tgt - cur) < .3) cur = tgt;
      var dOff = Math.round(LEN - cur); if (dOff !== lastOff) { lastOff = dOff; DR.forEach(function (e) { e.style.strokeDashoffset = dOff }) }
      if (Math.abs(tgt - cur) > .5) jgr.setAttribute('gradientTransform', 'translate(0,' + (cur * .35).toFixed(1) + ')');
      var on = cur > 4, hp = pD.getPointAtLength(cur), hx = hp.x, hy = hp.y;
      head.setAttribute('cx', hx); head.setAttribute('cy', hy);
      aura.setAttribute('cx', hx); aura.setAttribute('cy', hy); aura.setAttribute('r', 36 + Math.sin(jt * 5) * 8);
      rings.forEach(function (rg, k) { var ph = (jt * .9 + k * .5) % 1; rg.setAttribute('cx', hx); rg.setAttribute('cy', hy); rg.setAttribute('r', 8 + ph * 34); rg.style.opacity = on ? (1 - ph) * .9 : 0 });
      head.style.opacity = aura.style.opacity = on ? 1 : 0;
      // pulses race down the lit part
      pulses.forEach(function (pu, k) {
        if (cur < 160) { pu.style.opacity = 0; return }
        var f = (jt * .35 + k / pulses.length) % 1, pt = pD.getPointAtLength(f * cur);
        pu.setAttribute('cx', pt.x); pu.setAttribute('cy', pt.y); pu.setAttribute('r', 5 + 4 * Math.sin(f * 3.14)); pu.style.opacity = Math.min(1, (1 - f) * 4) * Math.min(1, f * 6);
      });
      // sparks trail behind the head
      var mv = Math.hypot(hx - lastHX, hy - lastHY);
      if (on) { var n = mv > 1 ? Math.min(4, 1 + mv / 6) : (Math.random() < .35 ? 1 : 0); for (var k = 0; k < n; k++) spawn(hx, hy, (Math.random() - .5) * 3 - (hx - lastHX) * .15, (Math.random() - .5) * 3 - (hy - lastHY) * .15, 30 + Math.random() * 40, 1 + Math.random() * 2.5) }
      lastHX = hx; lastHY = hy;
      sparks.forEach(function (sp) {
        if (sp.life <= 0) { if (sp.r) { sp.el.setAttribute('r', 0); sp.r = 0 } return }
        sp.life--; sp.x += sp.vx; sp.y += sp.vy; sp.vx *= .95; sp.vy = sp.vy * .95 + .04;
        var q = Math.max(0, sp.life / sp.max); sp.el.setAttribute('cx', sp.x.toFixed(1)); sp.el.setAttribute('cy', sp.y.toFixed(1)); sp.el.setAttribute('r', (sp.r * q).toFixed(2)); sp.el.style.opacity = q;
      });
      // chapter pills light up with a burst as the path reaches them
      CH.forEach(function (c) {
        var reached = hy >= c.y - 24 && cur > 10;
        if (reached && !c.lit) { c.lit = true; c.el.classList.add('lit'); burst(W2(), c.y, 34) }
        else if (!reached && c.lit && hy < c.y - 120) { c.lit = false; c.el.classList.remove('lit') }
      });
    };
    var W2 = function () { return jw.offsetWidth / 2 };
    requestAnimationFrame(loopJ);
    var rb; addEventListener('resize', function () { clearTimeout(rb); rb = setTimeout(buildJ, 200) });
    addEventListener('load', buildJ); setTimeout(buildJ, 600); setTimeout(buildJ, 2500); if (document.fonts) document.fonts.ready.then(buildJ);
  }

  // ---- live hero: WebGL nebula + neon portal + racing grid floor, thumbnails and light streaks warp out of the portal ----
  var hero = $('.thero'), gc = $('#hgl'), wc = $('#hwarp');
  if (hero && gc && wc) {
    var HW = 0, HH = 0, tmx = .7, tmy = .45, mx = .7, my = .45, portal = [.7, .45], hvel = 0, hLast = scrollY, ht0 = performance.now();
    if (fine) hero.addEventListener('mousemove', function (e) { var r = hero.getBoundingClientRect(); tmx = (e.clientX - r.left) / r.width; tmy = (e.clientY - r.top) / r.height });
    var findPortal = function () { var f = $('.fan'), r = hero.getBoundingClientRect(); if (f && r.width) { var q = f.getBoundingClientRect(); portal = [(q.left + q.width / 2 - r.left) / r.width, (q.top + q.height * .42 - r.top) / r.height] } };
    // --- WebGL layer ---
    var gl = null; try { gl = gc.getContext('webgl', { antialias: false, alpha: false }) } catch (e) {}
    var U = {}, GS = .55, lastF = 0, frames = 0, ready = false, pext = null, fAcc = 0, fN = 0;
    if (gl) {
      var der = gl.getExtension('OES_standard_derivatives');
      var vs = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
      var fs = (der ? '#extension GL_OES_standard_derivatives : enable\n' : '') + 'precision highp float;uniform vec2 R;uniform float T;uniform vec2 M;uniform vec2 C;uniform float S;' +
        'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}' +
        'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}' +
        'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}' +
        'void main(){vec2 uv=gl_FragCoord.xy/R;float ar=R.x/R.y;vec2 p=vec2((uv.x-.5)*ar,uv.y-.5);' +
        'vec2 c=vec2((C.x-.5)*ar,(1.-C.y)-.5);vec2 m=vec2((M.x-.5)*ar,(1.-M.y)-.5);float hz=.27;vec3 col=vec3(.035,.012,.09);' +
        'vec2 q=p*1.5+vec2(T*.018,0.);vec2 w=vec2(fbm(q+T*.035),fbm(q+vec2(5.2,1.3)-T*.03));float f=fbm(q+2.4*w+vec2(0.,T*.01));' +
        'vec3 neb=mix(vec3(.30,.05,.55),vec3(1.,.22,.85),smoothstep(.42,.85,f));neb=mix(neb,vec3(.2,.6,1.),smoothstep(.55,.95,w.y)*.5);' +
        'col+=neb*f*f*1.25*smoothstep(-.1,.5,uv.y-hz+.15);' +
        'vec2 sg=floor(gl_FragCoord.xy/2.);float st=h(sg);col+=vec3(1.,.9,1.)*step(.9975,st)*(.4+.6*sin(T*2.5+st*300.))*step(hz,uv.y);' +
        'vec2 dp=p-c;float d=length(dp);float an=atan(dp.y,dp.x);float rr=.26+.006*sin(T*2.);' +
        'float ring=.0035/abs(d-rr)+.0012/abs(d-rr*1.18)*(.6+.4*sin(an*3.-T*1.5));' +
        'float arcs=smoothstep(.75,1.,sin(an*2.+T*1.1))*.004/abs(d-rr*1.35)+smoothstep(.8,1.,sin(-an*3.+T*.8))*.003/abs(d-rr*.82);' +
        'col+=vec3(1.,.35,.95)*min(ring,3.)+vec3(.45,.75,1.)*min(arcs,2.);' +
        'col+=vec3(.75,.2,1.)*exp(-d*3.2)*.55*(1.+.15*sin(T*3.));' +
        'col+=vec3(.9,.4,1.)*pow(max(0.,sin(an*14.+T*.6)),12.)*exp(-d*2.4)*.35*step(rr,d);' +
        'col+=vec3(.6,.25,1.)*exp(-length(p-m)*3.5)*.22;' +
        'float hd=uv.y-hz;col+=vec3(1.,.3,.9)*(.0035/abs(hd))*.6+vec3(.8,.2,1.)*exp(-abs(hd)*14.)*.35;' +
        'if(hd<0.){float dd=-hd;float z=.32/dd;vec2 g=vec2(p.x*z*1.1+(m.x)*.4,z+T*(1.1+S));' +
        (der ? 'vec2 fw=fwidth(g);vec2 aa=abs(fract(g-.5)-.5)/max(fw,vec2(.0001));float ln=1.-min(min(aa.x,aa.y),1.);'
             : 'vec2 aa=abs(fract(g-.5)-.5);float ln=1.-smoothstep(0.,.06*z*.15+.02,min(aa.x,aa.y));') +
        'float fade=clamp(dd*5.,0.,1.);vec3 gcol=mix(vec3(1.,.25,.9),vec3(.35,.8,1.),clamp(uv.x+sin(T*.5)*.2,0.,1.));' +
        'col=col*.55+gcol*ln*fade*1.1+vec3(.35,.05,.5)*exp(-dd*7.)*.6+vec3(.8,.3,1.)*exp(-length(vec2(p.x-c.x,dd*3.))*2.5)*.25;}' +
        'col*=1.-.35*length(uv-.5);col=1.-exp(-col*1.35);gl_FragColor=vec4(col,1.);}';
      pext = gl.getExtension('KHR_parallel_shader_compile');
      var sh = function (t, src) { var o = gl.createShader(t); gl.shaderSource(o, src); gl.compileShader(o); return o };
      var v1 = sh(gl.VERTEX_SHADER, vs), f1 = sh(gl.FRAGMENT_SHADER, fs);
      var pr = gl.createProgram(); gl.attachShader(pr, v1); gl.attachShader(pr, f1); gl.linkProgram(pr);
      var finishGL = function () {
        if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { gl = null; gc.style.display = 'none'; return }
        gl.useProgram(pr);
        var bf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        var al = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(al); gl.vertexAttribPointer(al, 2, gl.FLOAT, false, 0, 0);
        ['R', 'T', 'M', 'C', 'S'].forEach(function (k) { U[k] = gl.getUniformLocation(pr, k) });
        ready = true;
      };
      var waitGL = function () { if (!gl) return; if (pext && !gl.getProgramParameter(pr, pext.COMPLETION_STATUS_KHR)) { requestAnimationFrame(waitGL); return } finishGL() };
      waitGL();
    } else gc.style.display = 'none';
    // --- warp layer: real thumbnails fly out of the portal toward you ---
    var wx = wc.getContext('2d'), IM = [], TL = [], ST = [], DPR = Math.min(devicePixelRatio || 1, 1.25), IMOK = [];
    [].forEach(function (k) { var im = new Image(); im.src = 'img/wall/w' + k + '.webp'; IM.push(im); var ok = function () { if (im.naturalWidth) IMOK.push(im) }; (im.decode ? im.decode() : new Promise(function (r) { im.onload = r })).then(ok, ok) });
    var newTile = function (far) { return { im: IMOK.length ? IMOK[(Math.random() * IMOK.length) | 0] : null, a: Math.random() * 6.283, r: .45 + Math.random() * 1.1, z: far ? 16 : 3 + Math.random() * 13, rot: (Math.random() - .5) * .5, sp: (Math.random() - .5) * .006 } };
    var newStar = function (far) { return { a: Math.random() * 6.283, r: .15 + Math.random() * 1.6, z: far ? 16 : Math.random() * 16, c: Math.random() < .5 ? '245,208,254' : (Math.random() < .5 ? '94,234,212' : '255,255,255') } };
    var small = function () { return innerWidth < 780 };
    var ti; // no flying thumbnails (Craig, Nov 10): light streaks only
    for (ti = 0; ti < 140; ti++) ST.push(newStar(false));
    var sizeH = function () { var r = hero.getBoundingClientRect(); HW = r.width; HH = r.height; wc.width = HW * DPR; wc.height = HH * DPR; gc.width = Math.round(HW * GS); gc.height = Math.round(HH * GS); if (gl) gl.viewport(0, 0, gc.width, gc.height); findPortal() };
    sizeH(); var hrb; addEventListener('resize', function () { clearTimeout(hrb); hrb = setTimeout(sizeH, 150) }); addEventListener('load', findPortal); setTimeout(findPortal, 1200);
    var rr2 = function (x, y, w, h, r) { wx.beginPath(); wx.moveTo(x + r, y); wx.arcTo(x + w, y, x + w, y + h, r); wx.arcTo(x + w, y + h, x, y + h, r); wx.arcTo(x, y + h, x, y, r); wx.arcTo(x, y, x + w, y, r); wx.closePath() };
    var heroLoop = function () {
      requestAnimationFrame(heroLoop);
      if (document.hidden || scrollY > HH + 50) return;
      var t = (performance.now() - ht0) / 1000, dv = scrollY - hLast; hLast = scrollY; hvel += (Math.abs(dv) - hvel) * .1;
      mx += (tmx - mx) * .05; my += (tmy - my) * .05;
      var boost = Math.min(hvel * .06, 2.5);
      var nowT = performance.now(); if (lastF && nowT - ht0 > 2500) { fAcc += nowT - lastF; fN++; if (fN === 20) { if (fAcc / fN > 34 && GS > .36) { GS = GS > .5 ? .42 : .33; sizeH() } else if (fAcc / fN > 34 && gl) { gl = null } fAcc = 0; fN = 0 } } lastF = nowT;
      if (++frames === 4) { gc.classList.add('live'); wc.classList.add('live') }
      if (gl && ready) { gl.uniform2f(U.R, gc.width, gc.height); gl.uniform1f(U.T, t); gl.uniform2f(U.M, mx, my); gl.uniform2f(U.C, portal[0], portal[1]); gl.uniform1f(U.S, boost); gl.drawArrays(gl.TRIANGLES, 0, 3) }
      // warp
      var Wd = wc.width, Hd = wc.height, px = (portal[0] + (mx - .5) * .04) * Wd, py = (portal[1] + (my - .5) * .04) * Hd, fo = Math.min(Wd, Hd) * .9, spd = (1 + boost) * (small() ? .7 : 1);
      wx.setTransform(1, 0, 0, 1, 0, 0); wx.clearRect(0, 0, Wd, Hd);
      wx.globalCompositeOperation = 'lighter'; wx.lineCap = 'round';
      ST.forEach(function (s0) {
        var z0 = s0.z, z1 = s0.z + .5 + boost * .6; s0.z -= .07 * spd * (1 + (16 - s0.z) * .04); if (s0.z < .3) { var ns = newStar(true); for (var k in ns) s0[k] = ns[k]; return }
        var cx0 = Math.cos(s0.a) * s0.r, cy0 = Math.sin(s0.a) * s0.r * .7;
        var al = Math.min(1, (16 - z0) / 5) * Math.min(1, z0);
        wx.strokeStyle = 'rgba(' + s0.c + ',' + (al * .85).toFixed(2) + ')'; wx.lineWidth = Math.max(.6, 3.2 / z0) * DPR;
        wx.beginPath(); wx.moveTo(px + cx0 / z0 * fo, py + cy0 / z0 * fo); wx.lineTo(px + cx0 / z1 * fo, py + cy0 / z1 * fo); wx.stroke();
      });
      wx.globalCompositeOperation = 'source-over';
      TL.sort(function (A, B) { return B.z - A.z });
      var tw = (small() ? .34 : .42);
      TL.forEach(function (tl) {
        tl.z -= .022 * spd * (1 + (16 - tl.z) * .05); tl.rot += tl.sp;
        if (tl.z < .45) { var nt = newTile(true); for (var k in nt) tl[k] = nt[k]; return }
        if (!tl.im) { if (IMOK.length) tl.im = IMOK[(Math.random() * IMOK.length) | 0]; return }
        var x = Math.cos(tl.a) * tl.r, y = Math.sin(tl.a) * tl.r * .68, sc = fo / tl.z, w = tw * sc, h = w * 9 / 16;
        var al = Math.min(1, (16 - tl.z) / 4) * Math.min(1, (tl.z - .45) / 1.4);
        if (al <= 0.01) return;
        wx.setTransform(1, 0, 0, 1, px + x * sc, py + y * sc); wx.rotate(tl.rot);
        wx.globalAlpha = al; rr2(-w / 2, -h / 2, w, h, Math.max(3, w * .04));
        wx.save(); wx.clip(); wx.drawImage(tl.im, -w / 2, -h / 2, w, h); wx.restore();
        wx.strokeStyle = 'rgba(245,208,254,.75)'; wx.lineWidth = Math.max(1, w * .006); wx.stroke();
        wx.globalAlpha = 1;
      });
      wx.setTransform(1, 0, 0, 1, 0, 0);
    };
    requestAnimationFrame(heroLoop);
  }
  })();

  // ---- hero sky changes scene every few seconds ----
  var skies = $$('.skies img');
  if (skies.length > 1) { var si = 0; setInterval(function () { skies[si].classList.remove('on'); si = (si + 1) % skies.length; skies[si].classList.add('on') }, 6500) }

  // ---- niche finder (real data) ----
  var CATS = [['Stories & drama', /stor|drama|cheat|reddit|revenge|confess|life/i], ['History', /histor|war|ancient|royal|empire|medieval|military/i], ['Money', /financ|money|business|invest|real estate|crypto|econom|wealth|side hustle/i],
    ['Science & space', /scien|space|physic|engineer|geolog|astronom|archit|aviation|nature/i], ['True crime', /crime|bodycam|police|court|interrog|murder|case|prison/i], ['Tech & AI', /tech|ai\b|computer|software|gadget|robot/i],
    ['Health & fitness', /health|fitness|diet|nutrition|medic|wellness|self improv|psycholog|sleep/i], ['Gaming', /gam|gta|minecraft|roblox|fortnite|esport/i], ['Sports', /sport|soccer|basketball|football|nba|nfl|motorsport|dart|boxing|ufc|tennis|golf/i],
    ['Cars', /car|auto|motor|truck/i], ['Food', /cook|food|recipe|bak/i], ['Animals', /animal|pet|dog|cat\b|wildlife/i], ['Mystery & horror', /myster|horror|paranormal|ghost|creep|conspir|unsolved|scary/i], ['Fun & pop culture', /comed|humor|meme|internet|challenge|prank|fan edit|celebr|movie|music|anime/i]];
  var chips = $('#chips'), res = $('#res'), kindSeg = $('#kind');
  if (chips && res) {
    var sel = {}, kind = 'L';
    chips.innerHTML = CATS.map(function (c, i) { return '<button class="chip" data-i="' + i + '" aria-pressed="false">' + c[0] + '</button>' }).join('');
    chips.addEventListener('click', function (e) { var b = e.target.closest('.chip'); if (!b) return; var i = b.dataset.i; if (sel[i]) delete sel[i]; else sel[i] = 1; b.classList.toggle('on', !!sel[i]); b.setAttribute('aria-pressed', !!sel[i]); paintF() });
    kindSeg.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; kind = b.dataset.k; $$('button', kindSeg).forEach(function (x) { x.classList.toggle('on', x === b) }); paintF() });
    var paintF = function () {
      var keys = Object.keys(sel); if (!keys.length) { res.innerHTML = '<div class="empty">Tap one or two topics above</div>'; return }
      var pool = D.niches.filter(function (n) { return n[1] === kind });
      var hit = pool.filter(function (n) { return keys.some(function (k) { return CATS[k][1].test(n[0]) }) }).sort(function (a, b) { return b[2] - a[2] });
      var note = '';
      if (!hit.length) { hit = pool.slice().sort(function (a, b) { return b[2] - a[2] }); note = '<p class="empty" style="grid-column:1/-1;min-height:auto;padding:12px;border:0">No exact match in ' + (kind === 'L' ? 'long videos' : 'Shorts') + ' this week, so here are the top-scoring ones overall.</p>' }
      res.innerHTML = note + hit.slice(0, 3).map(function (n, i) {
        return '<div class="res"><div class="ring"><svg viewBox="0 0 62 62"><circle class="bgc" cx="31" cy="31" r="27"/><circle class="fg" cx="31" cy="31" r="27" style="stroke-dasharray:170;stroke-dashoffset:170" data-s="' + n[2] + '"/></svg><b>' + n[2] + '</b></div><span class="rk">#' + (i + 1) + ' match</span><h4>' + esc(n[0]) + '</h4>'
          + '<div class="kv"><div><b>$' + n[3].toFixed(2) + '</b><span>pay per 1,000 views</span></div><div><b>' + big(n[4]) + '</b><span>median views/month</span></div><div><b>' + esc(n[6]) + '</b><span>how crowded</span></div><div><b>' + esc(n[7]) + '</b><span>effort</span></div></div>'
          + (n[8] && n[8].length ? '<p class="tops">Winning here: <b>' + n[8].map(esc).join(', ') + '</b></p>' : '') + '</div>';
      }).join('');
      $$('.res', res).forEach(function (c, i) { setTimeout(function () { c.classList.add('in'); var f = $('.fg', c); if (f) f.style.strokeDashoffset = 170 - 170 * (+f.dataset.s) / 100 }, 60 + i * 140) });
    };
    // start with two topics picked so people see it working
    [4, 1].forEach(function (i) { sel[i] = 1; var b = $('.chip[data-i="' + i + '"]', chips); b.classList.add('on'); b.setAttribute('aria-pressed', 'true') });
    var shownF = false; scrollers.push(function () { if (shownF) return; if (res.getBoundingClientRect().top < innerHeight * .9) { shownF = true; paintF() } });
  }

  // ---- product demo: real screens, a cursor that clicks, results that pop ----
  var win = $('#win');
  if (win) {
    var imgs = $$('#screens img'), cur = $('#cur'), toast = $('#toast'), tt = $('#tt'), ts = $('#ts'), bars = $$('#smini button');
    var SC = [
      { x: 30, y: 46, t: 'Your top match: Architecture', s: 'Score 72 · $3.59 per 1,000 views · not crowded' },
      { x: 62, y: 38, t: 'Open niche spotted', s: 'High demand, low crowding · top right of the radar' },
      { x: 40, y: 58, t: '47 days old · 8.7M views a month', s: 'Bodycam C4 added to your saved channels' },
      { x: 55, y: 30, t: 'Trending today: 4 topics in your niche', s: 'Get there in the first 48 hours' }
    ];
    var k = -1, timer = null, D_MS = 5200, seen = false;
    var go = function (n) {
      k = (n + SC.length) % SC.length; var s = SC[k];
      imgs.forEach(function (im, i) { im.classList.toggle('on', i === k) });
      bars.forEach(function (b, i) { b.classList.remove('on'); void b.offsetWidth; if (i === k) { b.style.setProperty('--d', D_MS + 'ms'); b.classList.add('on') } if (i < k) b.querySelector('i').style.transform = 'scaleX(1)'; else b.querySelector('i').style.transform = '' });
      toast.classList.remove('on'); cur.style.left = s.x + '%'; cur.style.top = s.y + '%';
      setTimeout(function () { cur.classList.remove('click'); void cur.offsetWidth; cur.classList.add('click') }, 1400);
      setTimeout(function () { tt.textContent = s.t; ts.textContent = s.s; toast.classList.add('on') }, 1700);
      clearTimeout(timer); if (!reduce) timer = setTimeout(function () { go(k + 1) }, D_MS);
    };
    bars.forEach(function (b, i) { b.addEventListener('click', function () { go(i) }) });
    scrollers.push(function () { if (seen) return; var r = win.getBoundingClientRect(); if (r.top < innerHeight * .8) { seen = true; go(0) } });
    // window tilts flat as it comes in
    if (!reduce && innerWidth > 780) scrollers.push(function () { var r = win.getBoundingClientRect(), p = clamp((innerHeight - r.top) / (innerHeight * .8), 0, 1), e = 1 - Math.pow(1 - p, 3); win.style.transform = 'perspective(1600px) rotateX(' + (24 * (1 - e)) + 'deg) scale(' + (.9 + .1 * e) + ')' });
  }

  (function () {
  // ---- what you get: scroll walks through every tool, the screen changes with it (tabs still clickable) ----
  var tabs = $('#tabs');
  if (tabs) {
    var gsec = $('#gets'), tb = $$('button', tabs), ind = $('.ind', tabs), panes = $$('.pane', tabs.parentNode), curP = -1, curK = -1;
    var gp = document.createElement('i'); gp.className = 'gprog'; tabs.appendChild(gp);
    var setT = function (i) { if (i === curP) { ind.style.width = tb[i].offsetWidth + 'px'; ind.style.transform = 'translateX(' + tb[i].offsetLeft + 'px)'; return } curP = i; tb.forEach(function (b, j) { b.classList.toggle('on', j === i); b.setAttribute('aria-selected', j === i) }); panes.forEach(function (p, j) { p.classList.toggle('on', j === i) }); ind.style.width = tb[i].offsetWidth + 'px'; ind.style.transform = 'translateX(' + tb[i].offsetLeft + 'px)' };
    // every tool in order, with its pane
    var STEPS = []; panes.forEach(function (pn, pi) { $$('.tool', pn).forEach(function (t) { STEPS.push({ t: t, p: pi }) }) });
    // wrap each screen so it can swap with an effect
    panes.forEach(function (pn) { var sh = $('.shot', pn), im = $('img', sh); var sc = document.createElement('div'); sc.className = 'scr'; sh.insertBefore(sc, im); sc.appendChild(im); var g = document.createElement('i'); g.className = 'glowb'; sh.appendChild(g); im.loading = 'eager' });
    var fitS = function (sc, im) {
      if (!im || !im.naturalWidth || !gsec.classList.contains('pin')) { sc.style.width = sc.style.height = ''; return }
      var maxW = sc.parentNode.clientWidth, maxH = Math.max(240, innerHeight - 250), r = im.naturalWidth / im.naturalHeight, w = maxW, h = w / r;
      if (h > maxH) { h = maxH; w = h * r }
      sc.style.width = Math.round(w) + 'px'; sc.style.height = Math.round(h) + 'px';
    };
    var refit = function () { panes.forEach(function (pn) { var sc = $('.scr', pn); if (sc) fitS(sc, [].slice.call(sc.querySelectorAll('img')).pop()) }) };
    panes.forEach(function (pn) { var im = $('.scr img', pn); if (im) { if (im.complete) fitS($('.scr', pn), im); im.addEventListener('load', function () { fitS($('.scr', pn), im) }) } });
    // the screen always ends on the picture of the tool that is lit right now, however fast you scroll
    var swap = function (pn, src) {
      var sc = $('.scr', pn); if (!sc || !src) return;
      sc.dataset.want = src;
      var top = $$('img', sc).pop();
      if (top && top.getAttribute('src') === src) return;
      var n = new Image(); n.alt = ''; n.src = src;
      var show = function () {
        if (sc.dataset.want !== src) return;
        var t = $$('img', sc).pop(); if (t && t.getAttribute('src') === src) return;
        n.className = 'nx'; sc.appendChild(n); fitS(sc, n);
        n.addEventListener('animationend', function () {
          // only clear pictures underneath this one, never a newer one on top
          for (var q = n.previousElementSibling; q;) { var pr = q.previousElementSibling; if (q.tagName === 'IMG') q.remove(); q = pr }
          n.classList.remove('nx');
        });
      };
      (n.decode ? n.decode() : Promise.resolve()).then(show, show);
    };
    var pinOn = function () { return innerWidth > 1020 && innerHeight > 600 };
    var STEP_H = .5;
    var sizeG = function () { if (pinOn()) { gsec.classList.add('pin'); gsec.style.height = (STEPS.length * STEP_H * innerHeight + innerHeight) + 'px' } else { gsec.classList.remove('pin'); gsec.style.height = '' } };
    var walk = function () {
      if (!gsec.classList.contains('pin')) return;
      var r = gsec.getBoundingClientRect(), span = gsec.offsetHeight - innerHeight, pr = clamp(-r.top / span, 0, .9999), f = pr * STEPS.length, k = Math.floor(f), sub = f - k;
      gp.style.setProperty('--gp', pr);
      var st = STEPS[k]; setT(st.p);
      if (k !== curK) {
        curK = k;
        STEPS.forEach(function (o, i) { o.t.classList.toggle('act', i === k); o.t.classList.toggle('done', o.p === st.p && i < k) });
        swap(panes[st.p], st.t.dataset.img);
      }
      st.t.style.setProperty('--tp', sub);
      var sc = $('.scr', panes[st.p]); if (sc) { sc.style.transform = 'rotateY(' + ((sub - .5) * -10).toFixed(2) + 'deg) rotateX(' + ((sub - .5) * 4).toFixed(2) + 'deg) translateY(' + ((sub - .5) * -16).toFixed(1) + 'px)'; sc.style.setProperty('--sh', (-120 + sub * 240) + '%') }
    };
    tb.forEach(function (b, i) {
      b.addEventListener('click', function () {
        if (!gsec.classList.contains('pin')) { setT(i); return }
        var first = STEPS.findIndex(function (o) { return o.p === i }), y = gsec.getBoundingClientRect().top + scrollY + (first + .05) / STEPS.length * (gsec.offsetHeight - innerHeight);
        if (lenis) lenis.scrollTo(y, { duration: 1.2 }); else scrollTo({ top: y, behavior: 'smooth' });
      });
    });
    scrollers.push(walk);
    var rz = function () { sizeG(); var c = curP < 0 ? 0 : curP; curP = -1; setT(c); walk(); refit() };
    addEventListener('resize', rz); setTimeout(rz, 60); if (document.fonts) document.fonts.ready.then(rz);
    // preload every screen so swaps are instant
    STEPS.forEach(function (o) { if (o.t.dataset.img) { var im = new Image(); im.src = o.t.dataset.img } });
  }
  })();

  // ---- Up close: a deck of real screens. The front card is flat and sharp, the next two peek out behind it;
  //      scrolling slides the front card away and the next one steps forward (no 3D tilt, so nothing blurs) ----
  (function () {
    var up = $('#upclose'); if (!up) return;
    var tr = $('.utrack', up), cs = $$('.uc', up), bar = $('.ubar', up), cnt = $('.ucount b', up), last = -1, N = cs.length;
    var pinOk = function () { return innerWidth > 780 && innerHeight > 560 };
    var size = function () {
      if (pinOk()) {
        up.classList.add('pin'); tr.style.transform = '';
        var h = 0; cs.forEach(function (c) { h = Math.max(h, c.offsetHeight) });
        tr.style.height = h + 'px';
        up.style.height = ((N - 1) * innerHeight * .2 + innerHeight * 1.1) + 'px';   // a fifth of a screen per card (was half)
        fitCv();
      } else {
        up.classList.remove('pin'); up.style.height = ''; tr.style.height = ''; tr.style.transform = '';
        cs.forEach(function (c) { c.style.transform = ''; c.style.opacity = ''; c.style.zIndex = ''; c.style.visibility = ''; c.classList.add('on') });
      }
      go();
    };
    // dust: the front card crumbles into specks that blow away to the right; scroll back and they fly home
    var stage = $('.ust', up), cv = document.createElement('canvas'), cx = cv.getContext('2d'), DP = Math.min(devicePixelRatio || 1, 1.5), dust = {}, dustOn = false;
    cv.className = 'udust'; cv.setAttribute('aria-hidden', 'true'); stage.appendChild(cv);
    var fitCv = function () { var b = stage.getBoundingClientRect(); cv.width = Math.round(b.width * DP); cv.height = Math.round(b.height * DP); cv.style.width = b.width + 'px'; cv.style.height = b.height + 'px'; dust = {} };
    var build = function (k, c) {
      var b = c.getBoundingClientRect(), w = Math.round(b.width), h = Math.round(b.height), im = $('.ui img', c), ib = im.getBoundingClientRect(), ih = Math.round(ib.height), px = null;
      try { var o = document.createElement('canvas'); o.width = w; o.height = ih; var g = o.getContext('2d'); g.drawImage(im, 0, 0, w, ih); px = g.getImageData(0, 0, w, ih).data } catch (e) { px = null }
      var P = [], st = w * h > 300000 ? 7 : 6;
      for (var y = 0; y < h; y += st) for (var x = 0; x < w; x += st) {
        var col;
        if (y < ih && px) { var i = (y * w + x) * 4; col = 'rgb(' + px[i] + ',' + px[i + 1] + ',' + px[i + 2] + ')' }
        else if (y < ih) col = 'hsl(' + (270 + Math.random() * 40) + ',60%,' + (20 + Math.random() * 40) + '%)';
        else { var q = Math.random(); col = q < .12 ? '#DCCFF7' : q < .16 ? '#E040FB' : q < .2 ? '#F0ABFC' : 'rgb(' + (34 + Math.random() * 14 | 0) + ',' + (14 + Math.random() * 8 | 0) + ',' + (62 + Math.random() * 20 | 0) + ')' }
        P.push({ x: x, y: y, c: col, th: .04 + .72 * (x / w) + Math.random() * .14 + (y / h) * .04, vx: 260 + Math.random() * 420, vy: -90 - Math.random() * 300, sw: Math.random() * 6.28, s: st * (.55 + Math.random() * .5) });
      }
      return { P: P, w: w, h: h };
    };
    var drawDust = function (k, c, t) {
      var D = dust[k] || (dust[k] = build(k, c)), b = c.getBoundingClientRect(), sb = cv.getBoundingClientRect(), ox = b.left - sb.left, oy = b.top - sb.top;
      cx.setTransform(DP, 0, 0, DP, 0, 0);
      for (var i = 0; i < D.P.length; i++) {
        var p = D.P[i]; if (t <= p.th) continue;
        var e = Math.min(1, (t - p.th) / .42); if (e >= 1) continue;
        var ee = e * e, a = 1 - e;
        cx.globalAlpha = a; cx.fillStyle = p.c;
        cx.fillRect(ox + p.x + p.vx * ee + Math.sin(p.sw + e * 6) * 26 * e, oy + p.y + p.vy * ee, p.s * (1 - e * .5), p.s * (1 - e * .5));
      }
      cx.globalAlpha = 1;
    };
    var go = function () {
      if (!up.classList.contains('pin')) return;
      var r = up.getBoundingClientRect(), span = up.offsetHeight - innerHeight, pr = clamp(-r.top / span, 0, 1), f = pr * (N - 1);
      bar.style.setProperty('--up', pr);
      if (cv.width === 0) fitCv();
      if (dustOn) { cx.setTransform(1, 0, 0, 1, 0, 0); cx.clearRect(0, 0, cv.width, cv.height); dustOn = false }
      cs.forEach(function (c, k) {
        var d = k - f, x = 0, y = 0, rot = 0, s = 1, op = 1;
        if (d < 0) {
          var t = -d;   // 0..1 = how far this card has crumbled
          if (t < 1) { var edge = ((t - .04) / .9) * 100; c.style.webkitMaskImage = c.style.maskImage = 'linear-gradient(90deg,transparent ' + edge.toFixed(1) + '%,#000 ' + (edge + 7).toFixed(1) + '%)'; drawDust(k, c, t); dustOn = true }
          op = t < 1 ? 1 : 0;
        }
        else { if (c.style.maskImage) c.style.webkitMaskImage = c.style.maskImage = ''; var e = Math.min(d, 2.6); y = -e * 32; s = 1 - e * .07; op = d <= 2 ? 1 - d * .4 : Math.max(0, .2 - (d - 2) * .5) }
        c.style.transform = 'translate(-50%,0) translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + rot.toFixed(2) + 'deg) scale(' + s.toFixed(3) + ')';
        c.style.opacity = op.toFixed(2);
        c.style.zIndex = 100 - Math.round(Math.abs(d) * 10) + (d < 0 ? 5 : 0);
        c.style.visibility = op <= 0.01 ? 'hidden' : '';
      });
      var best = clamp(Math.round(f), 0, N - 1);
      if (best !== last) { if (last >= 0) cs[last].classList.remove('on'); cs[best].classList.add('on'); last = best; cnt.textContent = (best + 1 < 10 ? '0' : '') + (best + 1) }
    };
    scrollers.push(go);
    addEventListener('resize', size); addEventListener('load', size); setTimeout(size, 80); setTimeout(size, 1500);
    var rq; $$('.uc img', up).forEach(function (im) { if (!im.complete) im.addEventListener('load', function () { clearTimeout(rq); rq = setTimeout(size, 120) }) });
  })();

  // ---- compare table opens by itself when you reach it, rows cascade in ----
  (function () {
    var d = $('#cmpT'); if (!d) return;
    $$('.ft tr', d).forEach(function (r, i) { r.style.setProperty('--i', i) });
    var done = false;
    scrollers.push(function () {
      if (done) return;
      if (d.getBoundingClientRect().top < innerHeight * .78) { done = true; d.open = true; requestAnimationFrame(function () { requestAnimationFrame(function () { d.classList.add('go') }) }) }
    });
    d.addEventListener('toggle', function () { if (d.open && !d.classList.contains('go')) { d.classList.remove('go'); requestAnimationFrame(function () { requestAnimationFrame(function () { d.classList.add('go') }) }) } if (!d.open) d.classList.remove('go') });
  })();

  // ---- highlighter marks, handwritten notes and the strike-through draw on as you reach them ----
  (function () {
    var els = $$('mark.hl, .note, s.xo'); if (!els.length) return;
    var chk = function () { els.forEach(function (e) { if (!e.classList.contains('on') && e.getBoundingClientRect().top < innerHeight * .82) e.classList.add('on') }) };
    scrollers.push(chk); setTimeout(chk, 900); setTimeout(chk, 3500);
  })();

  // ---- body copy: each word lights up as you read down the page ----
  (function () {
    var ps = $$('.chapter .sub, .cam .copy p, .uhd .sub'); if (!ps.length) return;
    var items = ps.map(function (p) {
      var walk = document.createTreeWalker(p, NodeFilter.SHOW_TEXT, null), nodes = [], n;
      while ((n = walk.nextNode())) nodes.push(n);
      nodes.forEach(function (t) {
        var parts = t.nodeValue.split(/(\s+)/), f = document.createDocumentFragment();
        parts.forEach(function (w) { if (!w) return; if (/^\s+$/.test(w)) { f.appendChild(document.createTextNode(w)); return } var s = document.createElement('span'); s.className = 'w'; s.textContent = w; f.appendChild(s) });
        t.parentNode.replaceChild(f, t);
      });
      p.classList.add('lit');
      return { p: p, ws: $$('.w', p), lit: -1 };
    });
    var go = function () {
      items.forEach(function (it) {
        var r = it.p.getBoundingClientRect();
        if (r.bottom < -100 || r.top > innerHeight + 100) return;
        var pr = clamp((innerHeight * .97 - r.top) / (r.height * .6 + innerHeight * .12), 0, 1), k = Math.round(pr * it.ws.length);
        if (k === it.lit) return;
        it.ws.forEach(function (w, i) { w.classList.toggle('on', i < k); w.classList.toggle('hot', i >= k - 3 && i < k && k < it.ws.length) });
        it.lit = k;
      });
    };
    scrollers.push(go); setTimeout(go, 300); setTimeout(go, 1500);
  })();

  // ---- before/after thumbnail ----
  var ba = $('#ba');
  if (ba) {
    var bi = $('input', ba), setC = function () { ba.style.setProperty('--c', bi.value + '%') };
    bi.addEventListener('input', setC); setC();
    if (!reduce) { var swept = 0; scrollers.push(function () { if (swept) return; if (ba.getBoundingClientRect().top < innerHeight * .65) { swept = 1; var t0 = performance.now(); (function sw(t) { var p = clamp((t - t0) / 2200, 0, 1); bi.value = 50 + Math.sin(p * Math.PI * 2) * 38 * (1 - p * .3); setC(); if (p < 1) requestAnimationFrame(sw); else { bi.value = 50; setC() } })(t0) } }) }
  }

  // ---- template wall tilts and drifts as you scroll past ----
  var tw = $('#tplw'), tp = $('#tplp');
  if (tw && tp && !reduce) scrollers.push(function () { var r = tw.getBoundingClientRect(), p = clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1); tp.style.transform = 'rotateX(' + (40 - p * 26) + 'deg) rotateZ(' + (-12 + p * 6) + 'deg) translateY(' + (60 - p * 120) + 'px)' });

  // ---- earnings estimator ----
  var eN = $('#eN');
  if (eN) {
    var L = D.niches.filter(function (n) { return n[1] === 'L' && n[3] > 0 }).sort(function (a, b) { return b[2] - a[2] });
    eN.innerHTML = L.map(function (n, i) { return '<option value="' + i + '">' + esc(n[0]) + ' · $' + n[3].toFixed(2) + ' per 1K views</option>' }).join('');
    var eU = $('#eU'), eV = $('#eV'), out = $('#eOut'), shown = 0, anim;
    var views = function () { return Math.round(Math.pow(10, 3 + (+eV.value / 100) * 3) / 100) * 100 };
    var fill = function (r) { r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min) * 100) + '%') };
    var calc = function () {
      var n = L[+eN.value] || L[0]; if (!n) return; var u = +eU.value, v = views(), mv = u * 4.33 * v, rev = mv * n[3] / 1000;
      $('#eUo').textContent = u; $('#eVo').textContent = v.toLocaleString('en-US'); $('#eMed').textContent = big(n[4]);
      $('#eMeta').textContent = big(mv) + ' views a month × $' + n[3].toFixed(2) + ' per 1,000 views';
      fill(eU); fill(eV);
      var from = shown, t0 = performance.now(); cancelAnimationFrame(anim);
      (function tw(t) { var p = clamp((t - t0) / 600, 0, 1), e = 1 - Math.pow(1 - p, 3); shown = from + (rev - from) * e; out.textContent = '$' + Math.round(shown).toLocaleString('en-US'); if (p < 1) anim = requestAnimationFrame(tw) })(t0);
    };
    [eN, eU, eV].forEach(function (el) { el.addEventListener('input', calc) }); calc();
  }

  // ---- on camera frames drift apart as you scroll ----
  var cv = $('#camvis');
  if (cv && !reduce && innerWidth > 780) {
    var fr = $$('.fr', cv);
    scrollers.push(function () { var r = cv.getBoundingClientRect(), p = clamp((innerHeight - r.top) / (innerHeight + r.height), 0, 1) - .5; fr[0].style.transform = 'translate3d(' + (p * -30) + 'px,' + (p * -60) + 'px,0) rotate(' + (p * -4) + 'deg)'; fr[1].style.transform = 'translate3d(' + (p * 30) + 'px,' + (p * 20) + 'px,0) rotate(' + (p * 3) + 'deg)'; fr[2].style.transform = 'translate3d(0,' + (p * 70) + 'px,0) rotate(' + (p * -2) + 'deg)' });
  }

  // ---- cards and screens tilt gently under the mouse ----
  if (fine && !reduce) $$('.plan,.cc,.ac,.pane .shot').forEach(function (el) {
    el.addEventListener('mousemove', function (e) { var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; el.style.transform = 'perspective(1000px) rotateY(' + (x * 5) + 'deg) rotateX(' + (-y * 5) + 'deg) translateY(-4px)' });
    el.addEventListener('mouseleave', function () { el.style.transform = '' });
  });


  // ---- screen rivers + marquees: glide on their own, speed up and lean with how fast you scroll ----
  var rows = $$('.rrow'), vel = 0, lastSY = scrollY, offs = rows.map(function () { return 0 });
  if (rows.length) {
    (function riv() {
      var sy = scrollY, dv = sy - lastSY; lastSY = sy; vel += (dv - vel) * .12;
      rows.forEach(function (r, i) {
        var dir = +r.dataset.dir || 1, half = r.scrollWidth / 2 || 1;
        offs[i] -= dir * (0.5 + Math.abs(vel) * .35);
        if (offs[i] <= -half) offs[i] += half; if (offs[i] > 0) offs[i] -= half;
        r.style.transform = 'translate3d(' + offs[i] + 'px,0,0) skewX(' + clamp(-vel * .25, -10, 10) + 'deg)';
      });
      requestAnimationFrame(riv);
    })();
  }

  // ---- hero layers move at different speeds as you scroll (depth) ----
  var hh = $('.thero h1'), hl = $('.thero .lede'), sk = $('.skies'), tfl = $('.tfloor');
  scrollers.push(function () { var y = Math.min(scrollY, innerHeight); if (hh) hh.style.transform = 'translate3d(0,' + (y * -.18) + 'px,0)'; if (hl) hl.style.transform = 'translate3d(0,' + (y * -.08) + 'px,0)'; if (sk) sk.style.transform = 'translate3d(0,' + (y * .3) + 'px,0) scale(' + (1 + y / innerHeight * .12) + ')'; if (tfl) tfl.style.transform = 'translate3d(0,' + (y * .15) + 'px,0)' });

  // ---- buttons lean toward the mouse ----
  if (fine) $$('.btn').forEach(function (b) {
    b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2; b.style.transform = 'translate(' + x * .22 + 'px,' + y * .3 + 'px)' });
    b.addEventListener('mouseleave', function () { b.style.transform = '' });
  });

  // ---- hero mouse parallax: sky and floor shift a little with the mouse ----
  if (fine) { var th = $('.thero'); if (th) th.addEventListener('mousemove', function (e) { var x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5; var pl = $('.tfloor .plane'); if (pl) pl.style.transform = 'rotateX(68deg) translate3d(' + (x * -60) + 'px,0,0)'; $$('.skies img').forEach(function (im) { im.style.translate = (x * -24) + 'px ' + (y * -16) + 'px' }) }) }

  // ---- demo video ----
  var modal = $('.modal'), vid = modal && $('video', modal);
  $$('[data-video]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); modal.classList.add('on'); modal.setAttribute('aria-hidden', 'false'); if (lenis) lenis.stop(); try { vid.currentTime = 0; vid.play() } catch (_) {} $('.x', modal).focus() }) });
  function closeV() { if (!modal || !modal.classList.contains('on')) return; modal.classList.remove('on'); modal.setAttribute('aria-hidden', 'true'); if (lenis) lenis.start(); try { vid.pause() } catch (_) {} }
  if (modal) { $('.x', modal).addEventListener('click', closeV); modal.addEventListener('click', function (e) { if (e.target === modal) closeV() }); addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeV(); closeMenu() } }) }

  onScroll(); setTimeout(onScroll, 300);
})();

// ---- hero breakout scanner: the wall drifts, the beam pops real breakout channels ----
(function(){
  var plane=document.querySelector('.sc1 .wplane'),beam=document.querySelector('.sc1 .beam'),hero=document.querySelector('.thero');
  if(!plane||!beam)return;
  var tiles=[].slice.call(document.querySelectorAll('.sc1 .tile')),y=0,bx=-200,f=0,nS=0,nH=0,elN=document.getElementById('scN'),elH=document.getElementById('scH'),seen=new Set();
  var gh=function(){return plane.firstElementChild.offsetHeight};
  (function loop(){
    requestAnimationFrame(loop);
    if(scrollY>innerHeight*1.2||document.hidden)return;
    var H=gh();y-=0.35;if(-y>=H)y+=H;
    plane.style.transform='rotateX(22deg) rotateZ(-9deg) scale(1.08) translate3d(0,'+y.toFixed(1)+'px,0)';
    var W=hero.offsetWidth;bx+=W/240;if(bx>W+260)bx=-260;
    beam.style.transform='translate3d('+bx.toFixed(0)+'px,0,0)';beam.style.opacity=Math.max(0,Math.min(1,(bx/W-.4)*5)).toFixed(2);
    if(++f%3)return;
    var now=performance.now();
    tiles.forEach(function(t,i){
      var r=t.getBoundingClientRect(),cx=r.left+r.width/2;
      if(r.bottom<0||r.top>innerHeight)return;
      if(Math.abs(cx-bx)<r.width*.45){
        if(!t._lit){t._lit=now;t.classList.add('lit');if(!seen.has(i)){seen.add(i);nS++}}
        if(t.dataset.hot&&!t._hit&&cx>W*.56&&r.top>innerHeight*.08&&r.bottom<innerHeight*.92){t._hit=now;t.classList.add('hit');nH++}
      }
      if(t._lit&&now-t._lit>500){t.classList.remove('lit');t._lit=0}
      if(t._hit&&now-t._hit>3200){t.classList.remove('hit');t._hit=0}
    });
    elN.textContent=(865).toLocaleString().length&&Math.min(865,nS*14);elH.textContent=nH;
  })();
})();
