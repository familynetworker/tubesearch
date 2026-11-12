/* v4: try it in the hero, dive into a thumbnail, open a card pack. Real channels from js/cards.js */
(function () {
  var C = null, waiters = [];
  function need(cb) {
    if (C) return cb(C);
    waiters.push(cb);
    if (need.s) return;
    need.s = document.createElement('script');
    need.s.src = 'js/cards.js?v=3y';
    need.s.onload = function () { C = window.TS_CARDS || []; waiters.splice(0).forEach(function (f) { f(C); }); };
    document.head.appendChild(need.s);
  }
  addEventListener('load', function () { setTimeout(function () { need(function () {}); }, 1200); });
  window.tsNeed = need;
  var BADV = {};
  function thumbOk(id, cb) {
    if (BADV[id]) return cb(false);
    var im = new Image(), done = false, tm = setTimeout(function () { fin(true); }, 3000);
    function fin(ok) { if (done) return; done = true; clearTimeout(tm); if (!ok) BADV[id] = 1; cb(ok); }
    im.referrerPolicy = 'no-referrer'; im.onload = function () { fin(im.naturalWidth > 120); }; im.onerror = function () { fin(false); };
    im.src = 'https://i.ytimg.com/vi/' + id + '/mqdefault.jpg';
  }
  window.tsThumbOk = thumbOk;
  function k1(n) { return n >= 1e9 ? (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B' : n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : '' + n; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function age(d) { return d < 1 ? 'Brand new' : d < 60 ? d + ' days old' : d < 730 ? Math.round(d / 30.4) + ' months old' : Math.round(d / 365) + ' years old'; }
  function thumb(id) { return 'https://i.ytimg.com/vi/' + id + '/mqdefault.jpg'; }
  // row: [name, handle, avatar, niche, mv, age, subs, outlier, vid, vtitle, vviews, cam, shorts]

  // ---------- 1. Try it ----------
  (function () {
    var f = document.getElementById('try'); if (!f) return;
    var q = document.getElementById('tryq'), out = document.getElementById('tryout');
    var scene = document.querySelector('.thero .scene'), sw = null;
    if (scene) { sw = document.createElement('div'); sw.className = 'trysweep'; scene.appendChild(sw); }
    var SYN = {
      car: 'car cars auto automotive vehicle vehicles motor truck trucks dealer driving mechanic racing',
      crime: 'crime crimes criminal murder bodycam police cop court case cases trial detective prison heist scam',
      game: 'game games gaming gamer minecraft gta roblox fortnite nintendo pokemon playstation xbox',
      money: 'money finance financial invest investing stock stocks business wealth rich economy crypto budget',
      food: 'food cook cooking recipe recipes kitchen baking chef meal',
      space: 'space universe planet planets nasa astronomy galaxy cosmos star stars',
      history: 'history historical ancient war wars empire medieval civilization',
      fit: 'fitness workout gym exercise health muscle weight yoga pilates',
      scary: 'horror scary creepy paranormal ghost ghosts haunted mystery mysteries',
      sleep: 'sleep sleepy relax relaxing asmr calm',
      story: 'story stories reddit cheating revenge drama',
      sport: 'sport sports football soccer basketball nba nfl baseball boxing ufc golf',
      animal: 'animal animals pet pets dog dogs cat cats wildlife nature',
      tech: 'tech technology ai computer computers phone gadget gadgets software',
      music: 'music song songs singer guitar piano',
      travel: 'travel trip city cities country countries places'
    };
    var GROUP = {};
    Object.keys(SYN).forEach(function (g) { SYN[g].split(' ').forEach(function (w) { (GROUP[w] = GROUP[w] || []).push(g); }); });
    function words(s) { return s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(function (w) { return w.length > 1 && 'the and for you are with that this into about'.indexOf(w) < 0; }); }
    function terms(qs) {
      var t = {};
      words(qs).forEach(function (w) {
        t[w] = 3; if (w.length > 3 && /s$/.test(w)) t[w.slice(0, -1)] = 3;
        (GROUP[w] || GROUP[w.replace(/s$/, '')] || []).forEach(function (g) { SYN[g].split(' ').forEach(function (x) { if (!t[x]) t[x] = 1; }); });
      });
      return t;
    }
    function hit(text, t) {
      var s = 0, ws = words(text);
      for (var i = 0; i < ws.length; i++) { var w = ws[i], v = t[w] || t[w.replace(/s$/, '')]; if (v) s = Math.max(s, v); }
      return s;
    }
    function search(qs) {
      var t = terms(qs), res = [];
      C.forEach(function (r) {
        var s = hit(r[3], t) * 3 + hit(r[0], t) * 2 + hit(r[9], t);
        if (s >= 3) res.push([s, r]);
      });
      res.sort(function (a, b) {
        var ga = a[1][4] / Math.max(a[1][5], 20), gb = b[1][4] / Math.max(b[1][5], 20);
        return (b[0] >= 6) - (a[0] >= 6) || gb - ga;
      });
      return res.map(function (x) { return x[1]; });
    }
    function card(r, i) {
      return '<div class="tc" style="--d:' + (i * .12) + 's"><div class="tcth"><img src="' + thumb(r[8]) + '" alt="" referrerpolicy="no-referrer"><span class="tcage">' + age(r[5]) + '</span></div>' +
        '<div class="tcb">' + (r[2] ? '<img src="' + esc(r[2]) + '" alt="" referrerpolicy="no-referrer" loading="lazy">' : '<img alt="">') + '<div><b>' + esc(r[0]) + '</b><small>' + esc(r[3] || 'Growing channel') + (r[11] ? ' · on camera' : '') + '</small></div></div>' +
        '<div class="tcst"><b>' + k1(r[4]) + '</b> views a month</div></div>';
    }
    function run(qs) {
      qs = (qs || '').trim().slice(0, 40); if (!qs) { q.focus(); return; }
      out.innerHTML = '<div class="tryhd">Scanning ' + (C ? C.length.toLocaleString() : '1,000') + ' real channels for “' + esc(qs) + '”…</div>';
      if (sw) { sw.classList.remove('go'); void sw.offsetWidth; sw.classList.add('go'); }
      need(function () {
        setTimeout(function () {
          var res = search(qs), n = res.length, show = res.slice(0, 4);
          if (!n) {
            out.innerHTML = '<button class="tryx" type="button" aria-label="Close">×</button><div class="tryhd">Nothing on our list for “' + esc(qs) + '” yet.</div><div class="tryft">Try a bigger topic, like <a href="#" data-q="money">money</a>, <a href="#" data-q="history">history</a> or <a href="#" data-q="true crime">true crime</a>. Members can also ask us to add a niche.</div>';
            return;
          }
          out.innerHTML = '<button class="tryx" type="button" aria-label="Close">×</button><div class="tryhd">Found <b>' + n + '</b> growing channel' + (n > 1 ? 's' : '') + ' for “' + esc(qs) + '”. The fastest risers:</div><div class="trygrid">' + show.map(card).join('') + '</div>' +
            '<div class="tryft">' + (n > 4 ? 'Plus ' + (n - 4) + ' more, each with its full breakdown, ' : 'Each one comes with its full breakdown ') + 'inside Tube Search. <a href="#pricing">Get in</a></div>';
          [].forEach.call(out.querySelectorAll('.tc'), function (c) { var im = c.querySelector('.tcth img'); function chk() { if (!im.naturalWidth || im.naturalWidth <= 120) c.remove(); } im.addEventListener('error', function () { c.remove(); }); if (im.complete) chk(); else im.addEventListener('load', chk); });
          if (innerWidth <= 1020) setTimeout(function () { out.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, 300);
        }, 750);
      });
    }
    f.addEventListener('submit', function (e) { e.preventDefault(); run(q.value); });
    [f, out].forEach(function (el) { el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-q]'); if (!b) return;
      e.preventDefault(); q.value = b.getAttribute('data-q'); run(q.value);
    }); });
    q.addEventListener('focus', function () { need(function () {}); });
    function shut() {
      if (!out.firstChild || out.classList.contains('bye')) return;
      out.classList.add('bye');
      setTimeout(function () { out.innerHTML = ''; out.classList.remove('bye'); }, 280);
    }
    out.addEventListener('click', function (e) { if (e.target.closest('.tryx')) shut(); });
    document.addEventListener('click', function (e) { if (!e.target.closest('#tryout') && !e.target.closest('#try')) shut(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') shut(); });
  })();

  // ---------- 2. Dive: a wall of real thumbnails, the scanner picks the one blowing up, zoom in, its real blueprint ----------
  (function () {
    var sec = document.getElementById('dive'); if (!sec) return;
    var CH = [
      { n: 'Below The Map', v: 'RWdyANQ-rXc', age: 25, mv: '3.6M', img: 'img/app/bp_belowmap.webp', w: 2232, h: 1669, b: [[4.2, 17.4, 45.2, 35.4], [50.6, 17.4, 45.2, 35.4], [4.2, 54.5, 45.2, 40.1], [50.6, 54.5, 45.2, 40.1]] },
      { n: 'Bodycam C4', v: 'xhH61s9aCDo', age: 47, mv: '8.7M', img: 'img/app/bp_bodycam.webp', w: 2232, h: 1760, b: [[4.2, 23.8, 45.2, 33.6], [50.6, 23.8, 45.2, 33.6], [4.2, 59, 45.2, 38], [50.6, 59, 45.2, 38]] },
      { n: 'Undertold', v: 'KSTqoSQEl-4', age: 18, mv: '2.5M', img: 'img/app/bp_undertold.webp', w: 2232, h: 1760, b: [[4.2, 23.8, 45.2, 33.6], [50.6, 23.8, 45.2, 33.6], [4.2, 59, 45.2, 38], [50.6, 59, 45.2, 38]] },
      { n: 'Drifty', v: 'sQ0fDvAs0TI', age: 113, mv: '14.9M', img: 'img/app/bp_drifty.webp', w: 2232, h: 1608, b: [[4.2, 18.1, 45.2, 36.8], [50.6, 18.1, 45.2, 36.8], [4.2, 56.6, 45.2, 37.8], [50.6, 56.6, 45.2, 37.8]] }
    ];
    var last = -1; try { last = +localStorage.getItem('tsDive'); } catch (e) {}
    var k = Math.floor(Math.random() * CH.length); if (k === last) k = (k + 1) % CH.length;
    try { localStorage.setItem('tsDive', k); } catch (e) {}
    var X = CH[k], AR = X.w / X.h;
    var th = sec.querySelector('.dvthumb'), im = th.querySelector('img'), sc = th.querySelector('.scan'), wall = sec.querySelector('.dvwall'), beam = wall.querySelector('.dvbeam'),
      app = sec.querySelector('.dvapp'), ai = app.querySelector('img'), c1 = sec.querySelector('.dvc1'), c2 = sec.querySelector('.dvc2'), fl = sec.querySelector('.dvflash'),
      hls = [].slice.call(sec.querySelectorAll('.dvhl')), bars = [].slice.call(sec.querySelectorAll('.dvprog b')), ticking = false, TW = 0;
    im.src = 'https://i.ytimg.com/vi/' + X.v + '/maxresdefault.jpg'; im.alt = X.n + ', a real channel ' + X.age + ' days old';
    th.querySelector('.bd').textContent = X.age + ' days old · ' + X.mv + ' views a month';
    th.querySelector('.cn').textContent = X.n;
    ai.src = X.img; ai.alt = 'The Tube Search blueprint for ' + X.n;
    hls.forEach(function (h, i) { var b = X.b[i]; h.style.left = b[0] + '%'; h.style.top = b[1] + '%'; h.style.width = b[2] + '%'; h.style.height = b[3] + '%'; });
    im.addEventListener('error', function () { if (!/hqdefault/.test(im.src)) im.src = im.src.replace(/[a-z0-9]+\.jpg$/, 'hqdefault.jpg'); });
    // the wall: real thumbnails from the hero scanner, the chosen channel sits in the middle cell
    var srcs = [].map.call(document.querySelectorAll('.sc1 .tile img'), function (i) { return i.src; }).filter(function (s) { return s.indexOf(X.v) < 0; });
    srcs.sort(function () { return Math.random() - .5; });
    var COLS = 0, ROWS = 0;
    function buildWall() {
      var ph = innerWidth < 700, c = ph ? 5 : 9, r = ph ? 9 : 5;
      if (c === COLS && r === ROWS) return;
      COLS = c; ROWS = r;
      [].slice.call(wall.querySelectorAll('.dvt')).forEach(function (e) { e.remove(); });
      var mid = Math.floor(r / 2) * c + Math.floor(c / 2), n = 0, html = '';
      for (var i = 0; i < c * r; i++) html += i === mid ? '<span class="dvt dvmid"></span>' : '<span class="dvt"><img src="' + (srcs[n++ % Math.max(1, srcs.length)] || '') + '" alt="" loading="lazy" referrerpolicy="no-referrer"></span>';
      wall.insertAdjacentHTML('afterbegin', html);
      wall.style.gridTemplateColumns = 'repeat(' + c + ',var(--tw))';
    }
    function cl(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
    function seg(p, a, b) { return cl((p - a) / (b - a)); }
    function ease(x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
    function size() {
      buildWall();
      var vw = innerWidth, vh = innerHeight, ph = vw < 700;
      TW = ph ? vw * .46 : Math.min(vw * .24, 330);
      sec.style.setProperty('--tw', TW + 'px'); sec.style.setProperty('--tg', (TW * .08) + 'px');
      th.style.width = TW + 'px'; th.style.marginLeft = (-TW / 2) + 'px'; th.style.marginTop = (-TW * 9 / 32) + 'px';
      var maxW = vw * (ph ? .94 : .86), maxH = vh * (ph ? .46 : .56), w = Math.min(maxW, maxH * AR), h = w / AR;
      app.style.width = w + 'px'; app.style.height = h + 'px'; app.style.marginLeft = (-w / 2) + 'px'; app.style.marginTop = (-h / 2 + (ph ? vh * .1 : vh * .12)) + 'px';
    }
    var T0X = 20, T0Y = -12;
    function draw() {
      ticking = false;
      var r = sec.getBoundingClientRect(), span = r.height - innerHeight;
      if (r.bottom < 0 || r.top > innerHeight) return;
      var p = cl(-r.top / span);
      // 1) the scanner beam sweeps the wall and stops on the channel that's blowing up
      var bs = seg(p, .0, .13);
      beam.style.left = (50 * ease(bs)) + '%'; beam.style.opacity = p < .02 ? 0 : 1 - seg(p, .15, .2);
      th.classList.toggle('hit', p > .125);
      // 2) the rest of the wall falls back, the chosen one lifts out and straightens up
      var w = seg(p, .17, .48);
      wall.style.opacity = 1 - .9 * w;
      wall.style.transform = 'translate(-50%,-50%) rotateX(' + T0X + 'deg) rotateY(' + T0Y + 'deg) translateZ(' + (-320 * w) + 'px)';
      var a = ease(seg(p, .17, .5)), nat = im.naturalWidth || 480,
        sharp = nat / (TW * Math.min(devicePixelRatio || 1, 2)) * 1.12,
        big = Math.max(1.4, Math.min(innerWidth < 700 ? 2.1 : 2.6, sharp));
      var lift = seg(p, .125, .17);
      th.style.transform = 'rotateX(' + (T0X * (1 - a)) + 'deg) rotateY(' + (T0Y * (1 - a)) + 'deg) translateZ(' + (30 * lift) + 'px) scale(' + (1 + .08 * lift + (big - 1) * a) + ')';
      th.style.opacity = 1 - seg(p, .52, .62);
      th.style.filter = 'brightness(' + (.62 + .38 * lift + .4 * seg(p, .4, .52)) + ')';
      sc.style.top = (-25 + 130 * seg(p, .2, .42)) + '%';
      c1.style.opacity = 1 - seg(p, .2, .3); sec.style.setProperty('--capbg', 1 - seg(p, .2, .32)); c1.style.transform = 'translateY(' + (-40 * seg(p, .2, .3)) + 'px)';
      // 3) flash into the real blueprint, then light up its parts one by one
      fl.style.opacity = Math.sin(Math.PI * seg(p, .46, .62)) * .8;
      var b = ease(seg(p, .52, .7));
      app.style.opacity = b; app.style.transform = 'scale(' + (1.2 - .2 * b) + ')';
      var c = seg(p, .6, .7); c2.style.opacity = c; c2.style.transform = 'translateY(' + (30 * (1 - c)) + 'px)';
      hls.forEach(function (h, i) { h.classList.toggle('on', p > .72 + i * .06); });
      bars.forEach(function (x, i) { x.style.transform = 'scaleX(' + seg(p, i / bars.length, (i + 1) / bars.length) + ')'; });
    }
    function tick() { if (!ticking) { ticking = true; requestAnimationFrame(draw); } }
    addEventListener('scroll', tick, { passive: true });
    addEventListener('resize', function () { size(); tick(); });
    im.addEventListener('load', tick);
    size(); draw();
  })();

  // ---------- 3. Card pack ----------
  (function () {
    var sec = document.getElementById('packs'); if (!sec) return;
    var pack = document.getElementById('pack'), box = document.getElementById('pkcards'), again = document.getElementById('pkagain'),
      burst = sec.querySelector('.pkburst'), used = {}, busy = false, opened = false;
    var R = {
      leg: { name: 'LEGENDARY', rc: '#FDE047', bg: 'linear-gradient(135deg,#FEF08A,#EAB308 30%,#FDE047 55%,#A16207 80%,#FEF08A)' },
      epic: { name: 'EPIC', rc: '#F0ABFC', bg: 'linear-gradient(135deg,#F0ABFC,#C026D3 35%,#7C3AED 70%,#F0ABFC)' },
      rare: { name: 'RARE', rc: '#67E8F9', bg: 'linear-gradient(135deg,#A5F3FC,#0891B2 40%,#1E3A8A 75%,#67E8F9)' },
      com: { name: 'COMMON', rc: '#CBD5E1', bg: 'linear-gradient(135deg,#E2E8F0,#64748B 45%,#334155 80%,#CBD5E1)' }
    };
    function tier(r) { return r[5] && r[5] <= 120 && r[4] >= 2e6 ? 'leg' : r[5] && r[5] <= 365 && r[4] >= 1e6 ? 'epic' : r[4] >= 5e5 ? 'rare' : 'com'; }
    function pick(list, n) {
      var out = [], tries = 0;
      while (out.length < n && tries++ < 400) {
        var r = list[Math.floor(Math.random() * list.length)];
        if (!r || used[r[8]] || out.indexOf(r) >= 0) continue;
        out.push(r);
      }
      return out;
    }
    function deal() {
      var by = { leg: [], epic: [], rare: [], com: [] };
      C.forEach(function (r) { if (!r[12]) by[tier(r)].push(r); });
      if (Object.keys(used).length > C.length - 40) used = {};
      var hand = pick(by.rare.concat(by.com, by.com), 3).concat(pick(by.epic, 1), pick(by.leg, 1));
      hand.forEach(function (r) { used[r[8]] = 1; });
      deal.by = by;
      return hand;   // the last card is the legendary
    }
    function verify(hand, cb, tries) {
      var left = hand.length, bad = [];
      hand.forEach(function (r, i) { window.tsThumbOk(r[8], function (ok) { if (!ok) bad.push(i); if (--left) return;
        if (!bad.length || (tries || 0) > 9) return cb(hand);
        bad.forEach(function (i) { var t = tier(hand[i]), pool = i === 4 ? deal.by.leg : i === 3 ? deal.by.epic : deal.by.rare.concat(deal.by.com), n = pick(pool, 1)[0]; if (n) { used[n[8]] = 1; hand[i] = n; } });
        verify(hand, cb, (tries || 0) + 1); }); });
    }
    function cardHtml(r, t, n) {
      var x = R[t];
      return '<div class="hcin"><div class="hcb"><b>TS</b></div><div class="hcf" style="--rbg:' + x.bg + ';--rc:' + x.rc + '"><div class="hcp">' +
        '<div class="hcr">' + x.name + '<em>#' + n + '</em></div>' +
        '<div class="hcth"><img src="' + thumb(r[8]) + '" alt="" referrerpolicy="no-referrer"></div>' +
        '<div class="hcn">' + (r[2] ? '<img src="' + esc(r[2]) + '" alt="" referrerpolicy="no-referrer">' : '<img alt="">') + '<div><b>' + esc(r[0]) + '</b><small>' + esc(r[3] || 'Growing channel') + '</small></div></div>' +
        '<div class="hcs"><div><b>' + k1(r[4]) + '</b>views/mo</div><div><b>' + (r[5] ? (r[5] < 730 ? r[5] : Math.round(r[5] / 365) + 'y') : '?') + '</b>' + (r[5] && r[5] < 730 ? 'days old' : 'old') + '</div><div><b>' + k1(r[6]) + '</b>subs</div><div><b>' + k1(r[10]) + '</b>top video</div></div>' +
        '</div></div></div>';
    }
    function spots() {
      var ph = innerWidth < 700;
      if (ph) return [[-84, -258, -4], [84, -258, 4], [-84, 0, -3], [84, 0, 3], [0, 258, 0]];
      var g = Math.min(236, (Math.min(innerWidth, 1300) - 240) / 4);
      return [[-2 * g, 34, -9], [-g, 8, -4.5], [g, 8, 4.5], [2 * g, 34, 9], [0, -6, 0]];
    }
    function holo(el) {
      el.addEventListener('pointermove', function (e) {
        var b = el.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
        el.style.setProperty('--hx', (x * 100) + '%'); el.style.setProperty('--hy', (y * 100) + '%'); el.style.setProperty('--ho', .95);
        el.querySelector('.hcin').style.transform = 'rotateY(' + (180 + (x - .5) * 24) + 'deg) rotateX(' + ((.5 - y) * 18) + 'deg)';
      });
      el.addEventListener('pointerleave', function () { el.style.removeProperty('--ho'); el.querySelector('.hcin').style.transform = ''; });
    }
    function open() {
      if (busy) return; busy = true; opened = true;
      need(function () { verify(deal(), go); });
      function go(hand) {
        var S = spots();
        box.innerHTML = '';
        pack.classList.remove('gone'); pack.classList.add('shake');
        setTimeout(function () { pack.classList.remove('shake'); pack.classList.add('torn'); burst.className = 'pkburst'; void burst.offsetWidth; burst.className = 'pkburst go'; }, 450);
        setTimeout(function () {
          pack.classList.add('gone');
          hand.forEach(function (r, i) {
            var t = tier(r), el = document.createElement('div');
            el.className = 'hc ' + t; el.innerHTML = cardHtml(r, t, C.indexOf(r) + 1);
            el.style.transform = 'translateY(60px) scale(.6) rotate(' + (i * 3 - 6) + 'deg)'; el.style.opacity = '0';
            box.appendChild(el);
            setTimeout(function () { el.style.opacity = '1'; el.style.transform = 'translate(' + S[i][0] + 'px,' + S[i][1] + 'px) rotate(' + S[i][2] + 'deg)'; }, 60 + i * 110);
          });
        }, 1050);
        var order = [0, 3, 1, 2, 4];
        order.forEach(function (ix, k) {
          setTimeout(function () {
            if (k === order.length - 1) { again.hidden = false; busy = false; }
            var el = box.children[ix]; if (!el) return;
            el.classList.add('flip'); holo(el);
            if (ix === 4) { burst.className = 'pkburst gold'; void burst.offsetWidth; burst.className = 'pkburst gold go'; }
          }, 2050 + k * (k === order.length - 1 ? 520 : 380));
        });
      }
    }
    function reset() {
      if (busy) return;
      [].forEach.call(box.children, function (el) { el.style.opacity = '0'; el.style.transform += ' translateY(80px)'; });
      again.hidden = true;
      setTimeout(function () { pack.classList.remove('torn', 'gone'); setTimeout(open, 500); }, 420);
    }
    pack.addEventListener('click', open);
    again.addEventListener('click', reset);
  })();
})();

/* ---- path monster: a glowing play-button monster rides the purple path as you scroll ---- */
(function () {
  var jfx = document.getElementById('jfx'); if (!jfx) return;
  var head = jfx.querySelector('.spark'); if (!head) return;
  var m = document.createElement('div'); m.className = 'jmon'; m.setAttribute('aria-hidden', 'true');
  m.classList.add('tim', 'p-front');
  m.innerHTML = '<div class="jmf">' +
    '<div class="tp tp-front"><img class="t-top" src="img/tim/front.webp" alt=""><img class="t-legL" src="img/tim/front.webp" alt=""><img class="t-legR" src="img/tim/front.webp" alt=""></div>' +
    '<div class="tp tp-side"><img class="t-top" src="img/tim/side.webp" alt=""><img class="t-legs" src="img/tim/side.webp" alt=""><img class="t-legs t-legs2" src="img/tim/side.webp" alt=""></div>' +
    '<div class="tp tp-back"><img src="img/tim/back.webp" alt=""></div>' +
    '<div class="tp tp-bend"><img src="img/tim/bend.webp" alt=""></div>' +
    '</div><b class="jtap">🔊 Tap me!</b>';
  jfx.parentNode.appendChild(m);
  var lx = null, ly = null, face = 1, tilt = 0, still = 0, lit = 0, pup = null, jf = m.firstChild, pose = 'front';
  var TXT = [], zAt = 0, op = 1;   // text on the page (page coordinates): Tim stays on the path and turns see-through while he passes over writing
  function zones() { TXT = []; [].forEach.call(document.querySelectorAll('main h1,main h2,main h3,main h4,main h5,main p,main li,main label,main .note,main .btn,main .chap,main .cap'), function (e) {
    var r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return; TXT.push([r.left, r.top + scrollY, r.right, r.bottom + scrollY]); }); }
  // ---- the fart gag ----
  var fnd = document.getElementById('fnd'), farted = false, hold = null, glide = 0, ac = null;
  var FRAW = null, FBUF = null;
  try { fetch('media/fart.mp3').then(function (r) { return r.arrayBuffer(); }).then(function (b) { FRAW = b; decode(); }).catch(function () {}); } catch (e) {}
  function decode() { if (ac && FRAW && !FBUF && !decode.busy) { decode.busy = 1; ac.decodeAudioData(FRAW.slice(0)).then(function (b) { FBUF = b; }, function () { decode.busy = 0; }); } }
  function audio() { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) {} decode(); return ac; }
  function soundOn() { return !!(ac && ac.state === 'running'); }
  window.tsAudio = audio; window.tsSoundOn = soundOn;
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { addEventListener(ev, function () { audio(); }, { passive: true }); });   // browsers only allow sound after a tap or click
  // A fart, made in code: a fast, uneven train of little flaps (40-110 a second) that each ring for a few
  // milliseconds, a wobble in pitch, an attack and a fade, and a few sputters at the end. No noise rumble.
  function fartSamples(sr, R) {
    R = R || Math.random;
    var dur = .7 + R() * .55, n = Math.floor(sr * dur), d = new Float32Array(n);
    var f0 = 70 + R() * 35, wob = 1.2 + R() * 1.6, drop = .55 + R() * .25, tt = .015;
    var fA = 160 + R() * 70, fB = 420 + R() * 160, fC = 850 + R() * 300, decay = .0028 + R() * .0015;
    function env(p) { return p < .05 ? p / .05 : p > .82 ? Math.max(0, (1 - p) / .18) : 1 - .25 * p; }
    while (tt < dur - .02) {
      var p = tt / dur, f = f0 * (1 + .28 * Math.sin(p * Math.PI * 2 * wob)) * (p > .7 ? drop : 1) * (1 + (R() - .5) * .45);
      if (p > .68 && R() < .16) { tt += 3.5 / f; continue; }                       // sputter: a little gap
      var s0 = Math.floor(tt * sr), amp = env(p) * (.55 + R() * .45), len = Math.floor(sr * .014);
      for (var i = 0; i < len && s0 + i < n; i++) {
        var x = i / sr, e = Math.exp(-x / decay);
        d[s0 + i] += amp * e * (Math.sin(6.2832 * fA * x) * .85 + Math.sin(6.2832 * fB * x) * .38 + Math.sin(6.2832 * fC * x) * .12);
      }
      tt += 1 / f;
    }
    var pk = 0; for (var k = 0; k < n; k++) pk = Math.max(pk, Math.abs(d[k]));
    for (k = 0; k < n; k++) d[k] = d[k] / (pk || 1) * .9;
    return d;
  }
  function fartSound() {
    var c = ac; if (!c || c.state !== 'running') return false;
    if (FBUF) { var s0 = c.createBufferSource(); s0.buffer = FBUF; s0.playbackRate.value = .95 + Math.random() * .1; var g0 = c.createGain(); g0.gain.value = 1; s0.connect(g0); g0.connect(c.destination); s0.start(c.currentTime + .02); return true; }
    var d = fartSamples(c.sampleRate), buf = c.createBuffer(1, d.length, c.sampleRate); buf.getChannelData(0).set(d);
    var src = c.createBufferSource(); src.buffer = buf; src.playbackRate.value = .92 + Math.random() * .16;
    var hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 55;
    var v = c.createGain(); v.gain.value = .75;
    src.connect(hp); hp.connect(v); v.connect(c.destination); src.start(c.currentTime + .02);
    return true;
  }
  function puffs(x, y, dir) {
    var par = m.parentNode;
    for (var i = 0; i < 9; i++) (function (i) {
      setTimeout(function () {
        var e = document.createElement('i'); e.className = 'jgas'; par.appendChild(e);
        var sz = 18 + Math.random() * 26, dx = -dir * (30 + Math.random() * 70), dy = 10 - Math.random() * 50;
        e.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + sz + 'px;height:' + sz + 'px';
        e.animate([{ transform: 'translate(-50%,-50%) scale(.3)', opacity: .95 }, { transform: 'translate(calc(-50% + ' + dx + 'px),calc(-50% + ' + dy + 'px)) scale(1.9)', opacity: 0 }],
          { duration: 1100 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = function () { e.remove(); };
      }, i * 70);
    })(i);
    var w = document.createElement('b'); w.className = 'jpfft'; w.textContent = 'PFFFT!'; w.style.left = (x - dir * 70) + 'px'; w.style.top = (y - 46) + 'px'; par.appendChild(w);
    setTimeout(function () { w.remove(); }, 1500);
  }
  var looked = false;
  var stops = [].slice.call(document.querySelectorAll('[data-tim]'));
  function stopAt(el) {   // a new feature: stop, face the visitor, say the line, hold the page a moment, then carry on
    hold = { busy: true }; var L = window.lenis; if (L && L.stop) L.stop();
    var tb = m.querySelector('.jtap');
    m.classList.remove('run', 'ask', 'p-side'); m.classList.add('p-front', 'said', 'yay'); pose = 'front';
    tb.textContent = el.getAttribute('data-tim');
    setTimeout(function () {
      m.classList.remove('said', 'yay'); tb.textContent = '\uD83D\uDD0A Tap me!';
      hold = null; glide = 1; if (L && L.start) L.start();
    }, 2300);
  }
  function lookLeft() {   // at the earnings sliders: stop, turn toward "Drag Your Sliders Here", then carry on
    hold = { busy: true }; var L = window.lenis; if (L && L.stop) L.stop();
    var tb = m.querySelector('.jtap'), wasAsk = m.classList.contains('ask');
    m.classList.remove('run', 'ask', 'p-front'); m.classList.add('p-side', 'look', 'said'); pose = 'side'; face = -1; m.style.setProperty('--face', -1);
    tb.textContent = '👈 Try your sliders!';
    setTimeout(function () {
      m.classList.remove('look', 'said'); tb.textContent = '🔊 Tap me!';
      hold = null; glide = 1; if (L && L.start) L.start();
    }, 1900);
  }
  function fart(lockPage) {
    if (hold && hold.busy) return;
    var tr = m.style.transform; hold = { tr: tr, busy: true }; m.classList.remove('ask');
    var L = window.lenis; if (lockPage && L && L.stop) L.stop();
    m.classList.remove('run'); m.classList.add('turn');                       // 1) turns its back
    setTimeout(function () {
      m.classList.add('toot');                                               // 2) wiggles and lets one rip
      var r = m.getBoundingClientRect(), pr = m.parentNode.getBoundingClientRect();
      puffs(r.left - pr.left + r.width * .2, r.top - pr.top + r.height * .36, 1);
      fartSound();
    }, 380);
    setTimeout(function () { m.classList.remove('toot', 'turn'); m.classList.add('shy'); }, 1450);   // 3) turns back, blushing
    setTimeout(function () {
      m.classList.remove('shy'); hold = null; glide = 1;
      if (lockPage && L && L.start) L.start();
    }, 2100);
  }
  m.addEventListener('click', function () { audio(); setTimeout(function () { fart(false); }, 60); });
  function loop() {
    requestAnimationFrame(loop);
    var on = head.style.opacity === '1' && jfx.getBoundingClientRect().width > 0;
    if (m.classList.contains('on') !== on) m.classList.toggle('on', on);
    if (on && !hold && !m.classList.contains('ask')) m.classList.add('ask');   // Tap me! is always there: a tap always gets a fart
    if (!on) { lx = null; if (op !== 1) { op = 1; m.style.opacity = ''; } return; }
    var hx = +head.getAttribute('cx'), hy = +head.getAttribute('cy');
    var now = performance.now();
    if (now - zAt > 900) { zAt = now; zones(); }
    if (lx === null) { lx = hx; ly = hy; }
    var vx = hx - lx, vy = hy - ly; lx = hx; ly = hy;
    var sp = Math.hypot(vx, vy);
    if (Math.abs(vx) > .6) face = vx < 0 ? -1 : 1;
    tilt += (Math.max(-8, Math.min(8, vx * 1.2)) - tilt) * .15;
    var np = still < 8 && Math.abs(vx) > Math.abs(vy) * .9 ? 'side' : 'front';
    if (np !== pose && !hold) { m.classList.remove('p-' + pose); m.classList.add('p-' + np); pose = np; }
    still = sp > .4 ? 0 : still + 1;
    if (m.classList.contains('run') !== (still < 8)) m.classList.toggle('run', still < 8);
    var jr = jfx.getBoundingClientRect(), pr = m.parentNode.getBoundingClientRect();
    if (hold) { if (op !== 1) { op = 1; m.style.opacity = 1; } return; }       // standing still for the gag (always fully visible)
    var est = document.querySelector('.est');
    if (!looked && est) { var er = est.getBoundingClientRect(); if (er.width && hy + jr.top >= er.top + 190 && er.bottom > 0) { looked = true; lookLeft(); return; } }
    for (var si = 0; si < stops.length; si++) { var se = stops[si]; if (se._tim) continue; var sr = se.getBoundingClientRect();
      if (sr.width && hy + jr.top >= sr.top + 40 && sr.bottom > 0) { se._tim = 1; stopAt(se); return; } }
    if (!farted && fnd) { var fr = fnd.getBoundingClientRect(); if (fr.width && hy + jr.top >= fr.top + 230 && fr.bottom > 0) { farted = true; fart(true); return; } }
    var tx = hx + jr.left - pr.left - 34, ty = hy + jr.top - pr.top - 118;
    var cur = (m._p || [tx, ty]), dist = Math.hypot(tx - cur[0], ty - cur[1]);   // ease toward the path point: no jumps, ever
    var k = glide > 0 ? .2 : dist > 220 ? .09 : .3; glide = Math.max(0, glide - .04);
    tx = cur[0] + (tx - cur[0]) * k; ty = cur[1] + (ty - cur[1]) * k;
    m._p = [tx, ty];
    var mr = jf.getBoundingClientRect(), pad = 6, over = false, L0 = mr.left + 14, R0 = mr.right - 14, T0 = mr.top + scrollY + 10, B0 = mr.bottom + scrollY - 4;
    for (var ti = 0; ti < TXT.length; ti++) { var q = TXT[ti]; if (q[0] < R0 - pad && q[2] > L0 + pad && q[1] < B0 - pad && q[3] > T0 + pad) { over = true; break; } }
    op += ((over ? .14 : 1) - op) * .18; m.style.opacity = op.toFixed(3);
    m.style.transform = 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px) rotate(' + tilt.toFixed(1) + 'deg)';
    if (!hold) m.style.setProperty('--face', face);   // only the side view reads this; the front view can never be flipped
    var n = document.querySelectorAll('.chapter .chap.lit').length;
    if (n > lit) { m.classList.remove('yay'); void m.offsetWidth; m.classList.add('yay'); }
    lit = n;
  }
  requestAnimationFrame(loop);
  setInterval(function () { if (!m.classList.contains('on')) return; m.classList.add('blink'); setTimeout(function () { m.classList.remove('blink'); }, 160); }, 3200);
})();

/* ---- YOUR TURN: the final headline built from hundreds of real thumbnails that fly in and lock into place ---- */
(function () {
  var cv = document.getElementById('yturn'); if (!cv) return;
  var ctx = cv.getContext('2d'), TXT = [], tiles = [], imgs = [], started = false, t0 = 0, done = false, W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 2), flashT = 0;
  function layout() {
    var ph = innerWidth < 700, cssW = cv.parentNode.clientWidth;
    var COLS = ph ? 40 : 84, lines = ph ? ['YOUR', 'TURN'] : ['YOUR TURN'], ROWS = ph ? 16 : 21, GAP = ph ? 3 : 0;
    var cw = cssW / COLS, ch = cw * 9 / 16, totalRows = ROWS * lines.length + GAP * (lines.length - 1);
    W = cssW; H = Math.ceil(totalRows * ch);
    cv.style.width = W + 'px'; cv.style.height = H + 'px'; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    var o = document.createElement('canvas'); o.width = Math.ceil(W); o.height = H; var g = o.getContext('2d');
    g.fillStyle = '#000'; g.textAlign = 'center'; g.textBaseline = 'middle';
    var LS = cw * 1.6, FH = getComputedStyle(document.documentElement).getPropertyValue('--fh').trim() || 'Rubik, sans-serif'; TXT = [];
    lines.forEach(function (ln, i) {
      var fs = ROWS * ch * 1.18; g.letterSpacing = LS + 'px'; g.font = '900 ' + fs + 'px ' + FH;
      var w = g.measureText(ln).width; if (w > W * .96) { fs *= W * .96 / w; g.font = '900 ' + fs + 'px ' + FH; }
      var ty = (i * (ROWS + GAP) + ROWS / 2) * ch + ch * .4, tx = W / 2 + LS / 2;
      g.fillText(ln, tx, ty); TXT.push({ ln: ln, font: g.font, x: tx, y: ty, ls: LS });
    });
    var d = g.getImageData(0, 0, o.width, o.height).data; tiles = [];
    for (var r = 0; r < totalRows; r++) for (var c = 0; c < COLS; c++) {
      var px = Math.min(o.width - 1, Math.floor((c + .5) * cw)), py = Math.min(H - 1, Math.floor((r + .5) * ch));
      if (d[(py * o.width + px) * 4 + 3] > 110) tiles.push({ x: c * cw, y: r * ch, w: cw, h: ch, i: Math.floor(Math.random() * 999), dl: (c / COLS) * 900 + Math.random() * 500, sx: Math.random() * W, sy: (Math.random() - .5) * H * 2.5, rot: (Math.random() - .5) * 2.4, glow: 0 });
    }
    if (done) draw(1e12);
  }
  function ease(x) { return 1 - Math.pow(1 - x, 4); }
  function draw(now) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    var all = true;
    tiles.forEach(function (t) {
      var k = Math.max(0, Math.min(1, (now - t0 - t.dl) / 900)); if (k < 1) all = false; if (k <= 0) return;
      var e = ease(k), x = t.sx + (t.x - t.sx) * e, y = t.sy + (t.y - t.sy) * e, s = 2.6 - 1.6 * e;
      ctx.save(); ctx.globalAlpha = Math.min(1, k * 2.5);
      ctx.translate(x + t.w / 2, y + t.h / 2); ctx.rotate(t.rot * (1 - e)); ctx.scale(s, s);
      var im = imgs.length ? imgs[t.i % imgs.length] : null;
      if (im && im.complete && im.naturalWidth > 120) ctx.drawImage(im, -t.w / 2 + .5, -t.h / 2 + .5, t.w - 1, t.h - 1);
      else { ctx.fillStyle = 'hsl(' + (285 + (t.i % 40)) + ',85%,' + (45 + t.i % 25) + '%)'; ctx.fillRect(-t.w / 2 + .5, -t.h / 2 + .5, t.w - 1, t.h - 1); }
      if (t.glow > 0) { ctx.globalAlpha = t.glow; ctx.fillStyle = '#fff'; ctx.fillRect(-t.w / 2, -t.h / 2, t.w, t.h); t.glow = Math.max(0, t.glow - .04); }
      ctx.restore();
    });
    ctx.globalCompositeOperation = 'source-atop';
    var gr = ctx.createLinearGradient(0, 0, W, H); gr.addColorStop(0, 'rgba(240,171,252,.42)'); gr.addColorStop(.5, 'rgba(224,64,251,.34)'); gr.addColorStop(1, 'rgba(139,92,246,.44)');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    if (flashT) {
      var q = Math.min(1, (now - flashT) / 700);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      TXT.forEach(function (t) {
        ctx.font = t.font; ctx.letterSpacing = t.ls + 'px';
        var tg = ctx.createLinearGradient(0, t.y - H / 2, 0, t.y + H / 2); tg.addColorStop(0, 'rgba(255,255,255,' + (.34 * q) + ')'); tg.addColorStop(1, 'rgba(240,171,252,' + (.3 * q) + ')');
        ctx.fillStyle = tg; ctx.fillText(t.ln, t.x, t.y);
      });
    }
    if (flashT) { var f = (now - flashT) / 900; if (f < 1) { var sx = -W * .3 + f * W * 1.6, sg = ctx.createLinearGradient(sx - 120, 0, sx + 120, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.5, 'rgba(255,255,255,.85)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H); } }
    ctx.globalCompositeOperation = 'source-over';
    if (flashT) {
      ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,' + (.8 * Math.min(1, (now - flashT) / 700)) + ')';
      TXT.forEach(function (t) { ctx.font = t.font; ctx.letterSpacing = t.ls + 'px'; ctx.strokeText(t.ln, t.x, t.y); });
      ctx.letterSpacing = '0px';
    }
    return all;
  }
  function vis() { var r = cv.getBoundingClientRect(); return r.bottom > -50 && r.top < innerHeight + 50; }
  function loop(now) {
    requestAnimationFrame(loop);
    if (!started || document.hidden || !vis()) return;
    var all = draw(now);
    if (all && !done) { done = true; flashT = now; cv.classList.add('locked'); }
    if (done && Math.random() < .12 && tiles.length) tiles[Math.floor(Math.random() * tiles.length)].glow = .55;
  }
  function loadImgs() {
    var C = window.TS_CARDS || [], pick = C.filter(function (r) { return !r[12]; }).sort(function () { return Math.random() - .5; }).slice(0, 48);
    var ids = pick.length ? pick.map(function (r) { return r[8]; }) : [].map.call(document.querySelectorAll('.sc1 .tile img'), function (i) { return (i.src.match(/vi\/([^/]+)\//) || [])[1]; }).filter(Boolean);
    imgs = ids.map(function (id) { var im = new Image(); im.referrerPolicy = 'no-referrer'; im.decoding = 'async'; im.src = 'https://i.ytimg.com/vi/' + id + '/mqdefault.jpg'; return im; });
  }
  function check() {
    if (started) return;
    var r = cv.getBoundingClientRect();
    if (r.top < innerHeight * 1.6 && !imgs.length) loadImgs();
    if (r.top < innerHeight * .78) { started = true; t0 = performance.now(); }
  }
  function go() { layout(); check(); addEventListener('scroll', check, { passive: true }); requestAnimationFrame(loop); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layout, 200); });
})();

/* ---- pricing cards: dealt face down and flipped over when you reach them, tilt + holo shine on hover ---- */
(function () {
  var box = document.querySelector('.pcards'); if (!box) return;
  function chk() { if (box.classList.contains('dealt')) return; if (box.getBoundingClientRect().top < innerHeight * .8) box.classList.add('dealt'); }
  addEventListener('scroll', chk, { passive: true }); setTimeout(chk, 600);
  if (!matchMedia('(hover:hover)').matches) return;
  [].forEach.call(box.querySelectorAll('.plan.pc'), function (c) {
    c.addEventListener('pointermove', function (e) {
      if (!box.classList.contains('dealt')) return;
      var b = c.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
      c.classList.add('tilt');
      c.style.transform = 'rotateY(' + ((x - .5) * 14).toFixed(1) + 'deg) rotateX(' + ((.5 - y) * 10).toFixed(1) + 'deg) translateY(-6px)';
      c.style.setProperty('--hx', (x * 100) + '%'); c.style.setProperty('--hy', (y * 100) + '%');
    });
    c.addEventListener('pointerleave', function () { c.classList.remove('tilt'); c.style.transform = ''; });
  });
})();

/* ---- Guess the views: two real videos, tap the one with more views, 3 rounds with a streak ---- */
(function () {
  var board = document.getElementById('gvboard'); if (!board || !window.tsNeed) return;
  var msg = document.getElementById('gvmsg'), nx = document.getElementById('gvnext'), rnd = document.querySelector('.gvround b'), stk = document.querySelector('.gvstreak'), stb = stk.querySelector('b');
  var BAD = /dead|death|die[sd]?\b|kill|murder|blood|sex|nude|naked|porn|fuck|shit|bitch|rape|abuse|corpse|suicide|predator|harass/i;
  var round = 0, score = 0, streak = 0, pairs = [], used = {};
  function k1(n) { return n >= 1e9 ? (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B' : n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : '' + n; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function makePairs(C) {
    var by = {};
    var ROY = /royal|prince|princess|queen|king charles|meghan|harry|minutes ago/i;
    C.forEach(function (r) { if (r[12] || !r[8] || !r[9] || r[10] < 30000 || BAD.test(r[9]) || BAD.test(r[0]) || ROY.test(r[9]) || ROY.test(r[3])) return; (by[r[3]] = by[r[3]] || []).push(r); });
    var out = [], keys = Object.keys(by).filter(function (k) { return by[k].length > 1; }).sort(function () { return Math.random() - .5; });
    for (var i = 0; i < keys.length && out.length < 3; i++) {
      var L = by[keys[i]].sort(function () { return Math.random() - .5; }), got = null;
      for (var a = 0; a < L.length && !got; a++) for (var b = a + 1; b < L.length && !got; b++) {
        var x = L[a], y = L[b], hi = Math.max(x[10], y[10]), lo = Math.min(x[10], y[10]);
        if (hi / lo >= 2.2 && !used[x[8]] && !used[y[8]] && x[0] !== y[0]) got = [x, y];
      }
      if (got) { used[got[0][8]] = used[got[1][8]] = 1; out.push(got); }
    }
    return out;
  }
  function card(r, i) {
    return '<button class="gvc" type="button" data-i="' + i + '" style="--d:' + (i * .12) + 's"><span class="gvok"></span><span class="gvth"><img src="https://i.ytimg.com/vi/' + r[8] + '/hqdefault.jpg" alt="" referrerpolicy="no-referrer"></span>' +
      '<span class="gvb"><span class="gvt">' + esc(r[9]) + '</span><span class="gvch">' + esc(r[0]) + '</span><span class="gvv q">? views</span></span></button>';
  }
  function show(tries) {
    var P = pairs[round];
    if (!P._ok) {
      var left = 2, okAll = true;
      [P[0][8], P[1][8]].forEach(function (id) { window.tsThumbOk(id, function (ok) { if (!ok) okAll = false; if (--left) return;
        if (okAll || (tries || 0) > 4) { P._ok = 1; return show(tries); }
        window.tsNeed(function (C) { var np = makePairs(C)[0]; if (np) pairs[round] = np; show((tries || 0) + 1); }); }); });
      return;
    }
    rnd.textContent = round + 1; msg.textContent = ''; nx.hidden = true;
    board.innerHTML = card(P[0], 0) + '<span class="gvvs">VS</span>' + card(P[1], 1);
  }
  function count(el, to) {
    var t0 = performance.now(), d = 1100;
    (function f(now) { var k = Math.min(1, (now - t0) / d), e = 1 - Math.pow(1 - k, 3); el.textContent = k1(Math.round(to * e)) + ' views'; if (k < 1) requestAnimationFrame(f); })(t0);
  }
  board.addEventListener('click', function (e) {
    var b = e.target.closest('.gvc'); if (!b || b.disabled) return;
    var P = pairs[round], i = +b.dataset.i, win = P[0][10] > P[1][10] ? 0 : 1, cs = board.querySelectorAll('.gvc');
    [].forEach.call(cs, function (c, k) {
      c.disabled = true; c.classList.add(k === win ? 'win' : 'lose'); if (k === i) c.classList.add('picked');
      c.querySelector('.gvok').textContent = k === win ? 'MORE VIEWS' : 'NOPE';
      var v = c.querySelector('.gvv'); v.classList.remove('q'); count(v, P[k][10]);
    });
    var ratio = (Math.max(P[0][10], P[1][10]) / Math.min(P[0][10], P[1][10])).toFixed(1).replace(/\.0$/, '');
    if (i === win) { score++; streak++; msg.innerHTML = '<b>Nailed it.</b> That one got ' + ratio + 'x the views.'; }
    else { streak = 0; msg.innerHTML = '<i>Not this time.</i> The other one got ' + ratio + 'x the views.'; }
    stb.textContent = streak; stk.classList.toggle('hot', streak >= 2);
    nx.innerHTML = round < 2 ? 'Next round <span class="arr">→</span>' : 'See my score <span class="arr">→</span>';
    setTimeout(function () { nx.hidden = false; }, 900);
  });
  nx.addEventListener('click', function () {
    round++;
    if (round < 3) return show();
    nx.hidden = true; msg.textContent = '';
    var line = score === 3 ? 'Perfect score. You have a good eye.' : score === 2 ? 'Not bad at all.' : score === 1 ? 'YouTube is sneaky like that.' : 'Rough round. Happens to everyone.';
    board.innerHTML = '<div class="gvend" style="grid-column:1/-1"><div class="gvsc">' + score + ' of 3</div><h3>' + line + '</h3><p>Tube Search knows this before you post. It shows you which videos win in your niche, and why, so you never have to guess.</p>' +
      '<div class="row"><a class="btn btn-b" href="#pricing">Get Tube Search <span class="arr">→</span></a><button class="btn btn-g" type="button" id="gvagain">Play again</button></div></div>';
  });
  board.addEventListener('click', function (e) { if (e.target.closest('#gvagain')) start(); });
  function start() {
    window.tsNeed(function (C) {
      round = 0; score = 0; streak = 0; stb.textContent = 0; stk.classList.remove('hot');
      pairs = makePairs(C);
      if (pairs.length < 3) { used = {}; pairs = makePairs(C); }
      if (pairs.length < 3) { board.innerHTML = ''; return; }
      show();
    });
  }
  var started = false;
  function near() { if (started) return; if (board.getBoundingClientRect().top < innerHeight * 1.5) { started = true; start(); } }
  addEventListener('scroll', near, { passive: true }); setTimeout(near, 800);
})();


/* ---- End screen: the video just ended. Up next autoplay ring, Watch next list, Subscribe bell, Like, Share ---- */
(function () {
  var yp = document.getElementById('yp'); if (!yp) return;
  var wg = yp.querySelector('.yp-wg'), ring = document.getElementById('ypRing'), lbl = document.getElementById('ypLbl'), meta = document.getElementById('ypMeta'), cancel = document.getElementById('ypCancel');
  var srcs = [].map.call(document.querySelectorAll('.sc1 .tile img'), function (i) { return i.src; });
  if (srcs.length) {
    var h = ''; for (var i = 0; i < 48; i++) h += '<img src="' + srcs[(i * 7) % srcs.length] + '" alt="" loading="lazy" referrerpolicy="no-referrer">';
    wg.innerHTML = h;
    
  }
  var LEN = 276.5, T = 8000, t0 = 0, raf = 0, state = 'wait', line = document.getElementById('ypLine'), sec = document.getElementById('endscreen'), card = yp.querySelector('.yp-card');
  var LL = line ? line.getTotalLength() : 300; if (line) { line.style.strokeDasharray = LL; line.style.strokeDashoffset = LL; }
  yp.classList.add('pre'); var fl = document.createElement('i'); fl.className = 'yp-flash'; yp.appendChild(fl);
  // floating real thumbnails around the player
  var orb = sec.querySelector('.es-orbit');
  if (orb && srcs.length) {
    var SP = [[2, 8, 190], [-3, 46, 160], [6, 78, 210], [84, 4, 200], [88, 40, 170], [80, 74, 220], [14, 30, 120], [74, 26, 130], [20, 88, 140], [66, 90, 150]], oh = '';
    SP.forEach(function (q, i) { oh += '<span style="--l:' + q[0] + '%;--t:' + q[1] + '%;--w:' + q[2] + 'px;--r:' + ((i % 2 ? 1 : -1) * (4 + i % 4 * 3)) + 'deg;--o:' + (q[2] > 160 ? .55 : .35) + ';--d:' + (i * .08) + 's;--f:' + (5 + i % 4) + 's;--fx:' + ((i % 3 - 1) * 14) + 'px;--fy:' + (i % 2 ? -18 : 16) + 'px"><img src="' + srcs[(i * 11 + 5) % srcs.length] + '" alt="" loading="lazy" referrerpolicy="no-referrer"></span>'; });
    orb.innerHTML = oh;
    var spans = [].slice.call(orb.children);
    addEventListener('scroll', function () { var r = sec.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return; var c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight; spans.forEach(function (e, i) { e.style.setProperty('--py', (c * (30 + i % 4 * 25)).toFixed(1) + 'px'); }); }, { passive: true });
  }
  function sparks() {
    var b = card.getBoundingClientRect(), y = yp.getBoundingClientRect(), cx = b.left - y.left + b.width / 2, cy = b.top - y.top + b.height / 2;
    var sh = document.createElement('i'); sh.className = 'yp-shock'; sh.style.left = cx + 'px'; sh.style.top = cy + 'px'; yp.appendChild(sh); setTimeout(function () { sh.remove(); }, 1000);
    for (var i = 0; i < 46; i++) {
      var d = document.createElement('i'), an = Math.random() * 6.283, r = 120 + Math.random() * 320, sz = 4 + Math.random() * 6;
      d.className = 'yp-spark'; d.style.left = cx + 'px'; d.style.top = cy + 'px'; d.style.width = d.style.height = sz + 'px';
      d.style.background = ['#F0ABFC', '#5EEAD4', '#FDE047', '#fff', '#E040FB'][i % 5]; d.style.boxShadow = '0 0 10px ' + d.style.background;
      yp.appendChild(d);
      d.animate([{ transform: 'translate(-50%,-50%)', opacity: 1 }, { transform: 'translate(' + (Math.cos(an) * r - sz / 2) + 'px,' + (Math.sin(an) * r * .7 + 40 - sz / 2) + 'px) scale(.2)', opacity: 0 }], { duration: 900 + Math.random() * 700, easing: 'cubic-bezier(.15,.8,.3,1)' }).onfinish = function () { this.effect.target.remove(); };
    }
  }
  function tick(now) {
    var k = Math.min(1, (now - t0) / T);
    ring.style.strokeDashoffset = (LEN * (1 - k)).toFixed(1); if (line) line.style.strokeDashoffset = (LL * (1 - k)).toFixed(1);
    if (k < 1 && state === 'run') raf = requestAnimationFrame(tick);
    else if (k >= 1) { state = 'done'; yp.classList.add('done'); sparks(); lbl.textContent = 'Up next · ready when you are'; cancel.hidden = true; }
  }
  function start() { if (state !== 'wait') return; state = 'run'; yp.classList.add('on'); t0 = performance.now(); raf = requestAnimationFrame(tick); }
  var lit = false;
  var bw = document.getElementById('bw'), urlEl = document.getElementById('bwUrl');
  function power() {
    if (lit) return; lit = true; sec.classList.add('lit');
    if (!bw || !urlEl) { yp.classList.add('crt'); setTimeout(start, 1100); return; }
    var full = 'tubesearch.app', n = 0; urlEl.textContent = ''; bw.classList.add('typing');
    setTimeout(function typeIt() {
      urlEl.textContent = full.slice(0, ++n);
      if (n < full.length) return setTimeout(typeIt, 55 + Math.random() * 60);
      setTimeout(function () {
        bw.classList.remove('typing'); bw.classList.add('loading');
        setTimeout(function () { bw.classList.add('loaded'); yp.classList.add('crt'); setTimeout(start, 1100); }, 900);
      }, 250);
    }, 700);
  }
  cancel.addEventListener('click', function () {
    cancelAnimationFrame(raf); state = 'cancel'; ring.style.strokeDashoffset = LEN; if (line) line.style.strokeDashoffset = 0;
    lbl.textContent = 'Autoplay canceled'; meta.textContent = 'Your channel will wait. (Not forever, but it’ll wait.)'; cancel.hidden = true;
  });
  function chk() { if (!lit && yp.getBoundingClientRect().top < innerHeight * .72) power(); }
  addEventListener('scroll', chk, { passive: true }); setTimeout(chk, 900);
  // Like: a little burst, remembered on this device
  var like = document.getElementById('ypLike'), liked = false;
  try { liked = localStorage.getItem('tsLiked') === '1'; } catch (e) {}
  function paint() { like.classList.toggle('on', liked); like.setAttribute('aria-pressed', liked); like.querySelector('span').textContent = liked ? 'Liked' : 'Like'; }
  paint();
  like.addEventListener('click', function () {
    liked = !liked; paint(); try { localStorage.setItem('tsLiked', liked ? '1' : '0'); } catch (e) {}
    if (!liked) return;
    for (var i = 0; i < 12; i++) {
      var d = document.createElement('i'), an = Math.random() * 6.283, r = 30 + Math.random() * 30;
      d.className = 'yp-burst'; d.style.background = ['#F0ABFC', '#5EEAD4', '#FDE047', '#fff'][i % 4];
      like.appendChild(d);
      d.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(' + Math.cos(an) * r + 'px,' + Math.sin(an) * r + 'px) scale(.3)', opacity: 0 }], { duration: 650, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = function () { this.effect.target.remove(); };
    }
  });
  // Share: the phone's share sheet when there is one, otherwise copy the link
  var share = document.getElementById('ypShare');
  share.addEventListener('click', function () {
    var url = location.origin + location.pathname;
    function toast(t) { var o = share.querySelector('.yp-toast'); if (o) o.remove(); var e = document.createElement('span'); e.className = 'yp-toast'; e.textContent = t; share.appendChild(e); setTimeout(function () { e.remove(); }, 1800); }
    if (navigator.share) { navigator.share({ title: 'Tube Search', text: 'Copy what’s already working on YouTube', url: url }).catch(function () {}); return; }
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { toast('Link copied'); }, function () { toast(url); });
    else toast(url);
  });
})();

/* ---- team photo: color floods in, name tags pop up, spotlight on hover, gentle mouse parallax ---- */
(function () {
  var tm = document.querySelector('.team.tm'); if (!tm) return;
  var tags = [].slice.call(tm.querySelectorAll('.tm-tag')), img = tm.querySelector('img');
  function chk() { if (tm.classList.contains('go')) return; if (tm.getBoundingClientRect().top < innerHeight * .72) tm.classList.add('go'); }
  addEventListener('scroll', chk, { passive: true }); setTimeout(chk, 700);
  function spot(tag) {
    tags.forEach(function (t) { t.classList.toggle('on', t === tag); });
    if (!tag) { tm.classList.remove('spot'); return; }
    var ih = img.getBoundingClientRect(), th = tm.getBoundingClientRect(), x = +tag.dataset.x, y = +tag.dataset.y;
    tm.style.setProperty('--sx', (x * 100) + '%'); tm.style.setProperty('--sy', ((ih.top - th.top + (y + .2) * ih.height) / th.height * 100) + '%');
    tm.classList.add('spot');
  }
  tags.forEach(function (t) { t.addEventListener('mouseenter', function () { spot(t); }); t.addEventListener('focus', function () { spot(t); }); t.addEventListener('click', function () { spot(t.classList.contains('on') && !matchMedia('(hover:hover)').matches ? null : t); }); });
  // hovering a person on the photo lights them up too
  tm.addEventListener('pointermove', function (e) {
    var b = img.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
    tm.classList.add('mv'); tm.style.setProperty('--px', ((.5 - x) * 14).toFixed(1) + 'px'); tm.style.setProperty('--py', ((.5 - y) * 8).toFixed(1) + 'px');
    if (e.target.closest('.tm-tag') || e.target.closest('.cap')) return;
    if (y < 0 || y > .75) return spot(null);
    var best = null, bd = .1; tags.forEach(function (t) { var d = Math.abs(+t.dataset.x - x); if (d < bd) { bd = d; best = t; } });
    spot(best);
  });
  tm.addEventListener('pointerleave', function () { spot(null); tm.style.setProperty('--px', '0px'); tm.style.setProperty('--py', '0px'); });
})();

/* ---- browser sidebar: real breakout videos (pictures checked first) ---- */
(function () {
  var list = document.getElementById('bwList'); if (!list || !window.tsNeed) return;
  var BAD = /dead|death|kill|murder|blood|sex|nude|naked|porn|fuck|shit|bitch|rape|abuse|corpse|suicide|predator|harass/i;
  function k1(n) { return n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : '' + n; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function age(d) { return d < 60 ? d + ' days old' : Math.round(d / 30.4) + ' months old'; }
  var done = false;
  function fill() {
    if (done) return; done = true;
    window.tsNeed(function (C) {
      var ROY = /royal|prince|princess|queen|king charles|meghan|harry|minutes ago/i; var pool = C.filter(function (r) { return !r[12] && r[5] && r[5] <= 240 && r[4] >= 1e6 && r[9] && !BAD.test(r[9]) && !BAD.test(r[0]) && !ROY.test(r[9]) && !ROY.test(r[3]) && !ROY.test(r[0]); }).sort(function () { return Math.random() - .5; });
      var picked = [], i = 0, want = 6, busy = 0;
      (function next() {
        while (busy < 4 && i < pool.length && picked.length + busy < want) {
          (function (r) { busy++; window.tsThumbOk(r[8], function (ok) { busy--; if (ok && picked.length < want) { picked.push(r); add(r, picked.length - 1); } next(); }); })(pool[i++]);
        }
      })();
    });
  }
  function add(r, idx) {
    var a = document.createElement('a'); a.className = 'bw-it'; a.href = '#pricing'; a.style.setProperty('--i', idx);
    a.innerHTML = '<span class="bw-th"><img src="https://i.ytimg.com/vi/' + r[8] + '/mqdefault.jpg" alt="" referrerpolicy="no-referrer"><em>BREAKOUT</em><span class="bw-hv">Find channels like this in Tube Search</span></span>' +
      '<span class="bw-tx"><b>' + esc(r[9]) + '</b><small>' + esc(r[0]) + '<br>' + k1(r[10]) + ' views · channel ' + age(r[5]) + '</small></span>';
    list.appendChild(a);
  }
  function chk() { if (list.getBoundingClientRect().top < innerHeight * 2) fill(); }
  addEventListener('scroll', chk, { passive: true }); setTimeout(chk, 1500);
})();

/* ---- jump-to bar: shows once you're past the top, lights the section you're in ---- */
(function () {
  var bar = document.getElementById('jump'); if (!bar) return;
  var links = [].slice.call(bar.querySelectorAll('a')), secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  var last = -2, ticking = false;
  function paint() {
    ticking = false;
    var cur = -1; secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < innerHeight * .4) cur = i; });
    bar.classList.toggle('on', cur >= 0);   // first shows at Find (its first stop), hides again above it
    if (cur === last) return; last = cur;
    links.forEach(function (a, i) { a.classList.toggle('on', i === cur); });
    if (cur >= 0 && bar.scrollWidth > bar.clientWidth) { var a = links[cur]; bar.scrollTo({ left: a.offsetLeft - bar.clientWidth / 2 + a.offsetWidth / 2, behavior: 'smooth' }); }
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
  paint();
})();

/* ---- plans on phones: swipe sideways, start on Pro (our pick) ---- */
(function () {
  var box = document.querySelector('.prices.pcards'); if (!box || innerWidth > 700) return;
  var pro = box.querySelector('.plan.best');
  function center() { if (pro) box.scrollLeft = pro.offsetLeft - (box.clientWidth - pro.offsetWidth) / 2; }
  addEventListener('load', center); setTimeout(center, 300);
})();

/* ---- tool box: on computers it pins for about 4 screens and your scroll walks through Find, Plan, Make and Grow;
        on phones it plays by itself. Click any tab or tool to jump. ---- */
(function () {
  var box = document.getElementById('tbx'), sec = document.getElementById('toolbox'); if (!box || !sec) return;
  var tabs = [].slice.call(box.querySelectorAll('.tbx-tab')), panes = [].slice.call(box.querySelectorAll('.tbx-pane')),
    imgs = [].slice.call(box.querySelectorAll('.tbx-img')), ind = box.querySelector('.tbx-ind'), now = box.querySelector('.tbx-now'),
    play = box.querySelector('.tbx-play'), prog = box.querySelector('.tbx-prog i'), shine = box.querySelector('.tbx-shine');
  var ALL = []; panes.forEach(function (p, t) { [].slice.call(p.querySelectorAll('.tbx-tool')).forEach(function (el, k) { ALL.push({ t: t, k: k, el: el }); }); });
  var T = 0, I = -1, front = 0, timer = 0, DUR = 4200, left = DUR, started = 0, hover = false, seen = false, PIN = false, SCREENS = 4;
  function moveInd() { var b = tabs[T]; ind.style.width = b.offsetWidth + 'px'; ind.style.transform = 'translateX(' + b.offsetLeft + 'px)'; }
  // the picture on screen crumbles into dust that blows away (like the Up close deck) while the next one fades in
  var scr = box.querySelector('.tbx-scr'), dcv = document.createElement('canvas'), dcx = dcv.getContext('2d'), DPR = Math.min(devicePixelRatio || 1, 1.5), dustRun = 0;
  dcv.className = 'tbx-dust'; dcv.setAttribute('aria-hidden', 'true'); scr.appendChild(dcv);
  function dust(img) {
    if (!img.naturalWidth) return;
    var sr = scr.getBoundingClientRect(), r = img.getBoundingClientRect(), w = Math.round(r.width), h = Math.round(r.height);
    if (w < 20 || h < 20) return;
    var pad = 260;
    dcv.width = Math.round((sr.width + pad * 2) * DPR); dcv.height = Math.round((sr.height + pad * 2) * DPR);
    dcv.style.width = (sr.width + pad * 2) + 'px'; dcv.style.height = (sr.height + pad * 2) + 'px'; dcv.style.left = -pad + 'px'; dcv.style.top = -pad + 'px';
    var px = null; try { var o = document.createElement('canvas'); o.width = w; o.height = h; var g = o.getContext('2d'); g.drawImage(img, 0, 0, w, h); px = g.getImageData(0, 0, w, h).data; } catch (e) { return; }
    var st = w * h > 260000 ? 7 : 6, P = [], ox = r.left - sr.left + pad, oy = r.top - sr.top + pad;
    for (var y = 0; y < h; y += st) for (var x = 0; x < w; x += st) {
      var i = (y * w + x) * 4; if (px[i + 3] < 20) continue;
      P.push({ x: ox + x, y: oy + y, c: 'rgb(' + px[i] + ',' + px[i + 1] + ',' + px[i + 2] + ')', th: .05 + .6 * (x / w) + Math.random() * .2, vx: 160 + Math.random() * 300, vy: -60 - Math.random() * 200, sw: Math.random() * 6.28, s: st * (.6 + Math.random() * .5) });
    }
    var run = ++dustRun, t0 = performance.now(), D = 1100;
    (function frame(now) {
      if (run !== dustRun) return;
      var t = (now - t0) / D;
      dcx.setTransform(DPR, 0, 0, DPR, 0, 0); dcx.clearRect(0, 0, dcv.width, dcv.height);
      if (t >= 1.5) return;
      for (var k = 0; k < P.length; k++) {
        var q = P[k], e = (t - q.th) / .5;
        if (e >= 1) continue;
        if (e <= 0) { dcx.globalAlpha = 1; dcx.fillStyle = q.c; dcx.fillRect(q.x, q.y, st, st); continue; }   // not loose yet: still part of the picture
        var ee = e * e; dcx.globalAlpha = 1 - e; dcx.fillStyle = q.c;
        dcx.fillRect(q.x + q.vx * ee + Math.sin(q.sw + e * 6) * 18 * e, q.y + q.vy * ee, q.s * (1 - e * .5), q.s * (1 - e * .5));
      }
      dcx.globalAlpha = 1; requestAnimationFrame(frame);
    })(t0);
  }
  function show(src) {
    var cur = imgs[front]; if (cur.getAttribute('src') === src) return;
    var nx = imgs[1 - front], pre = new Image();
    pre.onload = pre.onerror = function () {
      dust(cur);
      cur.classList.remove('on');
      nx.src = src; void nx.offsetWidth; nx.classList.add('on');
      front = 1 - front;
    };
    pre.src = src;
  }
  function set(i, fromScroll) {
    if (i === I) return;
    var dir = i < I ? -1 : 1, x = ALL[i]; I = i;
    if (x.t !== T) { tabs[T].classList.remove('on'); panes[T].classList.remove('on'); T = x.t; tabs[T].classList.add('on'); panes[T].classList.add('on'); moveInd(); }
    box.querySelectorAll('.tbx-tool.on').forEach(function (e) { e.classList.remove('on'); });
    void x.el.offsetWidth; x.el.classList.add('on');
    show(x.el.dataset.img);
    if (now) now.innerHTML = '<b>' + x.el.querySelector('.tx b').textContent.replace(/Pro$/, '').trim() + '</b> · ' + x.el.querySelector('.tx small').textContent;
    if (innerWidth <= 860 && x.el.parentNode.scrollWidth > x.el.parentNode.clientWidth) x.el.parentNode.scrollTo({ left: x.el.offsetLeft - 12, behavior: 'smooth' });
    if (!PIN && !fromScroll) { left = DUR; tick(); }
  }
  // ---- computers: the scroll drives it ----
  function size() {
    PIN = innerWidth > 860 && innerHeight > 600;
    sec.classList.toggle('pin', PIN); box.classList.toggle('scrolly', PIN);
    sec.style.height = PIN ? (innerHeight * (SCREENS + 1)) + 'px' : '';
    if (PIN) { clearTimeout(timer); play.textContent = 'Keep scrolling to walk through every tool, or tap one'; }
    moveInd(); onScroll();
  }
  function frac() { var r = sec.getBoundingClientRect(), span = sec.offsetHeight - innerHeight; return Math.max(0, Math.min(1, -r.top / span)); }
  function onScroll() {
    if (!PIN) return look();
    var f = frac(), pos = f * ALL.length, i = Math.min(ALL.length - 1, Math.floor(pos));
    set(i, true);
    var b = ALL[i].el.querySelector('.bar'); if (b) b.style.transform = 'scaleX(' + Math.min(1, pos - i).toFixed(3) + ')';
    if (prog) prog.style.transform = 'scaleX(' + f.toFixed(3) + ')';
  }
  function jumpTo(i) {
    if (!PIN) return set(i);
    var top = sec.getBoundingClientRect().top + scrollY, span = sec.offsetHeight - innerHeight, y = top + span * (i + .5) / ALL.length;
    if (window.lenis && lenis.scrollTo) lenis.scrollTo(y, { duration: .8 }); else scrollTo({ top: y, behavior: 'smooth' });
  }
  // ---- phones: plays by itself while on screen ----
  function next() { set((I + 1) % ALL.length); }
  function tick() {
    clearTimeout(timer); if (PIN) return;
    if (hover || !seen) { box.classList.add('paused'); play.textContent = '❚❚ Paused'; return; }
    box.classList.remove('paused'); play.textContent = '▶ Playing · tap any tool · hover to pause';
    started = Date.now(); timer = setTimeout(next, left);
  }
  function pause() { if (PIN) return; if (!box.classList.contains('paused')) left = Math.max(300, left - (Date.now() - started)); clearTimeout(timer); box.classList.add('paused'); play.textContent = '❚❚ Paused'; }
  function look() { var r = box.getBoundingClientRect(), on = r.top < innerHeight * .8 && r.bottom > innerHeight * .2; if (on === seen) return; seen = on; if (on) tick(); else pause(); }
  box.addEventListener('mouseenter', function () { hover = true; pause(); });
  box.addEventListener('mouseleave', function () { hover = false; tick(); });
  tabs.forEach(function (b, t) { b.addEventListener('click', function () { for (var i = 0; i < ALL.length; i++) if (ALL[i].t === t) return jumpTo(i); }); });
  box.addEventListener('click', function (e) { var el = e.target.closest('.tbx-tool'); if (!el) return; for (var i = 0; i < ALL.length; i++) if (ALL[i].el === el) return jumpTo(i); });
  addEventListener('scroll', function () { requestAnimationFrame(onScroll); }, { passive: true });
  if (window.lenis && lenis.on) lenis.on('scroll', onScroll);
  addEventListener('resize', size);
  box.style.setProperty('--tbx-d', DUR / 1000 + 's');
  set(0, true); size(); setTimeout(size, 400); addEventListener('load', size);
})();

/* ---- sound hint: no button in the bar. If sound is still blocked, a big see-through "Click anywhere to hear sound"
        zooms in at the middle of the screen right away, bobs and flashes 3 times, zooms back out (once a visit) ---- */
(function () {
  function on() { return !!(window.tsSoundOn && window.tsSoundOn()); }
  if (window.tsAudio) window.tsAudio();   // some browsers allow sound right away for returning visitors
  var h = document.createElement('button'); h.type = 'button'; h.className = 'shint'; h.textContent = '🔊 Click anywhere to hear sound';
  function gone() { h.classList.remove('go'); }
  h.addEventListener('click', function () { if (window.tsAudio) window.tsAudio(); gone(); });
  h.addEventListener('animationend', function (e) { if (e.animationName === 'shintMove') gone(); });
  document.body.appendChild(h);
  setTimeout(function () { if (!on()) h.classList.add('go'); }, 700);
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { addEventListener(ev, gone, { passive: true }); });
})();

// ===== My Video Studio demo v2: any topic -> real facts (Wikipedia), real pictures (Openverse + Wikimedia), real winning titles (our data), cinematic edit =====
(function () {
  var root = document.getElementById('vst'); if (!root) return;
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var fmt = function (n) { return n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : String(n); };
  var steps = [].slice.call(root.querySelectorAll('.vst-steps li')), panes = [].slice.call(root.querySelectorAll('.vst-pane'));
  var STOP = 'a an the of in on at to for and or but with about from into how why what who when where which is are was were be been it its this that these those my your our their his her vs story stories secret secrets truth real really history ancient untold hidden facts fact explained video videos best top most ever nobody everyone things thing make makes made making get gets using use start started without channel channels youtube faceless lost city inside sank new old life day days year years time ways way tips guide people'.split(' ');
  function words(q) { return q.toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').split(/\s+/).filter(function (w) { return w.length > 2 && STOP.indexOf(w) < 0; }); }
  function mood(q) { q = q.toLowerCase();
    if (/murder|crime|killer|vanish|missing|mystery|ghost|haunt|horror|dark|curse|disappear|cold case|creepy/.test(q)) return 'noir';
    if (/space|planet|galaxy|black hole|star|nasa|moon|mars|universe|science|quantum|ocean deep|alien/.test(q)) return 'cosmos';
    if (/sleep|calm|relax|cozy|bedtime|rain|meditat/.test(q)) return 'calm';
    if (/money|rich|business|dealer|car|stock|crypto|million|billion|price|scam|deal/.test(q)) return 'money';
    if (/ancient|empire|war|king|queen|pharaoh|roman|maya|aztec|egypt|viking|medieval|pyramid|civiliz|histor|titanic|pompeii/.test(q)) return 'epic';
    return 'neon'; }
  var GRADE = { noir: ['#FF3B4F', '#F2F2F2', 'grayscale(.55) contrast(1.25) brightness(.8)'], cosmos: ['#5EEAD4', '#C7D2FE', 'saturate(1.3) hue-rotate(-10deg) contrast(1.1)'], calm: ['#A5B4FC', '#E0E7FF', 'saturate(.8) brightness(.95)'],
    money: ['#FACC15', '#FFFFFF', 'contrast(1.15) saturate(1.2)'], epic: ['#FBBF24', '#FFF7E6', 'sepia(.35) contrast(1.15) saturate(1.15)'], neon: ['#F0ABFC', '#FFFFFF', 'saturate(1.25) contrast(1.1)'] };
  // ---- sources (all free, no key, called straight from the visitor's browser) ----
  function getJSON(u, ms) { return Promise.race([fetch(u).then(function (r) { if (!r.ok) throw 0; return r.json(); }), new Promise(function (_, no) { setTimeout(no, ms || 6000); })]); }
  function say(m) { var e = document.getElementById('vstSrc'); if (e) { e.textContent = m; e.classList.remove('blip'); void e.offsetWidth; e.classList.add('blip'); } }
  var SMALL = 'a an the of in on at to for and or but with about from into how why what who when where which is are was were be been it its this that these those my your our their his her really video videos'.split(' ');
  function terms(q) { return q.toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').split(/\s+/).filter(function (w) { return w.length > 1 && SMALL.indexOf(w) < 0; }).join(' '); }
  var stem = function (s) { s = s.toLowerCase(); var t = s.replace(/(ians|ans|ns|es|s)$/, ''); return t.length >= 4 ? t : s; };
  var WK = 'https://en.wikipedia.org/w/api.php?format=json&origin=*&action=query';
  function wikiSearch(t) { return getJSON(WK + '&list=search&srlimit=8&srinfo=suggestion&srprop=&srsearch=' + encodeURIComponent(t), 3500); }
  function wiki(q) {
    var t = terms(q) || q, w = words(q);
    var good = function (L, ws) { return L.filter(function (h) { var ti = h.title.toLowerCase(); return !/disambiguation|^list of/.test(ti) && ws.some(function (x) { return x.length > 3 && ti.indexOf(stem(x)) >= 0; }); }); };
    function fix(ws) {   // misspelled words: ask a free "sounds like" service (myans -> mayans)
      return Promise.all(ws.map(function (x) { return getJSON('https://api.datamuse.com/words?max=1&sl=' + encodeURIComponent(x), 2000).then(function (r) { return r && r[0] && r[0].score >= 90 && r[0].word.indexOf(' ') < 0 ? r[0].word : x; }).catch(function () { return x; }); })); }
    return wikiSearch(t).then(function (d) {
      var hits = (d && d.query && d.query.search) || [], pick = good(hits, w)[0];
      if (pick) return pick.title;
      say('\uD83D\uDD0E Checking the spelling\u2026'); return fix(w).then(function (w2) { if (w2.join(' ') === w.join(' ')) return null; var ch = w.map(function (x, i) { return x !== w2[i] ? x + ' \u2192 ' + w2[i] : ''; }).filter(Boolean); if (ch.length) say('\u270F\uFE0F Fixed spelling: ' + ch.join(', '));
        var t2 = t.split(' ').map(function (x) { var i = w.indexOf(x); return i >= 0 ? w2[i] : x; }).join(' ');
        return wikiSearch(t2).then(function (d2) { var h2 = (d2 && d2.query && d2.query.search) || []; var p2 = good(h2, w2)[0]; return p2 ? p2.title : null; }); });
    }).then(function (title) {
      if (!title) return null; say('\uD83D\uDCD6 Reading Wikipedia: ' + title + '\u2026');
      return Promise.all([
        getJSON(WK + '&prop=extracts|pageimages&exintro=1&explaintext=1&exsentences=6&piprop=thumbnail&pithumbsize=1280&redirects=1&titles=' + encodeURIComponent(title), 5000),
        getJSON('https://en.wikipedia.org/api/rest_v1/page/media-list/' + encodeURIComponent(title.replace(/ /g, '_')), 5000).catch(function () { return null; })
      ]).then(function (r) {
        var pg = r[0] && r[0].query && r[0].query.pages; pg = pg && pg[Object.keys(pg)[0]]; if (!pg || !pg.extract) return null;
        var txt = pg.extract.replace(/\s*\([^)]*\)/g, '').replace(/\s*\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim();
        var sents = (txt.match(/[^.!?]+[.!?]/g) || [txt]).map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 25 && s.length < 260; }).slice(0, 5);
        var imgs = [];
        if (pg.thumbnail && pg.thumbnail.source && !/flag|coat_of_arms|map|locator|seal|logo|\.svg/i.test(pg.thumbnail.source)) imgs.push(pg.thumbnail.source);
        ((r[1] && r[1].items) || []).forEach(function (it) {
          if (it.type !== 'image' || !it.srcset || !it.srcset.length || /\.svg|logo|icon|map|flag|seal|coat_of_arms|symbol|locator/i.test(it.title || '')) return;
          var s = it.srcset[it.srcset.length - 1].src; if (s) { s = s.indexOf('//') === 0 ? 'https:' + s : s; s = s.replace(/\/(\d+)px-/, '/960px-'); if (imgs.indexOf(s) < 0) imgs.push(s); }
        });
        return { title: pg.title, sents: sents, img: imgs[0], imgs: imgs.slice(0, 8) };
      });
    }).catch(function () { return null; }); }
  function commons(q) {
    return getJSON('https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=24&prop=imageinfo&iiprop=url|size&iiurlwidth=960&gsrsearch=' + encodeURIComponent(q + ' filetype:bitmap'), 4000).then(function (d) {
      var P = d && d.query && d.query.pages ? Object.keys(d.query.pages).map(function (k) { return d.query.pages[k]; }) : [];
      P.sort(function (a, b) { return a.index - b.index; });
      return P.filter(function (pg) { var ii = pg.imageinfo && pg.imageinfo[0]; return ii && ii.width >= 800 && ii.width > ii.height * 1.15 && !/map|flag|logo|coat|diagram|chart|seal|svg|plan|scan|page|text|stamp|coin/i.test(pg.title); })
        .map(function (pg) { return { src: pg.imageinfo[0].thumburl, by: 'Wikimedia Commons' }; }).slice(0, 14); }).catch(function () { return []; }); }
  function openverse(q) {
    return getJSON('https://api.openverse.org/v1/images/?page_size=20&license_type=commercial,modification&aspect_ratio=wide&q=' + encodeURIComponent(q), 3500).then(function (d) {
      var seen = {}, out = [];
      (d.results || []).forEach(function (r) { var by = r.creator || r.id; if (seen[by] || out.length >= 8) return; seen[by] = 1;
        var u = /staticflickr/.test(r.url || '') ? r.url : r.thumbnail; if (u) out.push({ src: u, by: r.creator || 'unknown' }); });
      return out; }).catch(function () { return []; }); }
  function pics(q) {
    var w = words(q).slice(0, 3).join(' ') || q;
    return Promise.all([commons(q), openverse(w)]).then(function (r) { var a = r[0], b = r[1], out = []; for (var i = 0; i < Math.max(a.length, b.length); i++) { if (a[i]) out.push(a[i]); if (b[i]) out.push(b[i]); } return out; }); }
  function load(src) { return new Promise(function (ok) { var im = new Image(); im.referrerPolicy = 'no-referrer'; var t = setTimeout(function () { ok(null); }, 2800);
    im.onload = function () { clearTimeout(t); ok(im.naturalWidth > 200 ? src : null); }; im.onerror = function () { clearTimeout(t); ok(null); }; im.src = src; }); }
  function winners(q) {   // real titles from this week's data about the same subject (most matching words first)
    var w = words(q).filter(function (x) { return x.length > 3; }).map(function (x) { return new RegExp('\\b' + x.replace(/s$/, '').replace(/[^a-z0-9]/g, '')); });
    if (!w.length) return [];
    var need = w.length > 1 ? 2 : 1;
    return (window.TS_CARDS || []).filter(function (c) { return !c[12]; }).map(function (c) { var t = c[9].toLowerCase(), n = 0; w.forEach(function (r) { if (r.test(t)) n++; }); return [n, c]; })
      .filter(function (x) { return x[0] >= need || (x[0] >= 1 && w.length > 1 && w[w.length - 1].test(x[1][9].toLowerCase())); })
      .sort(function (a, b) { return b[0] - a[0] || b[1][10] - a[1][10]; }).slice(0, 2).map(function (x) { return x[1]; }); }
  // ---- titles, hook and script ----
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function build(q, wk) {
    var qq = q.trim().replace(/^(how to|how|why|what|the truth about)\s+/i, ''); var subj = wk ? wk.title.replace(/ \(.*\)$/, '') : qq.split(/\s+/).slice(0, 5).map(function (x) { return x.length > 3 ? cap(x) : x; }).join(' '), m = mood(q);
    var T = { noir: ['The ' + subj + ' Mystery Nobody Can Explain', 'What Really Happened: ' + subj, subj + ': The Part They Left Out'],
      epic: ['The Rise and Fall of ' + subj, subj + ': What History Books Skip', 'How ' + subj + ' Changed Everything'],
      cosmos: [subj + ' Is Stranger Than You Think', 'What Scientists Just Found About ' + subj, 'The Truth About ' + subj],
      calm: ['Fall Asleep to the Story of ' + subj, 'A Slow, Calm Journey Through ' + subj, subj + ' · Relaxing Sleep Story'],
      money: ['The ' + subj + ' Secret Nobody Tells You', 'I Studied ' + subj + ' So You Don’t Have To', 'How ' + subj + ' Really Makes Money'],
      neon: ['The Truth About ' + subj, subj + ': What Nobody Tells You', 'I Spent a Week Studying ' + subj] }[m];
    var hook = { noir: 'Nobody has ever fully explained this.', epic: 'This is the part your history teacher skipped.', cosmos: 'This sounds made up. It isn’t.', calm: 'Get comfortable. Tonight’s story is a slow one.', money: 'Almost nobody knows how this really works.', neon: 'You think you know this story. You don’t.' }[m];
    var facts = wk && wk.sents.length ? wk.sents : ['Everybody thinks they know the story of ' + q + '.', 'But the real story is stranger, and almost nobody tells it right.', 'In the next few minutes, you’ll see exactly what happened, and why it still matters.'];
    var year = (facts.join(' ').match(/\b\d{1,4}\s?(?:BC|BCE|AD|CE)\b/) || facts.join(' ').match(/\b1[0-8]\d\d\b/) || [])[0] || '';
    var num = (facts.join(' ').match(/\b\d{1,3}(?:,\d{3})+|\b\d+(?:\.\d+)?\s?(?:million|billion|thousand|percent|%|years|km|miles|metres|meters|people)\b/i) || [])[0] || '';
    var numSent = num ? (facts.filter(function (s) { return s.indexOf(num) >= 0; })[0] || '') : '';
    return { numSent: numSent, subj: subj, mood: m, titles: T, hook: hook, facts: facts, year: year, num: num, script: hook + ' ' + facts.slice(0, 4).join(' ') }; }
  // ---- sound effects, made in code (play only after the visitor has clicked or tapped, like every browser requires) ----
  var SFX = (function () {
    function ctx() { var a = window.tsAudio ? window.tsAudio() : null; return a && a.state === 'running' ? a : null; }
    function noise(a, dur) { var b = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate), d = b.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; var s = a.createBufferSource(); s.buffer = b; return s; }
    function out(a, v) { var g = a.createGain(); g.gain.value = v; g.connect(a.destination); return g; }
    return {
      whoosh: function (v) { var a = ctx(); if (!a) return; var t = a.currentTime, s = noise(a, .5), f = a.createBiquadFilter(), g = out(a, 0); f.type = 'bandpass'; f.Q.value = 1.2; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(3200, t + .22); f.frequency.exponentialRampToValueAtTime(500, t + .45);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime((v || .35), t + .12); g.gain.exponentialRampToValueAtTime(.001, t + .48); s.connect(f); f.connect(g); s.start(t); s.stop(t + .5); },
      boom: function (v) { var a = ctx(); if (!a) return; var t = a.currentTime, o = a.createOscillator(), g = out(a, 0); o.type = 'sine'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(38, t + .45);
        g.gain.setValueAtTime(v || .6, t); g.gain.exponentialRampToValueAtTime(.001, t + .6); o.connect(g); o.start(t); o.stop(t + .62);
        var s = noise(a, .12), f = a.createBiquadFilter(), g2 = out(a, 0); f.type = 'lowpass'; f.frequency.value = 1800; g2.gain.setValueAtTime((v || .6) * .5, t); g2.gain.exponentialRampToValueAtTime(.001, t + .12); s.connect(f); f.connect(g2); s.start(t); },
      tick: function (v) { var a = ctx(); if (!a) return; var t = a.currentTime, o = a.createOscillator(), g = out(a, 0); o.type = 'square'; o.frequency.value = 1800 + Math.random() * 600; g.gain.setValueAtTime(v || .04, t); g.gain.exponentialRampToValueAtTime(.001, t + .03); o.connect(g); o.start(t); o.stop(t + .035); },
      pop: function (v) { var a = ctx(); if (!a) return; var t = a.currentTime, o = a.createOscillator(), g = out(a, 0); o.type = 'sine'; o.frequency.setValueAtTime(420, t); o.frequency.exponentialRampToValueAtTime(980, t + .08); g.gain.setValueAtTime(v || .18, t); g.gain.exponentialRampToValueAtTime(.001, t + .14); o.connect(g); o.start(t); o.stop(t + .15); },
      riser: function (dur) { var a = ctx(); if (!a) return; var t = a.currentTime, s = noise(a, dur), f = a.createBiquadFilter(), g = out(a, 0); f.type = 'bandpass'; f.Q.value = 4; f.frequency.setValueAtTime(200, t); f.frequency.exponentialRampToValueAtTime(5000, t + dur);
        g.gain.setValueAtTime(.001, t); g.gain.exponentialRampToValueAtTime(.22, t + dur * .95); g.gain.linearRampToValueAtTime(0, t + dur); s.connect(f); f.connect(g); s.start(t); s.stop(t + dur); },
      clap: function () { var a = ctx(); if (!a) return; var t = a.currentTime; [0, .012, .026].forEach(function (d) { var s = noise(a, .09), f = a.createBiquadFilter(), g = out(a, 0); f.type = 'highpass'; f.frequency.value = 1200; g.gain.setValueAtTime(.5, t + d); g.gain.exponentialRampToValueAtTime(.001, t + d + .09); s.connect(f); f.connect(g); s.start(t + d); }); },
      ding: function () { var a = ctx(); if (!a) return; var t = a.currentTime; [880, 1320, 1760].forEach(function (fq, k) { var o = a.createOscillator(), g = out(a, 0); o.type = 'sine'; o.frequency.value = fq; g.gain.setValueAtTime(.12 / (k + 1), t + k * .06); g.gain.exponentialRampToValueAtTime(.001, t + 1.2); o.connect(g); o.start(t + k * .06); o.stop(t + 1.3); }); },
      glitch: function () { var a = ctx(); if (!a) return; var t = a.currentTime; for (var k = 0; k < 5; k++) { var o = a.createOscillator(), g = out(a, 0); o.type = 'sawtooth'; o.frequency.value = 80 + Math.random() * 900; g.gain.setValueAtTime(.06, t + k * .04); g.gain.setValueAtTime(0, t + k * .04 + .03); o.connect(g); o.start(t + k * .04); o.stop(t + k * .04 + .035); } }
    };
  })();
  // ---- "3, 2, 1, ACTION" clapper the moment a video starts ----
  function clapper(then) {
    var st = $('vstStage'), c = document.createElement('div'); c.className = 'vst-clapper'; c.innerHTML = '<div class="cl-board"><div class="cl-top"></div><div class="cl-body"><span>SCENE 1</span><span>TAKE 1</span><b class="cl-n">3</b></div></div>';
    st.appendChild(c); var n = c.querySelector('.cl-n'), k = 3; SFX.tick(.08);
    var iv = setInterval(function () { k--; if (k > 0) { n.textContent = k; n.classList.remove('bump'); void n.offsetWidth; n.classList.add('bump'); SFX.tick(.08); return; }
      clearInterval(iv); n.textContent = 'ACTION!'; c.classList.add('snap'); SFX.clap(); setTimeout(function () { c.classList.add('gone'); setTimeout(function () { c.remove(); }, 400); then(); }, 450); }, 420);
  }
  // ---- step panes ----
  var timers = [], running = false, runId = 0;
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clear() { timers.forEach(clearTimeout); timers = []; }
  function show(p) { panes.forEach(function (x) { x.classList.toggle('on', x.dataset.p === String(p)); }); }
  function step(i) { steps.forEach(function (s, k) { s.classList.toggle('on', k === i); s.classList.toggle('done', k < i); }); $('vstPct').textContent = i < 0 ? 'Ready' : i > 5 ? 'Done ✅' : 'Step ' + (i + 1) + ' of 6'; }
  var wave = $('vstWave'); for (var i = 0; i < 56; i++) wave.appendChild(document.createElement('i'));
  var bars = [].slice.call(wave.children), wv = null;
  function waveOn(on) { clearInterval(wv); if (!on) { bars.forEach(function (b) { b.style.height = '8%'; }); return; }
    var t = 0; wv = setInterval(function () { t++; bars.forEach(function (b, k) { var v = Math.abs(Math.sin(k * .45 + t * .5)) * .6 + Math.random() * .4; b.style.height = (8 + v * 88 * (Math.sin(t * .2) > -.7 ? 1 : .2)) + '%'; });
      $('vstVt').textContent = '0:' + ('0' + Math.min(59, Math.floor(t / 8))).slice(-2); }, 110); }
  // ---- the cinematic player: 21 HyperFrames-style scenes built from the topic's own pictures, facts and fonts ----
  var FONTS = { noir: ['"Bebas Neue"', '"Special Elite"'], epic: ['"Cinzel"', '"Playfair Display"'], cosmos: ['"Orbitron"', '"Rajdhani"'], calm: ['"Playfair Display"', '"Cormorant Garamond"'], money: ['"Anton"', '"Bebas Neue"'], neon: ['"Bungee"', '"Anton"'] };
  var SCENES = ['Live cursor', 'Clone row', 'Day dial', 'Predict keys', 'Orbit ring', 'Code body', 'Post wall', 'Letter dive', 'Comment drop', 'Layer explode', 'Sketch words', 'Blade slice', 'Head stack', 'Rack focus', 'Banknote', 'Voice note', 'Impact frame', 'Dolly zoom', 'Press front', 'Paper tear', 'Blow away'];
  var SD = 2600;   // each scene
  // ---- style packs: every video gets a different look, whatever the topic ----
  var NEWFX = ['Cylinder text', 'Marker strokes', 'Cipher decode', 'Split-flap board', 'Word pop', 'Terminal type', 'Article spotlight', 'Chat bubbles', 'Live post', 'Window morph', 'Redacted', 'Loupe', 'Bar race', 'Globe flyover', 'Odometer', 'Flowchart', 'Spectrum', 'Card fan', 'Isometric tilt', 'Page peel', 'Parallax', 'Cinematic zoom', 'TV signal off', 'Pixelate', 'Starburst', 'Myth vs fact', 'Constellation', 'Duotone print', 'Halftone pop', 'Topo map'];
  var LOOKS = [
    { id: 'archive', name: 'Archive documentary', a: '#E3242B', f: ['"Bebas Neue"', '"Special Elite"'], ov: ['grain', 'paper', 'leak'], cap: 'type', tr: ['cut', 'tvoff', 'blinds', 'whip'], sd: 2500,
      pref: ['Article spotlight', 'Redacted', 'Terminal type', 'Press front', 'Paper tear', 'Marker strokes', 'Odometer', 'Pixelate', 'Head stack', 'Comment drop'] },
    { id: 'magnate', name: 'Business documentary', a: '#FFD60A', f: ['"Anton"', '"Inter"'], ov: ['leak'], cap: 'pill', tr: ['whip', 'slide', 'iris', 'zoom'], sd: 2400,
      pref: ['Odometer', 'Bar race', 'Article spotlight', 'Live post', 'Window morph', 'Card fan', 'Banknote', 'Flowchart', 'Parallax', 'Globe flyover'] },
    { id: 'atlas', name: 'Painted history', a: '#B8862B', f: ['"Cinzel"', '"Cormorant Garamond"'], ov: ['paper', 'topo'], cap: 'outline', tr: ['zoom', 'goo', 'iris', 'cut'], sd: 2900,
      pref: ['Globe flyover', 'Cinematic zoom', 'Page peel', 'Parallax', 'Cylinder text', 'Sketch words', 'Topo map', 'Day dial', 'Letter dive', 'Card fan'] },
    { id: 'edit', name: 'Phonk edit', a: '#FF1E1E', f: ['"Anton"', '"Bebas Neue"'], ov: ['grain', 'rgb', 'vhs'], cap: 'pop', tr: ['cut', 'flash', 'whip', 'tvoff'], sd: 1900, mono: true,
      pref: ['Impact frame', 'Cipher decode', 'Blade slice', 'Clone row', 'Dolly zoom', 'Rack focus', 'Pixelate', 'TV signal off', 'Word pop', 'Blow away'] },
    { id: 'myth', name: 'Cartoon explainer', a: '#FFD23F', f: ['"Bungee"', '"Fredoka"'], ov: ['halftone'], cap: 'pill', tr: ['iris', 'star', 'goo', 'slide'], sd: 2400,
      pref: ['Chat bubbles', 'Myth vs fact', 'Marker strokes', 'Comment drop', 'Post wall', 'Voice note', 'Head stack', 'Halftone pop', 'Live post', 'Predict keys'] },
    { id: 'void', name: 'Minimal tech', a: '#8052FF', f: ['"Inter"', '"Inter"'], ov: ['stars'], cap: 'outline', tr: ['iris', 'zoom', 'cut'], sd: 2600, thin: true,
      pref: ['Constellation', 'Flowchart', 'Orbit ring', 'Isometric tilt', 'Spectrum', 'Code body', 'Word pop', 'Cylinder text', 'Loupe', 'Window morph'] },
    { id: 'retro', name: 'Retro TV', a: '#22D3EE', f: ['"VT323"', '"VT323"'], ov: ['crt', 'vhs', 'rgb'], cap: 'type', tr: ['tvoff', 'cut', 'blinds'], sd: 2300,
      pref: ['TV signal off', 'Cipher decode', 'Split-flap board', 'Terminal type', 'Pixelate', 'Spectrum', 'Code body', 'Predict keys', 'Live cursor', 'Redacted'] },
    { id: 'synth', name: 'Neon synthwave', a: '#FF2BD6', f: ['"Orbitron"', '"Rajdhani"'], ov: ['rays', 'grain'], cap: 'pop', tr: ['zoom', 'iris', 'star', 'whip'], sd: 2400,
      pref: ['Cylinder text', 'Starburst', 'Spectrum', 'Orbit ring', 'Dolly zoom', 'Isometric tilt', 'Clone row', 'Letter dive', 'Word pop', 'Card fan'] },
    { id: 'print', name: 'Duotone print', a: '#FF4D2E', f: ['"Playfair Display"', '"Playfair Display"'], ov: ['halftone', 'grain'], cap: 'outline', tr: ['blinds', 'slide', 'cut'], sd: 2500,
      pref: ['Duotone print', 'Halftone pop', 'Press front', 'Article spotlight', 'Marker strokes', 'Blade slice', 'Paper tear', 'Redacted', 'Split-flap board', 'Banknote'] },
    { id: 'winter', name: 'Cold open', a: '#93C5FD', f: ['"Cinzel"', '"Rajdhani"'], ov: ['snow', 'grain'], cap: 'pill', tr: ['goo', 'zoom', 'iris'], sd: 2700,
      pref: ['Cinematic zoom', 'Parallax', 'Globe flyover', 'Loupe', 'Page peel', 'Rack focus', 'Sketch words', 'Cylinder text', 'Constellation', 'Layer explode'] }
  ];
  function pickLook() { var i; try { i = +localStorage.getItem('tsLookN'); } catch (e) {} if (!(i >= 0)) i = Math.floor(Math.random() * LOOKS.length); else i = (i + 1 + Math.floor(Math.random() * 2)) % LOOKS.length;
    try { localStorage.setItem('tsLookN', i); } catch (e) {} return LOOKS[i]; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pickList(lk) { var all = SCENES.concat(NEWFX), pref = shuffle(lk.pref.slice()), rest = shuffle(all.filter(function (n) { return n !== 'Live cursor' && pref.indexOf(n) < 0; })).slice(0, 13), out = ['Live cursor'];
    var a = pref.slice(), b = rest.slice(); while (a.length || b.length) { if (a.length) out.push(a.shift()); if (b.length) out.push(b.shift()); if (a.length && Math.random() < .5) out.push(a.shift()); } return out.slice(0, 24); }
  function player(d, imgs, done) {
    var LK = pickLook(), LIST = pickList(LK), SD = LK.sd;
    var hf = $('hf'), G = GRADE[d.mood], A = LK.a, F = LK.f, my = runId;
    hf.className = 'hf m-' + d.mood + ' look-' + LK.id + ' cap-' + LK.cap + (LK.thin ? ' thin' : '') + (LK.mono ? ' mono' : '') + LK.ov.map(function (x) { return ' ov-' + x; }).join(''); hf.style.setProperty('--hfa', A); hf.style.setProperty('--hfg', G[2]); hf.style.setProperty('--hff', F[0] + ',var(--fh)'); hf.style.setProperty('--hfs', F[1] + ',var(--fb)'); hf.innerHTML = '';
    var mk = function (tag, cls, html, par) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; (par || hf).appendChild(e); return e; };
    var IM = function (k) { return imgs.length ? imgs[((k % imgs.length) + imgs.length) % imgs.length] : ''; };
    var pic = function (par, k, cls) { var e = mk('div', 'hf-img ' + (cls || ''), null, par); var s = IM(k); if (s) e.style.backgroundImage = 'url("' + s + '")'; else e.classList.add('hf-noimg'); return e; };
    var stage = mk('div', 'hf-stage'), grain = mk('div', 'hf-grain'), vig = mk('div', 'hf-vig'), leak = mk('div', 'hf-leak'), lb = mk('div', 'hf-lb on');
    LK.ov.forEach(function (x) { var o = mk('div', 'hf-ov ov-' + x + '-l'); if (x === 'snow' || x === 'stars') for (var k = 0; k < 40; k++) { var p = mk('i', '', null, o); p.style.left = Math.random() * 100 + '%'; p.style.animationDelay = -Math.random() * 8 + 's'; p.style.animationDuration = (4 + Math.random() * 6) + 's'; p.style.top = Math.random() * 100 + '%'; } });
    var badge = mk('div', 'hf-look', '\u2728 ' + LK.name);
    var capEl = mk('div', 'hf-cap'), tc = mk('div', 'hf-tc', '00:00'), prog = mk('div', 'hf-prog', '<i></i>');
    var chap = mk('div', 'hf-chap', '<div class="hf-ch-h"><span>In this video</span><b>01 / ' + LIST.length + '</b></div><ol>' + LIST.map(function (n, i) { return '<li><i>' + ('0' + (i + 1)).slice(-2) + '</i>' + n + '</li>'; }).join('') + '</ol><div class="hf-ch-f">+ built by <b>Claude</b></div>');
    var skip = mk('button', 'hf-skip', 'Skip ⏭'); skip.type = 'button';
    var keyw = words(d.subj + ' ' + d.facts.join(' ')).filter(function (w) { return w.length > 4; });
    var KW = function (i) { return (keyw[i % Math.max(1, keyw.length)] || d.subj.split(' ')[0] || 'WOW').toUpperCase(); };
    var D = LIST.length * SD + 2800, t0 = performance.now();
    prog.firstChild.style.transition = 'width ' + D + 'ms linear'; requestAnimationFrame(function () { prog.firstChild.style.width = '100%'; });
    var tci = setInterval(function () { if (my !== runId) return clearInterval(tci); var s = Math.min(D, performance.now() - t0) / 1000; tc.textContent = '00:' + ('0' + Math.floor(s)).slice(-2); if (s * 1000 >= D) clearInterval(tci); }, 200);
    var at = function (ms, fn) { later(function () { if (my === runId) fn(); }, ms); };
    var cur = null;
    function scene(i, how) {
      if (cur) { var o = cur; o.classList.add('out'); setTimeout(function () { o.remove(); }, 650); }
      var s = mk('div', 'hf-s in ' + (how || 'cut'), null, stage); cur = s;
      leak.classList.remove('go'); void leak.offsetWidth; leak.classList.add('go');
      if (how === 'blinds') { var bl = mk('div', 'tr-blinds'); for (var q2 = 0; q2 < 8; q2++) { var st2 = mk('i', '', null, bl); st2.style.animationDelay = (q2 * .04) + 's'; } setTimeout(function () { bl.remove(); }, 900); }
      if (how === 'goo') { var go2 = mk('div', 'tr-goo'); for (var q3 = 0; q3 < 6; q3++) { var bb = mk('i', '', null, go2); bb.style.left = (10 + q3 * 16) + '%'; bb.style.animationDelay = (q3 * .05) + 's'; } setTimeout(function () { go2.remove(); }, 1100); }
      if (how === 'tvoff') { var tv = mk('div', 'tr-tv', '<i></i><i></i><i></i><i></i><i></i><i></i><i></i>'); SFX.glitch(); setTimeout(function () { tv.remove(); }, 520); }
      if (how === 'flash') { var fl = mk('div', 'hf-flash'); fl.addEventListener('animationend', function () { fl.remove(); }); SFX.boom(.3); }
      var li = chap.querySelectorAll('li'); [].forEach.call(li, function (x, k) { x.classList.toggle('on', k === i); x.classList.toggle('done', k < i); });
      chap.querySelector('b').textContent = ('0' + (i + 1)).slice(-2) + ' / ' + LIST.length; var ol = chap.querySelector('ol'); ol.scrollTop = Math.max(0, li[i].offsetTop - ol.clientHeight / 2);
      return s;
    }
    var caps = d.script.split(/\s+/), ci = 0;
    function capsRun(from, to) { var n = Math.max(1, Math.floor((to - from) / 360)); for (var k = 0; k < n; k++) (function (k) { at(from + k * 360, function () {
      var g = caps.slice(ci, ci + 3); ci += 3; if (!g.length) { ci = 0; g = caps.slice(0, 3); } capEl.innerHTML = g.map(function (x, j) { return j === 1 ? '<b>' + esc(x) + '</b>' : '<span>' + esc(x) + '</span>'; }).join(' '); capEl.classList.remove('pop'); void capEl.offsetWidth; capEl.classList.add('pop'); }); })(k); }
    var capOn = function (on) { capEl.classList.toggle('on', on); };
    var B = [];   // scene builders, in the order of the list
    // 01 Live cursor: a search bar, the cursor types the topic and clicks
    B.push(function (s) { pic(s, 0, 'kb dim'); var w = mk('div', 'x-search', '<div class="x-bar"><span class="x-yt">▶</span><span class="x-q"></span><span class="x-caret"></span><span class="x-go">🔍</span></div>', s);
      var c = mk('i', 'x-cursor', null, s), q = w.querySelector('.x-q'), t = d.subj; for (var k = 0; k <= t.length; k++) (function (k) { at(500 + k * Math.min(70, 1100 / t.length), function () { q.textContent = t.slice(0, k); if (k % 2) SFX.tick(.05); }); })(k);
      at(1800, function () { c.classList.add('click'); SFX.tick(.15); SFX.pop(.2); w.classList.add('hit'); }); capOn(false); });
    // 02 Clone row: the title repeated in an echo row
    B.push(function (s) { pic(s, 1, 'kb2 dim'); var r = mk('div', 'x-clone', null, s); var t = KW(0); for (var k = 0; k < 7; k++) { var e = mk('b', '', esc(t), r); e.style.animationDelay = (k * .07) + 's'; e.style.setProperty('--k', k - 3); } SFX.whoosh(.35); });
    // 03 Day dial: a dial spins and lands on the year (or day 1)
    B.push(function (s) { pic(s, 2, 'blurbg'); var v = d.year || 'DAY 1'; var w = mk('div', 'x-dial', '<div class="x-ring">' + Array.apply(null, Array(12)).map(function (_, k) { return '<i style="--a:' + (k * 30) + 'deg"></i>'; }).join('') + '</div><div class="x-hand"></div><b>' + esc(v) + '</b><span>' + (d.year ? 'THE YEAR IT ALL STARTED' : 'WHERE IT BEGINS') + '</span>', s);
      for (var k = 0; k < 8; k++) at(k * 130, function () { SFX.tick(.07); }); at(1150, function () { SFX.boom(.35); }); });
    // 04 Predict keys: keyboard keys spell a key word
    B.push(function (s) { mk('div', 'x-kbbg', null, s); var w = KW(1).slice(0, 8), r = mk('div', 'x-keys', null, s); w.split('').forEach(function (ch, k) { var e = mk('b', '', esc(ch), r); at(250 + k * 180, function () { e.classList.add('down'); SFX.tick(.12); }); });
      mk('div', 'x-keysub', 'Predicted next word: <b>' + esc(KW(2).toLowerCase()) + '</b>', s); });
    // 05 Orbit ring: picture in a circle, words orbiting
    B.push(function (s) { pic(s, 3, 'blurbg'); var w = mk('div', 'x-orbit', null, s); var c = mk('div', 'x-orb-c', null, w); if (IM(3)) c.style.backgroundImage = 'url("' + IM(3) + '")'; var ring = mk('div', 'x-orb-r', null, w);
      [KW(0), KW(1), KW(2), KW(3), KW(4), KW(5)].forEach(function (t, k) { var e = mk('span', '', esc(t), ring); e.style.setProperty('--a', (k * 60) + 'deg'); }); capOn(true); });
    // 06 Code body: the fact typed out as code
    B.push(function (s) { var w = mk('div', 'x-code', null, s); var f = (d.facts[0] || d.hook);
      var L = ['<i>const</i> <u>video</u> = {', '  topic: <s>"' + esc(d.subj) + '"</s>,', '  hook: <s>"' + esc(d.hook) + '"</s>,', '  fact: <s>"' + esc(f.slice(0, 70)) + (f.length > 70 ? '…' : '') + '"</s>,', '  style: <s>"' + d.mood + '"</s>, scenes: <em>21</em>,', '  render: <u>hyperframes</u>()', '};'];
      L.forEach(function (l, k) { var e = mk('div', 'x-cl', '<span class="x-ln">' + (k + 1) + '</span>' + l, w); at(120 + k * 260, function () { e.classList.add('in'); SFX.tick(.06); }); }); capOn(false); });
    // 07 Post wall: a wall of posts that pans
    B.push(function (s) { var w = mk('div', 'x-wall', null, s); for (var k = 0; k < 12; k++) { var p = mk('div', 'x-post', '<div class="x-pi"></div><div class="x-pt"><b>' + esc(KW(k)) + '</b><span>❤ ' + (Math.floor(Math.random() * 90) + 9) + 'K</span></div>', w); var im = IM(k + 2); if (im) p.firstChild.style.backgroundImage = 'url("' + im + '")'; p.style.animationDelay = (k * .06) + 's'; }
      for (var k2 = 0; k2 < 5; k2++) at(k2 * 120, function () { SFX.pop(.1); }); });
    // 08 Letter dive: a giant letter filled with the picture, the camera dives through it
    B.push(function (s) { pic(s, 4, 'kb3'); var t = d.subj.replace(/^the /i, '').charAt(0).toUpperCase(); var e = mk('div', 'x-letter', esc(t), s); if (IM(5)) e.style.backgroundImage = 'url("' + IM(5) + '")'; at(1200, function () { SFX.whoosh(.5); }); capOn(false); });
    // 09 Comment drop: comments fall in
    B.push(function (s) { pic(s, 6, 'dim'); var w = mk('div', 'x-cmts', null, s), C = ['wait WHAT?? 🤯', 'nobody talks about this', 'I watched this 3 times', 'the editing on this 🔥', 'part 2 please!!'];
      C.forEach(function (t, k) { var e = mk('div', 'x-cmt', '<i>' + 'ABCDE'[k] + '</i><div><b>@viewer' + (k * 37 + 12) + '</b><p>' + esc(t) + '</p></div>', w); at(150 + k * 380, function () { e.classList.add('in'); SFX.pop(.14); }); }); capOn(false); });
    // 10 Layer explode: the picture splits into 3D layers
    B.push(function (s) { var w = mk('div', 'x-layers', null, s); for (var k = 0; k < 4; k++) { var e = pic(w, 7, 'x-ly'); e.style.setProperty('--k', k); } capOn(true); at(300, function () { SFX.whoosh(.3); }); });
    // 11 Sketch words: words drawn by hand
    B.push(function (s) { pic(s, 8, 'paper'); var t = KW(3); var svg = '<svg viewBox="0 0 800 300" class="x-sketch"><text x="400" y="170" text-anchor="middle" style="font-size:' + Math.min(150, Math.round(1250 / Math.max(1, t.length))) + 'px">' + esc(t) + '</text><path d="M110 215 C 260 245, 520 190, 690 225" /><path class="c" d="M620 60 C 700 40, 760 120, 700 160 C 640 190, 570 120, 620 60" /></svg>';
      mk('div', 'x-sk', svg, s); for (var k = 0; k < 6; k++) at(k * 180, function () { SFX.tick(.03); }); capOn(false); });
    // 12 Blade slice: the picture is cut diagonally and slides apart
    B.push(function (s) { mk('div', 'x-under', '<b>' + esc(d.num || KW(4)) + '</b>', s); var a = pic(s, 9, 'x-sl a'), b2 = pic(s, 9, 'x-sl b'); mk('i', 'x-blade', null, s); at(500, function () { SFX.whoosh(.55); SFX.boom(.25); }); capOn(false); });
    // 13 Head stack: circles pile up
    B.push(function (s) { pic(s, 10, 'blurbg'); var w = mk('div', 'x-heads', null, s); for (var k = 0; k < 7; k++) { var e = mk('i', '', null, w); var im = IM(k + 3); if (im) e.style.backgroundImage = 'url("' + im + '")'; e.style.animationDelay = (k * .12) + 's'; at(k * 120, function () { SFX.pop(.1); }); }
      mk('div', 'x-hs-t', 'Everyone has a theory about <b>' + esc(d.subj) + '</b>', s); capOn(false); });
    // 14 Rack focus: front text sharp, then focus pulls to the picture
    B.push(function (s) { pic(s, 11, 'x-rack'); mk('div', 'x-rack-t', esc(KW(5)), s); capOn(true); });
    // 15 Banknote: a bank note with the picture as the portrait
    B.push(function (s) { mk('div', 'x-cash-bg', null, s); var n = mk('div', 'x-note', '<div class="x-n-p"></div><b class="x-n-v">' + esc(d.num ? d.num.split(' ')[0] : '100') + '</b><span class="x-n-t">' + esc(d.subj) + '</span><span class="x-n-s">SERIES ' + (d.year || '2026') + '</span>', s);
      if (IM(12)) n.querySelector('.x-n-p').style.backgroundImage = 'url("' + IM(12) + '")'; at(600, function () { SFX.ding(); }); capOn(false); });
    // 16 Voice note: a voice message bubble with a waveform and transcript
    B.push(function (s) { pic(s, 13, 'blurbg'); var w = mk('div', 'x-vn', '<div class="x-vb"><span class="x-play">▶</span><div class="x-vw">' + Array.apply(null, Array(28)).map(function () { return '<i></i>'; }).join('') + '</div><em>0:24</em></div><p></p>', s);
      w.querySelector('p').textContent = '“' + (d.facts[1] || d.hook).split(' ').slice(0, 14).join(' ') + '…”'; capOn(false); });
    // 17 Impact frame: comic impact with speed lines
    B.push(function (s) { pic(s, 14, 'x-imp'); mk('div', 'x-speed', null, s); mk('div', 'x-pow', esc({ noir: 'GONE.', epic: 'BOOM.', cosmos: 'WHOA.', calm: 'HUSH.', money: 'CASH.', neon: 'WAIT!' }[d.mood]), s); SFX.boom(.7); capOn(false); });
    // 18 Dolly zoom: background grows while the middle shrinks
    B.push(function (s) { pic(s, 15, 'x-dz-bg'); var m = mk('div', 'x-dz-m', null, s); if (IM(15)) m.style.backgroundImage = 'url("' + IM(15) + '")'; at(200, function () { SFX.riser(1.8); }); capOn(true); });
    // 19 Press front: a newspaper spins in
    B.push(function (s) { mk('div', 'x-press-bg', null, s); var n = mk('div', 'x-paper', '<div class="x-mast">THE DAILY TUBE</div><div class="x-dl">' + (d.year ? 'SINCE ' + esc(d.year) : 'SPECIAL EDITION') + ' · EXTRA</div><h6></h6><div class="x-pp"><div class="x-ppi"></div><p></p></div>', s);
      n.querySelector('h6').textContent = d.titles[0]; n.querySelector('p').textContent = d.facts.slice(0, 2).join(' '); if (IM(16)) n.querySelector('.x-ppi').style.backgroundImage = 'url("' + IM(16) + '")'; SFX.whoosh(.4); at(900, function () { SFX.boom(.3); }); capOn(false); });
    // 20 Paper tear: the picture rips to show the next one
    B.push(function (s) { pic(s, 18, ''); var t = pic(s, 17, 'x-tear'); mk('div', 'x-tear-t', esc(KW(6)), s); at(700, function () { SFX.glitch(); SFX.whoosh(.4); }); capOn(false); });
    // 21 Blow away: the title breaks into letters that blow away
    B.push(function (s) { pic(s, 0, 'kb dim'); var w = mk('div', 'x-blow', null, s); d.subj.split('').forEach(function (ch, k) { var e = mk('span', '', ch === ' ' ? '&nbsp;' : esc(ch), w); e.style.setProperty('--x', (60 + Math.random() * 260) + 'px'); e.style.setProperty('--y', (-160 + Math.random() * 200) + 'px'); e.style.setProperty('--r', (Math.random() * 540 - 270) + 'deg'); e.style.setProperty('--bd', (1.6 + k * .03) + 's'); e.style.setProperty('--ad', (k * .025) + 's'); });
      at(1600, function () { SFX.whoosh(.6); }); capOn(false); });
    // ===================== v4: more effects (added to the 21 above) =====================
    var EFX = {}; SCENES.forEach(function (n, i) { EFX[n] = B[i]; });
    var sent = function (i) { return d.facts[i % Math.max(1, d.facts.length)] || d.hook; };
    var NUMV = (function () { var m = String(d.num || d.year || '').replace(/,/g, '').match(/\d+(\.\d+)?/); return m ? parseFloat(m[0]) : 1000; })();
    EFX['Cylinder text'] = function (s) { pic(s, 2, 'blurbg'); var w = mk('div', 'y-cyl', null, s), dr = mk('div', 'y-drum', null, w); for (var k = 0; k < 8; k++) { var e = mk('b', '', esc(KW(k)), dr); e.style.setProperty('--a', (k * 45) + 'deg'); } SFX.whoosh(.3); };
    EFX['Marker strokes'] = function (s) { pic(s, 3, 'dim'); var t = sent(0).split(' ').slice(0, 14), w = mk('p', 'y-mark', null, s);
      t.forEach(function (x, k) { var cls = k === 2 ? 'hl' : k === 6 ? 'ci' : k === 10 ? 'xo' : ''; mk('span', cls, esc(x), w); w.appendChild(document.createTextNode(' ')); }); at(700, function () { SFX.tick(.08); }); at(1300, function () { SFX.tick(.08); }); };
    EFX['Cipher decode'] = function (s) { pic(s, 4, 'dim'); var t = KW(0), e = mk('div', 'y-ciph', '', s), G = '!<>-_\\/[]{}=+*^?#01ABCXYZ', n = 0;
      var iv = setInterval(function () { if (my !== runId) return clearInterval(iv); n++; e.textContent = t.split('').map(function (c, k) { return k < n / 2 ? c : G[Math.floor(Math.random() * G.length)]; }).join(''); if (n % 2) SFX.tick(.04); if (n / 2 > t.length) clearInterval(iv); }, 55); };
    EFX['Split-flap board'] = function (s) { mk('div', 'y-flapbg', null, s); var rows = [d.subj.toUpperCase().slice(0, 16), (d.year || 'NOW') + ' · ' + d.mood.toUpperCase()], w = mk('div', 'y-flap', null, s);
      rows.forEach(function (r) { var row = mk('div', 'y-frow', null, w); r.split('').forEach(function (c, k) { var t = mk('b', '', '', row), i2 = 0, it = 4 + Math.floor(Math.random() * 6) + k % 4;
        var iv = setInterval(function () { if (my !== runId) return clearInterval(iv); i2++; t.textContent = i2 >= it ? (c === ' ' ? '' : c) : String.fromCharCode(65 + Math.floor(Math.random() * 26)); t.classList.remove('fl'); void t.offsetWidth; t.classList.add('fl'); if (i2 >= it) clearInterval(iv); }, 70); }); });
      for (var k = 0; k < 10; k++) at(k * 90, function () { SFX.tick(.05); }); };
    EFX['Word pop'] = function (s) { pic(s, 5, 'dim'); var t = (d.hook + ' ' + sent(1)).split(' ').slice(0, 12), w = mk('p', 'y-pop', null, s);
      t.forEach(function (x, k) { var e = mk('span', '', esc(x), w); w.appendChild(document.createTextNode(' ')); at(150 + k * 170, function () { [].forEach.call(w.children, function (z) { z.classList.remove('on'); }); e.classList.add('on', 'seen'); if (k % 2 === 0) SFX.tick(.05); }); }); };
    EFX['Terminal type'] = function (s) { var w = mk('div', 'y-term', '<div class="y-tbar"><i></i><i></i><i></i><span>research.sh</span></div><pre></pre>', s), pre = w.querySelector('pre');
      var txt = '$ tubesearch research "' + d.subj + '"\n> sources found: wikipedia, commons\n> ' + sent(0).slice(0, 90) + '\n> status: READY TO RECORD', i2 = 0;
      var iv = setInterval(function () { if (my !== runId) return clearInterval(iv); i2 += 3; pre.innerHTML = esc(txt.slice(0, i2)).replace(/(\$ .*)/, '<b>$1</b>') + '<span class="y-blk"></span>'; if (i2 % 9 === 0) SFX.tick(.04); if (i2 >= txt.length) clearInterval(iv); }, 28); };
    EFX['Article spotlight'] = function (s) { var w = mk('div', 'y-art', '<div class="y-ah">' + esc(d.subj) + '</div><div class="y-ab"></div>', s), ab = w.querySelector('.y-ab');
      d.facts.slice(0, 4).forEach(function (f, k) { var p = mk('p', k === 1 ? 'key' : '', esc(f), ab); }); var dim = mk('div', 'y-dim', null, s); at(900, function () { w.classList.add('zoom'); dim.classList.add('on'); SFX.whoosh(.25); }); };
    EFX['Chat bubbles'] = function (s) { mk('div', 'y-chatbg', null, s); var w = mk('div', 'y-chat', null, s), M = [['them', 'have you heard about ' + d.subj.toLowerCase() + '?'], ['me', 'no?? what happened'], ['them', sent(0).split(' ').slice(0, 12).join(' ') + '…'], ['me', 'WAIT WHAT 😳']];
      M.forEach(function (m, k) { at(200 + k * 520, function () { var ty = mk('div', 'y-b ' + m[0] + ' typing', '<i></i><i></i><i></i>', w); setTimeout(function () { ty.classList.remove('typing'); ty.textContent = m[1]; SFX.pop(.14); }, 300); }); }); };
    EFX['Live post'] = function (s) { pic(s, 6, 'blurbg'); var w = mk('div', 'y-xp', '<div class="y-xh"><i></i><div><b>History Facts</b><span>@historyfacts · 2h</span></div></div><p></p><div class="y-xi"></div><div class="y-xs"><span>💬 <b data-n="1240">0</b></span><span>🔁 <b data-n="8800">0</b></span><span>❤ <b data-n="48200">0</b></span></div>', s);
      w.querySelector('p').textContent = sent(0).split(' ').slice(0, 18).join(' '); if (IM(6)) w.querySelector('.y-xi').style.backgroundImage = 'url("' + IM(6) + '")';
      [].forEach.call(w.querySelectorAll('[data-n]'), function (b) { var N = +b.dataset.n; for (var k = 1; k <= 12; k++) (function (k) { at(300 + k * 120, function () { b.textContent = fmt(Math.round(N * k / 12)); if (k % 3 === 0) SFX.tick(.05); }); })(k); }); };
    EFX['Window morph'] = function (s) { mk('div', 'y-wmbg', null, s); var w = mk('div', 'y-wm', '<div class="y-wmb"><i></i><i></i><i></i></div><div class="y-wmc"><div class="y-wmi"></div><b></b><p></p></div>', s);
      w.querySelector('b').textContent = d.titles[0]; w.querySelector('p').textContent = sent(0).slice(0, 110); if (IM(7)) w.querySelector('.y-wmi').style.backgroundImage = 'url("' + IM(7) + '")';
      at(800, function () { w.classList.add('tab'); SFX.whoosh(.2); }); at(1600, function () { w.classList.add('mob'); SFX.whoosh(.2); }); };
    EFX['Redacted'] = function (s) { mk('div', 'y-docbg', null, s); var w = mk('div', 'y-doc', '<div class="y-dt">CLASSIFIED · FILE ' + (Math.floor(Math.random() * 900) + 100) + '</div>', s);
      sent(0).split(' ').slice(0, 26).forEach(function (x, k) { var e = mk('span', k % 4 === 2 || k % 7 === 0 ? 'rd' : '', esc(x), w); w.appendChild(document.createTextNode(' ')); });
      at(1200, function () { w.classList.add('peel'); SFX.whoosh(.3); }); mk('div', 'y-stamp', 'DECLASSIFIED', s); };
    EFX['Loupe'] = function (s) { var b = pic(s, 8, ''), L = mk('div', 'y-loupe', null, s); if (IM(8)) L.style.backgroundImage = 'url("' + IM(8) + '")'; };
    EFX['Bar race'] = function (s) { mk('div', 'y-barbg', null, s); var N = ((window.TS_DATA && window.TS_DATA.niches) || []).slice(0, 40).sort(function () { return Math.random() - .5; }).slice(0, 6), w = mk('div', 'y-bars', '<h6>Median views a month by niche (Tube Search data)</h6>', s);
      var mx = Math.max.apply(null, N.map(function (n) { return n[4]; }).concat([1])), rows = N.map(function (n, k) { var r = mk('div', 'y-bar', '<span>' + esc(n[0]) + '</span><i></i><b>0</b>', w); r.style.top = (34 + k * 15) + '%'; return { r: r, n: n, v: 0 }; });
      for (var t = 1; t <= 10; t++) (function (t) { at(t * 190, function () { rows.forEach(function (o, k) { o.v = o.n[4] * Math.min(1, t / 10 * (0.6 + ((k * 37) % 10) / 20 + t / 25)); });
        rows.slice().sort(function (a, b2) { return b2.v - a.v; }).forEach(function (o, rank) { o.r.style.top = (34 + rank * 15) + '%'; o.r.querySelector('i').style.width = (o.v / mx * 62) + '%'; o.r.querySelector('b').textContent = fmt(Math.round(o.v)); }); if (t % 2) SFX.tick(.05); }); })(t); };
    EFX['Globe flyover'] = function (s) { mk('div', 'y-space', null, s); var g = mk('div', 'y-globe', '<div class="y-gm"></div><div class="y-gl"></div>', s);
      mk('div', 'y-fly', '<svg viewBox="0 0 400 200"><path d="M70 150 Q 200 -20 330 120"/></svg><i class="a"></i><i class="b"></i><span class="la">START</span><span class="lb">' + esc(d.subj.split(' ').slice(0, 2).join(' ').toUpperCase()) + '</span>', s); at(300, function () { SFX.whoosh(.35); }); };
    EFX['Odometer'] = function (s) { pic(s, 9, 'dim'); var v = String(Math.round(NUMV)), w = mk('div', 'y-odo', null, s);
      v.split('').forEach(function (c, k) { var col = mk('span', '', '', w), str = mk('i', '', '0123456789'.split('').concat(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']).join('<br>'), col); setTimeout(function () { str.style.transform = 'translateY(' + (-(10 + +c) * 1) + 'em)'; }, 60); str.style.transitionDuration = (1 + k * .18) + 's'; });
      mk('div', 'y-odol', esc(d.num ? d.numSent.split(' ').slice(0, 8).join(' ') + '…' : 'and counting'), s); for (var k = 0; k < 10; k++) at(k * 110, function () { SFX.tick(.05); }); };
    EFX['Flowchart'] = function (s) { mk('div', 'y-fcbg', null, s); var w = mk('div', 'y-fc', '<svg viewBox="0 0 800 300" preserveAspectRatio="none"><path d="M120 150 H320"/><path d="M320 150 C 380 150, 400 70, 480 70"/><path d="M320 150 C 380 150, 400 230, 480 230"/><path d="M480 70 C 560 70, 580 150, 680 150"/><path d="M480 230 C 560 230, 580 150, 680 150"/></svg>', s);
      [['Idea', 15, 50], [d.subj.split(' ')[0], 40, 50], ['Facts', 60, 23], ['Pictures', 60, 77], ['VIDEO', 85, 50]].forEach(function (n, k) { var e = mk('b', '', esc(n[0]), w); e.style.left = n[1] + '%'; e.style.top = n[2] + '%'; e.style.animationDelay = (k * .18) + 's'; at(k * 180, function () { SFX.pop(.1); }); });
      for (var k = 0; k < 6; k++) { var p = mk('i', 'y-pk', null, w); p.style.animationDelay = (k * .35) + 's'; p.style.offsetPath = 'path("' + ['M120 150 H320', 'M320 150 C 380 150, 400 70, 480 70', 'M320 150 C 380 150, 400 230, 480 230', 'M480 70 C 560 70, 580 150, 680 150', 'M480 230 C 560 230, 580 150, 680 150', 'M120 150 H320'][k] + '")'; } };
    EFX['Spectrum'] = function (s) { pic(s, 10, 'dim'); var w = mk('div', 'y-spec', null, s), r = mk('div', 'y-rad', null, w); for (var k = 0; k < 48; k++) { var b = mk('i', '', null, r); b.style.setProperty('--a', (k * 7.5) + 'deg'); b.style.animationDelay = (-Math.random()) + 's'; }
      var o = mk('div', 'y-osc', null, s); for (var k2 = 0; k2 < 40; k2++) { var b2 = mk('i', '', null, o); b2.style.animationDelay = (-Math.random()) + 's'; } mk('b', 'y-spt', esc(KW(2)), w); };
    EFX['Card fan'] = function (s) { pic(s, 11, 'blurbg'); var w = mk('div', 'y-fan', null, s); for (var k = 0; k < 5; k++) { var c = mk('div', 'y-card', '<div></div><span>' + esc(KW(k)) + '</span>', w); if (IM(k + 11)) c.firstChild.style.backgroundImage = 'url("' + IM(k + 11) + '")'; c.style.setProperty('--k', k - 2); c.style.animationDelay = (k * .1) + 's'; at(k * 100, function () { SFX.whoosh(.12); }); } };
    EFX['Isometric tilt'] = function (s) { mk('div', 'y-isobg', null, s); var w = mk('div', 'y-iso', null, s); for (var k = 0; k < 9; k++) { var c = mk('div', '', null, w); if (IM(k)) c.style.backgroundImage = 'url("' + IM(k) + '")'; c.style.animationDelay = (k * .06) + 's'; } };
    EFX['Page peel'] = function (s) { pic(s, 13, ''); var t = pic(s, 12, 'y-peel'); mk('i', 'y-curl', null, s); at(600, function () { SFX.whoosh(.3); }); };
    EFX['Parallax'] = function (s) { pic(s, 14, 'y-px1'); var m = mk('div', 'y-px2', null, s); if (IM(15)) m.style.backgroundImage = 'url("' + IM(15) + '")'; mk('div', 'y-px3', esc(d.subj), s); capOn(true); };
    EFX['Cinematic zoom'] = function (s) { pic(s, 16, 'y-cz'); mk('div', 'y-czt', esc(sent(1).split(' ').slice(0, 7).join(' ')), s); };
    EFX['TV signal off'] = function (s) { var w = mk('div', 'y-tv', '<div class="y-bars7"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="y-snow"></div><b>NO SIGNAL</b>', s); SFX.glitch(); at(1400, function () { w.classList.add('off'); SFX.glitch(); }); };
    EFX['Pixelate'] = function (s) { var c = mk('canvas', 'y-pix', null, s), g = c.getContext('2d'), im = new Image(); im.crossOrigin = null; im.referrerPolicy = 'no-referrer'; c.width = 320; c.height = 180;
      im.onload = function () { var steps = [6, 10, 16, 28, 48, 80, 160, 320]; steps.forEach(function (w2, k) { at(150 + k * 220, function () { var h2 = Math.max(1, Math.round(w2 * 9 / 16)), t = document.createElement('canvas'); t.width = w2; t.height = h2; var tg = t.getContext('2d'); var r = Math.max(w2 / im.width, h2 / im.height); tg.drawImage(im, (w2 - im.width * r) / 2, (h2 - im.height * r) / 2, im.width * r, im.height * r); g.imageSmoothingEnabled = false; g.drawImage(t, 0, 0, 320, 180); SFX.tick(.05); }); }); };
      im.src = IM(17); mk('div', 'y-pixt', 'ENHANCE', s); };
    EFX['Starburst'] = function (s) { mk('div', 'y-burst', null, s); mk('div', 'y-burstt', esc(KW(3)), s); SFX.boom(.4); };
    EFX['Myth vs fact'] = function (s) { pic(s, 18, 'dim'); var w = mk('div', 'y-myth', '<p class="m">“' + esc(d.subj) + ' is just a legend.”</p><b class="s1">MYTH</b><p class="f"></p><b class="s2">FACT</b>', s);
      w.querySelector('.f').textContent = sent(0).split(' ').slice(0, 14).join(' ') + '…'; at(500, function () { SFX.boom(.35); }); at(1500, function () { SFX.ding(); }); };
    EFX['Constellation'] = function (s) { mk('div', 'y-voidbg', null, s); var svg = '<svg viewBox="0 0 400 225" class="y-con">'; var C = ['#8052FF', '#FFB829', '#15846E', '#FF4D9D', '#22D3EE'];
      for (var k = 0; k < 46; k++) { var a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 70, x = 200 + Math.cos(a) * r * 1.5, y = 112 + Math.sin(a) * r, z = 4 + Math.random() * 7, ro = Math.random() * 360;
        svg += '<polygon points="' + x + ',' + (y - z) + ' ' + (x + z) + ',' + (y + z * .8) + ' ' + (x - z) + ',' + (y + z * .8) + '" stroke="' + C[k % 5] + '" transform="rotate(' + ro + ' ' + x + ' ' + y + ')" style="animation-delay:' + (k * .02) + 's"/>'; }
      mk('div', 'y-conw', svg + '</svg>', s); mk('div', 'y-cont', '<em>' + esc(d.mood.toUpperCase()) + ' · ' + esc(d.year || 'TODAY') + '</em><b>' + esc(d.subj) + '</b>', s); };
    EFX['Duotone print'] = function (s) { pic(s, 19, 'y-duo'); mk('div', 'y-duoc', null, s); mk('div', 'y-duot', esc(KW(4)), s); };
    EFX['Halftone pop'] = function (s) { pic(s, 20, 'y-ht'); mk('div', 'y-htd', null, s); mk('div', 'y-htt', esc({ noir: 'WHAT?!', epic: 'NO WAY!', cosmos: 'WOW!', calm: 'AHH…', money: '$$$!', neon: 'WAIT!' }[d.mood]), s); SFX.pop(.25); };
    EFX['Topo map'] = function (s) { mk('div', 'y-topo', null, s); var p = mk('div', 'y-tpin', '<i></i><b></b>', s); p.querySelector('b').textContent = d.subj; at(400, function () { SFX.pop(.2); }); };
    LIST.forEach(function (name, i) { var how = i ? LK.tr[Math.floor(Math.random() * LK.tr.length)] : 'cut';
      at(i * SD, function () { var s = scene(i, how); if (i && how !== 'cut' && how !== 'tvoff' && how !== 'flash') SFX.whoosh(.22); try { (EFX[name] || EFX['Cinematic zoom'])(s); } catch (e) { pic(s, i, 'kb'); } });
      if (/zoom|Orbit|Layer|Rack|Dolly|Parallax|Loupe|Card|Isometric/.test(name)) capsRun(i * SD + 250, (i + 1) * SD - 200); else at(i * SD + 10, function () { capOn(false); }); });
    at(LIST.length * SD, function () { var s = scene(LIST.length - 1, 'zoom'); chap.classList.add('hide'); capOn(false); lb.classList.remove('on'); pic(s, 0, 'blur');
      s.insertAdjacentHTML('beforeend', '<div class="hf-endw"><div class="hf-nx" style="background-image:url(&quot;' + IM(5) + '&quot;)"><span>Watch next</span></div><div class="hf-sub">SUBSCRIBE<i class="hf-cur"></i></div><div class="hf-nx" style="background-image:url(&quot;' + IM(6) + '&quot;)"><span>Watch next</span></div></div>');
      SFX.boom(.5); at(1300, function () { SFX.tick(.15); SFX.pop(.2); }); });
    var fin = function () { if (my !== runId || hf.querySelector('.hf-done')) return; mk('div', 'hf-done', '✅ Saved: my-video.mp4 · 1080p · ' + Math.round(D / 1000) + 's'); SFX.ding(); done && done(); };
    at(D, fin);
    skip.onclick = function () { clear(); runId++; my = runId; fin2(); };
    function fin2() { mk('div', 'hf-done', '✅ Saved: my-video.mp4 · 1080p'); done && done(); }
  }
  function run(q) { clear(); waveOn(false); running = true; var my0 = ++runId; root.classList.add('rolling'); var old = $('vstStage').querySelector('.vst-clapper'); if (old) old.remove(); show('hello'); step(-1); SFX.whoosh(.3);
    clapper(function () { if (my0 === runId) run2(q); }); }
  function run2(q) {
    var my = runId;
    ['vstIdeas', 'vstScript', 'vstBoard', 'vstTh'].forEach(function (id) { $(id).innerHTML = ''; }); $('hf').innerHTML = ''; $('vstHookN').textContent = '0'; $('vstHookBar').style.height = '0';
    step(0); show(0); $('vstSrc').textContent = 'Searching what’s winning for “' + q + '”…';
    var W = [];
    W.forEach(function (c, k) { later(function () { var e = document.createElement('div'); e.className = 'vst-idea real'; e.innerHTML = '<b>' + fmt(c[10]) + '</b><p></p><em>real video · ' + esc(c[0]) + '</em>'; e.querySelector('p').textContent = c[9]; $('vstIdeas').appendChild(e); requestAnimationFrame(function () { e.classList.add('in'); }); }, 200 + k * 300); });
    say('\uD83D\uDD0E Looking up \u201c' + q + '\u201d\u2026'); wiki(q).then(function (wk) { say('\uD83D\uDDBC\uFE0F Finding free pictures' + (wk ? ' of ' + wk.title : '') + '\u2026'); return pics(wk ? wk.title.replace(/ \(.*\)$/, '') : (words(q).slice(0, 2).join(' ') || q)).then(function (ph) { return (ph.length < 3 && wk) ? pics(q).then(function (p2) { return [wk, ph.concat(p2)]; }) : [wk, ph]; }); }).then(function (r) {
      if (my !== runId) return; var wk = r[0], d = build(q, wk), ph = r[1].map(function (x) { return x.src; }), list = [];
      var art = (wk && wk.imgs) || []; for (var z = 0; z < Math.max(art.length, ph.length); z++) { if (art[z]) list.push(art[z]); if (ph[z]) list.push(ph[z]); }
      return Promise.all(list.slice(0, 18).map(load)).then(function (ok) { if (my !== runId) return; var imgs = ok.filter(Boolean); go(d, imgs, wk, r[1]); });
    });
    function go(d, imgs, wk, srcs) {
      var W2 = wk ? winners(wk.title.replace(/ \(.*\)$/, '')) : [];
      W2.forEach(function (c, k) { var e = document.createElement('div'); e.className = 'vst-idea real in'; e.innerHTML = '<b>' + fmt(c[10]) + '</b><p></p><em>real video \u00b7 ' + esc(c[0]) + '</em>'; e.querySelector('p').textContent = c[9]; $('vstIdeas').insertBefore(e, $('vstIdeas').firstChild); });
      $('vstSrc').textContent = (wk ? 'Facts: Wikipedia “' + wk.title + '”' : 'No encyclopedia page found, so the script stays general') + ' · ' + (imgs.length ? imgs.length + ' free pictures found (Wikimedia, Openverse)' : 'no free pictures found for this one');
      var T = 0;
      d.titles.forEach(function (title, k) { later(function () { var e = document.createElement('div'); e.className = 'vst-idea'; e.innerHTML = '<b>' + ['Strongest', 'Proven', 'Fresh'][k] + '</b><p></p><em>' + ['best match to what’s winning', 'format that keeps working', 'new angle'][k] + '</em>'; e.querySelector('p').textContent = title; $('vstIdeas').appendChild(e); SFX.pop(); requestAnimationFrame(function () { e.classList.add('in'); }); }, 500 + k * 380); });
      later(function () { var f = $('vstIdeas').querySelector('.vst-idea:not(.real)'); if (f) f.classList.add('pick'); }, 1900);
      T = 2700; later(function () { step(1); show(1); }, T);
      var ws = d.script.split(' ').slice(0, 60);
      ws.forEach(function (w, k) { later(function () { var el = $('vstScript'); el.innerHTML = esc(ws.slice(0, k + 1).join(' ')) + '<span class="cur"></span>'; el.scrollTop = el.scrollHeight;
        if (k % 2 === 0) SFX.tick(); var n = Math.min(9, Math.round(k / ws.length * 12)); $('vstHookN').textContent = n; $('vstHookBar').style.height = n * 10 + '%'; }, T + 300 + k * 70); });
      T += 400 + ws.length * 70 + 500;
      later(function () { step(2); show(2); waveOn(true); }, T); T += 2200;
      later(function () { waveOn(false); step(3); show(3); }, T);
      var sc = [d.hook].concat(d.facts).slice(0, 6);
      sc.forEach(function (s, k) { later(function () { var e = document.createElement('div'); e.className = 'vst-tile'; var im = imgs[k % Math.max(1, imgs.length)];
        e.innerHTML = (im ? '<img src="' + esc(im) + '" alt="" referrerpolicy="no-referrer">' : '<div class="vst-noimg"></div>') + '<span>' + (k + 1) + '</span><em></em>'; e.querySelector('em').textContent = s.split(' ').slice(0, 8).join(' ') + '…'; $('vstBoard').appendChild(e); SFX.pop(.12);
        requestAnimationFrame(function () { e.classList.add('in'); }); }, T + 150 + k * 220); });
      T += 150 + 6 * 220 + 900;
      later(function () { step(4); show(4); player(d, imgs, function () {
        later(function () { step(5); show(5);
          d.titles.slice(0, 3).forEach(function (title, k) { later(function () { var e = document.createElement('div'); e.className = 'vst-tc'; e.style.setProperty('--r', [-3, 1.5, -1][k] + 'deg');
            var tx = [d.subj.split(' ').slice(0, 2).join(' '), { noir: 'NO ANSWERS', epic: 'LOST FOREVER', cosmos: 'NOT POSSIBLE?', calm: 'SLEEP NOW', money: 'THEY HIDE THIS', neon: 'WAIT, WHAT?' }[d.mood], d.year || 'THE TRUTH'][k];
            var im = imgs[[0, 2, 3][k] % Math.max(1, imgs.length)];
            e.innerHTML = (im ? '<img src="' + esc(im) + '" alt="" referrerpolicy="no-referrer">' : '<div class="vst-noimg"></div>') + '<b></b>'; e.querySelector('b').textContent = String(tx).toUpperCase(); e.querySelector('b').style.color = [GRADE[d.mood][0], '#FFFFFF', '#FFC857'][k];
            e.onclick = function () { [].forEach.call($('vstTh').children, function (x) { x.classList.toggle('pick', x === e); }); };
            $('vstTh').appendChild(e); SFX.whoosh(.2); requestAnimationFrame(function () { e.classList.add('in'); }); }, 300 + k * 300); });
          later(function () { var f = $('vstTh').firstChild; if (f) f.classList.add('pick'); step(6); running = false; }, 1700); }, 1200); }); }, T);
    }
  }
  var q = $('vstQ');
  $('vstGo').onclick = function () { var v = q.value.trim() || 'The lost city of Pompeii'; q.value = v; run(v); };
  q.addEventListener('keydown', function (e) { if (e.key === 'Enter') $('vstGo').click(); else if (e.key.length === 1) SFX.tick(.05); });
  q.addEventListener('input', function () { root.classList.toggle('typed', !!q.value.trim()); });
  [].forEach.call(root.querySelectorAll('.vst-chips button[data-t]'), function (b) { b.onclick = function () { q.value = b.dataset.t; run(b.dataset.t); }; });
  var sur = $('vstSurprise'); if (sur) sur.onclick = function () {   // a real breakout video's topic from this week's data
    var L = (window.TS_CARDS || []).filter(function (c) { return !c[12] && !c[11] && c[7] >= 3 && /^[\x20-\x7E’]+$/.test(c[9]) && c[9].length < 70 && c[9].split(' ').length >= 4; });
    var c = L[Math.floor(Math.random() * L.length)]; if (!c) return; var t = c[9].replace(/[|#].*$/, '').replace(/\s+/g, ' ').trim(); q.value = t; run(t); };
  // rotating placeholder ideas, so people see they can type anything
  var PH = ['Type any video idea…', 'the Roman Colosseum', 'why the Titanic sank', 'the deepest part of the ocean', 'Genghis Khan', 'the Bermuda Triangle', 'how the pyramids were built'], pi = 0;
  setInterval(function () { if (document.activeElement === q || q.value) return; pi = (pi + 1) % PH.length; q.placeholder = PH[pi]; }, 2200);
  var auto = false, took = false;   // the demo plays itself once, but steps aside the moment a person touches it
  ['focus', 'keydown', 'pointerdown'].forEach(function (ev) { q.addEventListener(ev, function () { took = true; }); });
  root.addEventListener('click', function (e) { if (e.target.closest('button')) took = true; }, true);
  function check() { if (auto || took) return; var r = root.getBoundingClientRect(); if (r.top < innerHeight * .55 && r.bottom > innerHeight * .3) { auto = true;
    var t = 'The lost city of Pompeii', i = 0; q.value = ''; var iv = setInterval(function () { if (took) { clearInterval(iv); return; } q.value = t.slice(0, ++i); if (i >= t.length) { clearInterval(iv); setTimeout(function () { if (!running && !took) run(t); }, 350); } }, 45); } }
  addEventListener('scroll', check, { passive: true }); setTimeout(check, 1500);
})();

// ===== Ask the Data: chat commands answered with this week's real numbers =====
(function () {
  var log = document.getElementById('adLog'), cmds = document.getElementById('adCmds'); if (!log || !cmds) return;
  var fmt = function (n) { return n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : String(n); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function niche(word) { var D = window.TS_DATA; if (!D) return null; var L = D.niches.filter(function (n) { return n[0].toLowerCase().indexOf(word) >= 0; }); return L.sort(function (a, b) { return b[2] - a[2]; })[0] || null; }
  function cardsIn(word) { return (window.TS_CARDS || []).filter(function (c) { return (c[3] || '').toLowerCase().indexOf(word) >= 0 && !c[12]; }); }
  function msg(cls, who, html) { var m = document.createElement('div'); m.className = 'ad-m ' + cls;
    m.innerHTML = '<span class="ad-av">' + (cls === 'bot' ? '🛰️' : 'Y') + '</span><div style="min-width:0;flex:1"><b>' + who + '</b>' + html + '</div>'; log.appendChild(m);
    while (log.children.length > 4) log.removeChild(log.firstChild); return m; }
  var A = {
    niche: function () { var n = niche('horror'); if (!n) return '<p>Horror data is loading. Try again in a second.</p>';
      return '<div class="ad-card"><h6>🔎 ' + esc(n[0]) + '</h6><div class="ad-stats"><div><b>' + n[2] + '</b><span>niche score</span></div><div><b>$' + n[3].toFixed(2) + '</b><span>RPM (est.)</span></div><div><b>' + fmt(n[4]) + '</b><span>median views/mo</span></div></div>'
        + '<div class="ad-bar"><i data-w="' + n[2] + '"></i></div><ul><li>Crowding: <b>' + esc(n[6]) + '</b> · effort: <b>' + esc(n[7]) + '</b></li><li>Study: ' + esc((n[8] || []).slice(0, 2).join(', ')) + '</li></ul></div>'; },
    breakout: function () { var L = (window.TS_CARDS || []).filter(function (c) { return c[5] && c[5] <= 90 && !c[11] && !c[12]; }).sort(function (a, b) { return b[4] - a[4]; }).slice(0, 3);
      if (!L.length) return '<p>No breakouts in the sample right now.</p>';
      return '<div class="ad-card"><h6>💥 Youngest channels winning now</h6><ul>' + L.map(function (c) { return '<li><b>' + esc(c[0]) + '</b> · ' + esc(c[3]) + ' · ' + fmt(c[4]) + ' views/mo at ' + c[5] + ' days old</li>'; }).join('') + '</ul></div>'; },
    ideas: function () { var L = cardsIn('history').sort(function (a, b) { return b[10] - a[10]; }).slice(0, 3);
      return '<div class="ad-card"><h6>💡 Titles winning in History</h6><ul>' + (L.length ? L.map(function (c) { return '<li>' + esc(c[9]) + ' <b>(' + fmt(c[10]) + ')</b></li>'; }).join('') : '<li>Loading the data...</li>') + '</ul><p style="margin:8px 0 0;font-size:13px;color:#A5B4FC">Copy the format, never the video.</p></div>'; },
    earn: function () { var rpm = 4.5; return '<div class="ad-card"><h6>💰 1M views a month</h6><div class="ad-stats"><div><b>$' + Math.round(rpm * 1000 * .7).toLocaleString() + '</b><span>low</span></div><div><b>$' + Math.round(rpm * 1000).toLocaleString() + '</b><span>typical</span></div><div><b>$' + Math.round(rpm * 1000 * 1.6).toLocaleString() + '</b><span>high</span></div></div><p style="margin:8px 0 0;font-size:13px;color:#A5B4FC">Estimates from niche RPMs. Real earnings vary.</p></div>'; }
  };
  var busy = false;
  function ask(b) { if (busy) return; busy = true; b.classList.add('used'); cmds.classList.remove('nudge');
    msg('me', 'You', '<p>' + esc(b.textContent) + '</p>');
    setTimeout(function () { var m = msg('bot', 'Tube Search <small>BOT</small>', '<span class="ad-typing"><i></i><i></i><i></i></span>');
      setTimeout(function () { m.querySelector('div').innerHTML = '<b>Tube Search <small>BOT</small></b>' + A[b.dataset.c]();
        var bar = m.querySelector('.ad-bar i'); if (bar) requestAnimationFrame(function () { bar.style.width = bar.dataset.w + '%'; }); busy = false; }, 900); }, 350); }
  [].forEach.call(cmds.querySelectorAll('button'), function (b) { b.onclick = function () { ask(b); }; });
  // first view: answers Maya's question by itself, then nudges the visitor to try the rest
  var done = false; function check() { if (done) return; var r = log.getBoundingClientRect(); if (r.top < innerHeight * .7 && r.bottom > 0) { done = true; setTimeout(function () { ask(cmds.querySelector('[data-c="niche"]')); setTimeout(function () { cmds.classList.add('nudge'); }, 1800); }, 900); } }
  addEventListener('scroll', check, { passive: true }); setTimeout(check, 1500);
})();

// ===== the new feature cards draw their little charts when they come into view =====
(function () { var L = [].slice.call(document.querySelectorAll('.vc')); if (!L.length) return;
  function check() { L.forEach(function (c) { if (!c.classList.contains('in') && c.getBoundingClientRect().top < innerHeight * .9) c.classList.add('in'); }); }
  addEventListener('scroll', check, { passive: true }); setTimeout(check, 800); })();

// ===== My Video Studio: a YouTube-style watch page for our own videos (v4w) =====
// Add a video: one more entry in VIDS (files in media/studio/, chapter pictures in media/studio/ch/<id>-<n>.jpg, chapters in seconds).
(function () {
  var root = document.getElementById('vsv'); if (!root) return;
  var VIDS = [
    { id: 'bullet-hole-trap', t: 'The Bullet Hole Trap: Why Copying One Viral Video Never Works', dur: 80.9, tag: 'HyperFrames + Remotion',
      meta: 'Made with HyperFrames + Remotion · Hand-drawn cartoon · <em>#survivorship</em> <em>#history</em>',
      d: 'In 1943 the army wanted to armor the bullet holes. One statistician asked where the missing planes were. Hand-drawn cartoon, Tim, and the iceberg nobody sees. Made with a Tube Search idea, Claude, HyperFrames and Remotion.',
      ch: [['Why it got 2 million views', 0], ['1943: the bullet holes', 10.5], ["Wald's one question", 23.5], ['Survivorship bias', 36.5], ["What you don't see", 44.4], ['Study the whole channel', 57.4], ["Don't copy what you see", 73.1]] },
    { id: 'worst-jobs', t: 'The Worst Jobs in History (Ranked)', dur: 58.5, tag: 'HyperFrames',
      meta: 'Made with HyperFrames · Public-domain engravings · <em>#history</em> <em>#ranked</em>',
      d: 'Rat catcher, leech collector, tosher, plague doctor and the Groom of the Stool. Real public-domain pictures, free music, every fact true. Made with a Tube Search idea, Claude and HyperFrames.',
      ch: [['#5 Rat catcher', 5.2], ['#4 Leech collector', 13.6], ['#3 Tosher', 22.0], ['#2 Plague doctor', 30.4], ['#1 Groom of the Stool', 41.4]] },
    { id: 'listerine', t: 'How Listerine Sold Bad Breath', dur: 55.5, tag: 'HyperFrames',
      meta: 'Made with HyperFrames · Mini business documentary · <em>#marketing</em> <em>#business</em>',
      d: 'A mouthwash that went from $115,000 to $8 million in seven years by selling a word nobody used. Real 1920s ads, true numbers, and Tim gets diagnosed.',
      ch: [['The $8 million question', 0], ['Named after a surgeon', 19.0], ['A word nobody used', 28.4], ['Do you have it?', 38.4], ['The lesson', 48.0]] }
  ];
  VIDS.forEach(function (x) { x.src = 'media/studio/' + x.id + '.mp4'; x.poster = 'media/studio/' + x.id + '.jpg';
    x.segs = x.ch.map(function (c, k) { return { n: c[0], t: c[1], img: 'media/studio/ch/' + x.id + '-' + k + '.jpg' }; });
    if (x.segs[0].t > 0.5) x.segs.unshift({ n: 'Intro', t: 0, img: x.poster }); });
  var $ = function (id) { return document.getElementById(id); };
  var v = $('vsvV'), stage = $('vsvStage'), big = $('vsvBig'), snd = $('vsvSnd'), bar = $('ytwBar'), segsEl = $('ytwSegs'), tip = $('ytwTip'),
    chEl = $('vsvCh'), list = $('vsvList'), amb = $('ytwAmb'), actx = amb && amb.getContext('2d'), cur = 0, seen = false, segEls = [], chBtns = [], knob, watched = {};
  function mmss(s) { s = Math.max(0, Math.round(s || 0)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
  function D() { return v.duration || VIDS[cur].dur; }
  function segAt(t) { var x = VIDS[cur], k = 0; x.segs.forEach(function (s, i) { if (t >= s.t) k = i; }); return k; }

  // ---- sidebar ("Up next") ----
  VIDS.forEach(function (x, k) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'ytw-it vsv-it';
    b.innerHTML = '<span class="ytw-th"><img alt="" loading="lazy"><em></em><u></u><span class="np"><span class="ytw-eq"><i></i><i></i><i></i></span>NOW PLAYING</span></span><span class="ytw-ti"><b></b><span>Tube Search Studio ✦</span><span class="tag"></span></span>';
    b.querySelector('img').src = x.poster; b.querySelector('em').textContent = mmss(x.dur); b.querySelector('b').textContent = x.t; b.querySelector('.tag').textContent = x.tag;
    b.onclick = function () { load(k, true); };
    if (matchMedia('(hover: hover)').matches) {   // hover preview, like YouTube
      var pv = null, th = b.querySelector('.ytw-th');
      b.addEventListener('mouseenter', function () { if (k === cur || pv) return; pv = document.createElement('video'); pv.muted = true; pv.playsInline = true; pv.preload = 'auto';
        pv.src = x.src + '#t=' + (x.segs[Math.min(1, x.segs.length - 1)].t + 1); th.appendChild(pv); var p = pv.play(); if (p && p.catch) p.catch(function () {}); });
      b.addEventListener('mouseleave', function () { if (pv) { pv.pause(); pv.remove(); pv = null; } });
    }
    list.appendChild(b);
  });
  var items = [].slice.call(list.children);

  // ---- load a video ----
  function load(i, play) {
    cur = i; var x = VIDS[i];
    v.poster = x.poster; v.src = x.src; v.playbackRate = speed;
    $('vsvT').textContent = x.t; $('ytwMeta').innerHTML = x.meta; $('vsvD').textContent = x.d;
    $('ytwTime').textContent = '0:00 / ' + mmss(x.dur); $('ytwNext').hidden = true; clearInterval(nextT);
    segsEl.innerHTML = ''; segEls = x.segs.map(function (s, k) { var e = document.createElement('div'); e.className = 'ytw-seg';
      var end = k + 1 < x.segs.length ? x.segs[k + 1].t : x.dur; e.style.width = 'calc(' + ((end - s.t) / x.dur * 100) + '% - 3px)'; e.innerHTML = '<i></i>'; segsEl.appendChild(e); return e; });
    knob = document.createElement('div'); knob.className = 'ytw-knob'; segsEl.appendChild(knob);
    chEl.innerHTML = ''; chBtns = x.segs.map(function (s) { var b = document.createElement('button'); b.type = 'button'; b.className = 'ytw-chb';
      b.innerHTML = '<img alt="" loading="lazy"><b></b><span></span><em></em>'; b.querySelector('img').src = s.img; b.querySelector('b').textContent = s.n; b.querySelector('span').textContent = mmss(s.t);
      b.onclick = function () { mkStop(); v.currentTime = s.t; if (v.muted) unmute(false); go(); }; chEl.appendChild(b); return b; });
    items.forEach(function (b, k) { b.classList.toggle('on', k === i); });
    paint(0);
    if (play !== 'quiet') make(i, !!play);
  }
  function go() { var p = v.play(); big.hidden = true; if (p && p.catch) p.catch(function () { big.hidden = false; }); }
  function unmute(restart) { if (restart) v.currentTime = 0; v.muted = false; snd.hidden = true; go(); }

  // ---- the making-of pre-roll: the 6 studio steps run for this video, then the video plays (v4x) ----
  var MK = {
    'bullet-hole-trap': { ideas: [['The Bullet Hole Trap', 94], ['Why Viral Videos Can’t Be Copied', 81], ['WW2 Planes and YouTube', 63]],
      script: ['In 1943 the army mapped every bullet hole on the bombers that came home.', 'One statistician asked a better question: where are the missing planes?'], hook: 9,
      thumbs: ['THE TRAP', 'MISSING PLANES', 'DON’T COPY'] },
    'worst-jobs': { ideas: [['The Worst Jobs in History', 92], ['Gross Jobs Nobody Wants Back', 77], ['Medieval Jobs Explained', 58]],
      script: ['Before you complain about your job, meet the rat catcher.', 'Number five could kill you. Number one was somehow worse.'], hook: 9,
      thumbs: ['WORST JOB EVER', 'NUMBER ONE?!', 'RAT CATCHER'] },
    'listerine': { ideas: [['How Listerine Sold Bad Breath', 95], ['The Word That Made $8 Million', 84], ['Old Ads That Changed Everything', 66]],
      script: ['In 1921, this bottle made $115,000. Seven years later: $8 million.', 'Same bottle. Same formula. They just sold a brand new problem.'], hook: 10,
      thumbs: ['$8 MILLION', 'SOLD FEAR', 'HALITOSIS'] }
  };
  var STEPS = [['Idea', '3 ideas, strongest first'], ['Script', 'Written in your style'], ['Voice', 'Yours, or your ElevenLabs voice'], ['Pictures', 'A picture for every scene'], ['Video', 'Edited right in the app'], ['Thumbnail', '3 to pick from']];
  var DUR_S = [1.7, 1.9, 1.3, 1.5, 1.7, 1.5];
  var mk = document.createElement('div'); mk.className = 'ytw-mk'; mk.id = 'ytwMk'; mk.hidden = true;
  mk.innerHTML = '<div class="mk-side"><p class="mk-k"><i></i>Making your video</p><ol class="mk-steps">' +
    STEPS.map(function (s, k) { return '<li><i>' + (k + 1) + '</i><b>' + s[0] + '</b><span>' + s[1] + '</span></li>'; }).join('') + '</ol></div>' +
    '<div class="mk-view" id="mkView"></div><div class="mk-prog"><i id="mkProg"></i></div>' +
    '<button type="button" class="mk-skip" id="mkSkip"><span id="mkSkipT">Video in 9</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l9 6-9 6zM16 6h2v12h-2z"/></svg></button>';
  stage.appendChild(mk);
  var mkT = [], mkI = [], mkOn = false, mkDone = null;
  function mkClear() { mkT.forEach(clearTimeout); mkI.forEach(clearInterval); mkT = []; mkI = []; }
  function pane(i, k) {
    var x = VIDS[i], m = MK[x.id], img = function (n) { return x.segs[Math.min(n, x.segs.length - 1)].img; };
    if (k === 0) return '<p class="mk-h">3 ideas from your niche, strongest first</p><div class="mk-ideas">' + m.ideas.map(function (d, j) {
      return '<div class="mk-idea' + (j ? '' : ' mk-win') + '" style="animation-delay:' + j * .15 + 's"><b>' + d[0] + '</b><span class="mk-sc"><i style="--w:' + d[1] + '%"></i></span><em>' + d[1] + '</em></div>'; }).join('') + '</div>';
    if (k === 1) return '<p class="mk-h">Script <span class="mk-tag">your style · edit any line</span></p><div class="mk-script" id="mkScript"></div><div class="mk-hook"><span>Hook score</span><b><i style="--w:' + m.hook * 10 + '%"></i></b><em>' + m.hook + '/10</em></div>';
    if (k === 2) { var bars = ''; for (var j = 0; j < 34; j++) bars += '<i style="animation-delay:' + (-((j * 37) % 100) / 100).toFixed(2) + 's;--h:' + (25 + (j * 53) % 70) + '%"></i>';
      return '<p class="mk-h">Voice</p><div class="mk-wave">' + bars + '</div><p class="mk-note">This one is music + captions. Yours can use your own voice or your ElevenLabs voice.</p>'; }
    if (k === 3) return '<p class="mk-h">A picture for every scene</p><div class="mk-board">' + x.segs.slice(0, 6).map(function (s, j) {
      return '<div style="animation-delay:' + j * .14 + 's"><img src="' + s.img + '" alt=""><span>' + (j + 1) + '</span></div>'; }).join('') + '</div>';
    if (k === 4) return '<p class="mk-h">Editing <span class="mk-tag">1920x1080 · 30 fps · music · captions</span></p><div class="mk-film"><div class="mk-strip">' +
      x.segs.concat(x.segs).map(function (s) { return '<img src="' + s.img + '" alt="">'; }).join('') + '</div><i class="mk-head"></i></div><div class="mk-render"><b><i id="mkRen"></i></b><em id="mkPct">0%</em></div>';
    if (k === 5) return '<p class="mk-h">3 thumbnails to pick from</p><div class="mk-thumbs">' + m.thumbs.map(function (t, j) {
      return '<div class="' + (j ? '' : 'pick') + '" style="animation-delay:' + j * .16 + 's"><img src="' + (j ? img(j * 2) : x.poster) + '" alt=""><b>' + t + '</b>' + (j ? '' : '<em>✓ Picked</em>') + '</div>'; }).join('') + '</div>';
  }
  function make(i, play) {
    mkClear(); mkOn = true; v.pause(); try { v.currentTime = 0; } catch (e) {}
    big.hidden = true; snd.hidden = true; $('ytwNext').hidden = true; stage.classList.add('mk'); mk.hidden = false; mk.classList.remove('out');
    var lis = [].slice.call(mk.querySelectorAll('.mk-steps li')), view = $('mkView'), total = DUR_S.reduce(function (a, b) { return a + b; }, 0), t0 = performance.now();
    lis.forEach(function (li) { li.className = ''; });
    var prog = $('mkProg'); prog.style.transition = 'none'; prog.style.width = '0%'; void prog.offsetWidth; prog.style.transition = 'width ' + total + 's linear'; prog.style.width = '100%';
    var skipT = $('mkSkipT'); mkI.push(setInterval(function () { var left = Math.max(0, Math.ceil(total - (performance.now() - t0) / 1000)); skipT.textContent = left > 0 ? 'Video in ' + left : 'Starting'; }, 200));
    skipT.textContent = 'Video in ' + Math.ceil(total);
    var at = 0;
    DUR_S.forEach(function (d, k) {
      mkT.push(setTimeout(function () {
        lis.forEach(function (li, j) { li.classList.toggle('done', j < k); li.classList.toggle('on', j === k); });
        view.innerHTML = '<div class="mk-pane">' + pane(i, k) + '</div>';
        if (k === 1) { var sc = $('mkScript'), lines = MK[VIDS[i].id].script, full = lines.join('\n'), n = 0;
          mkI.push(setInterval(function () { n += 3; sc.innerHTML = full.slice(0, n).replace(/\n/g, '<br>') + '<i class="mk-cur"></i>'; if (n >= full.length) n = full.length; }, 22)); }
        if (k === 4) { var p = 0; mkI.push(setInterval(function () { p = Math.min(100, p + 4); var r = $('mkRen'), c = $('mkPct'); if (r) r.style.width = p + '%'; if (c) c.textContent = p + '%'; }, 55)); }
      }, at * 1000));
      at += d;
    });
    mkT.push(setTimeout(function () { lis.forEach(function (li) { li.className = 'done'; }); }, (total - .35) * 1000));
    mkDone = function () {
      mkClear(); mkOn = false; mk.classList.add('out'); stage.classList.remove('mk');
      setTimeout(function () { if (!mkOn) mk.hidden = true; }, 450);
      if (play) { v.muted = false; snd.hidden = true; go(); }
      else { v.muted = true; var pp = v.play(); if (pp && pp.then) pp.then(function () { big.hidden = true; snd.hidden = false; }, function () { big.hidden = false; }); }
    };
    mkT.push(setTimeout(function () { if (mkDone) mkDone(); }, total * 1000 + 150));
  }
  $('mkSkip').onclick = function () { if (mkOn && mkDone) mkDone(); };
  function mkStop() { if (!mkOn) return; mkClear(); mkOn = false; mk.hidden = true; stage.classList.remove('mk'); }

  // ---- progress, chapters, time ----
  function paint(t) {
    var x = VIDS[cur], d = D(), k = segAt(t);
    segEls.forEach(function (e, i) { var s = x.segs[i], end = i + 1 < x.segs.length ? x.segs[i + 1].t : d;
      e.firstChild.style.width = Math.max(0, Math.min(1, (t - s.t) / (end - s.t))) * 100 + '%'; });
    if (knob) knob.style.left = (t / d * 100) + '%';
    $('ytwTime').textContent = mmss(t) + ' / ' + mmss(d);
    $('ytwChap').textContent = x.segs[k].n;
    chBtns.forEach(function (b, i) { b.classList.toggle('on', i === k); var s = x.segs[i], end = i + 1 < x.segs.length ? x.segs[i + 1].t : d;
      b.lastChild.style.width = Math.max(0, Math.min(1, (t - s.t) / (end - s.t))) * 100 + '%'; });
    watched[cur] = Math.max(watched[cur] || 0, t / d);
    items.forEach(function (b, i) { b.querySelector('u').style.width = (watched[i] || 0) * 100 + '%'; });
    if (t / d > .75) $('ytwSub').classList.add('glow');
  }
  var raf = 0, ambT = 0;
  function tick(now) {
    raf = 0; if (v.paused) return; paint(v.currentTime);
    if (actx && now - ambT > 220) { ambT = now; try { actx.drawImage(v, 0, 0, 48, 27); } catch (e) {} }
    raf = requestAnimationFrame(tick);
  }
  v.addEventListener('play', function () { stage.classList.add('playing'); stage.classList.remove('paused'); if (!raf) raf = requestAnimationFrame(tick); wake(); });
  v.addEventListener('pause', function () { stage.classList.remove('playing'); stage.classList.add('paused'); stage.classList.remove('idle'); });
  v.addEventListener('volumechange', function () { stage.classList.toggle('muted', v.muted); });
  v.addEventListener('timeupdate', function () { if (v.paused) paint(v.currentTime); });
  v.addEventListener('loadedmetadata', function () { paint(v.currentTime); });
  function frac(e) { var r = segsEl.getBoundingClientRect(); return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); }
  bar.addEventListener('click', function (e) { v.currentTime = frac(e) * D(); paint(v.currentTime); if (v.paused) go(); });
  bar.addEventListener('mousemove', function (e) { var f = frac(e), t = f * D(), k = segAt(t), s = VIDS[cur].segs[k], r = segsEl.getBoundingClientRect();
    tip.style.left = Math.max(85, Math.min(r.width - 85, f * r.width)) + 'px'; $('ytwTipI').src = s.img; $('ytwTipC').textContent = s.n; $('ytwTipT').textContent = mmss(t); });
  function flash() { var f = $('ytwFlash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); }
  function toggle() { if (v.paused) { if (v.ended) v.currentTime = 0; go(); } else v.pause(); flash(); }
  v.addEventListener('click', toggle); $('ytwPlay').onclick = toggle;
  big.onclick = function () { if (v.muted || v.ended) v.currentTime = 0; unmute(false); };
  snd.onclick = function () { unmute(true); };
  $('ytwVol').onclick = function () { v.muted = !v.muted; if (!v.muted) snd.hidden = true; };
  var SP = [1, 1.25, 1.5, 2, .75], speed = 1;
  $('ytwSpeed').onclick = function () { speed = SP[(SP.indexOf(speed) + 1) % SP.length]; v.playbackRate = speed; this.textContent = speed + 'x'; };
  $('ytwCC').onclick = function () { this.classList.toggle('on'); };
  $('ytwFs').onclick = function () { var el = stage; if (document.fullscreenElement) document.exitFullscreen(); else if (el.requestFullscreen) el.requestFullscreen(); else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen(); };
  $('ytwNextB').onclick = function () { load((cur + 1) % VIDS.length, true); };
  var idleT; function wake() { stage.classList.remove('idle'); clearTimeout(idleT); idleT = setTimeout(function () { if (!v.paused) stage.classList.add('idle'); }, 2600); }
  stage.addEventListener('mousemove', wake); stage.addEventListener('touchstart', wake, { passive: true });

  // ---- end: "Up next" countdown, then the next video ----
  var nextT;
  v.addEventListener('ended', function () {
    $('ytwSub').classList.add('glow'); var bell = root.querySelector('.ytw-bell'); bell.classList.remove('ring'); void bell.offsetWidth; bell.classList.add('ring');
    snd.hidden = true;
    if (!$('ytwAuto').checked) { big.hidden = false; return; }
    var n = (cur + 1) % VIDS.length, left = 6, box = $('ytwNext'); $('ytwNi').src = VIDS[n].poster; $('ytwNt').textContent = VIDS[n].t; $('ytwNs').textContent = left; box.hidden = false;
    clearInterval(nextT); nextT = setInterval(function () { left--; $('ytwNs').textContent = left; if (left <= 0) { clearInterval(nextT); load(n, true); } }, 1000);
  });
  $('ytwNcancel').onclick = function () { clearInterval(nextT); $('ytwNext').hidden = true; big.hidden = false; };
  $('ytwNplay').onclick = function () { clearInterval(nextT); load((cur + 1) % VIDS.length, true); };

  // ---- like, dislike, share ----
  function pop(el, col) { var r = el.getBoundingClientRect(), pr = root.getBoundingClientRect();
    for (var i = 0; i < 12; i++) { var d = document.createElement('i'); d.className = 'ytw-pop'; d.style.background = col[i % col.length];
      d.style.left = (r.left - pr.left + r.width * .3) + 'px'; d.style.top = (r.top - pr.top + r.height / 2) + 'px'; root.appendChild(d);
      var a = i / 12 * 6.283, dist = 40 + Math.random() * 30;
      d.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(' + Math.cos(a) * dist + 'px,' + Math.sin(a) * dist + 'px) scale(.2)', opacity: 0 }], { duration: 650, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = function () { this.effect.target.remove(); }; } }
  $('ytwLike').onclick = function () { var on = this.classList.toggle('liked'); this.querySelector('span').textContent = on ? 'Liked' : 'Like'; if (on) pop(this, ['#FFC857', '#F0ABFC', '#ff2a3d', '#fff']); };
  $('ytwDis').onclick = function () { var b = this; b.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: 300 }); };
  $('ytwShare').onclick = function () { var b = this, url = location.href.split('#')[0] + '#studio', sp = b.querySelector('span');
    if (navigator.share) { navigator.share({ title: VIDS[cur].t, url: url }).catch(function () {}); return; }
    try { navigator.clipboard.writeText(url); sp.textContent = 'Link copied'; } catch (e) { sp.textContent = 'Copy failed'; } setTimeout(function () { sp.textContent = 'Share'; }, 1800); };

  // ---- the search box types what a creator would search ----
  (function () { var q = $('ytwQ'); if (!q) return; var Q = ['how to start a faceless channel', 'survivorship bias explained', 'worst jobs in history', 'how listerine got rich'], qi = 0, ci = 0, del = false;
    setInterval(function () { var s = Q[qi]; if (!del) { ci++; if (ci > s.length + 14) del = true; } else { ci -= 2; if (ci <= 0) { ci = 0; del = false; qi = (qi + 1) % Q.length; } } q.textContent = s.slice(0, Math.min(ci, s.length)); }, 90); })();

  load(0, 'quiet');
  // plays by itself (muted, browsers require it) the first time the box is on screen; pauses when scrolled away, resumes on return
  var away = false;
  function check() { var r = root.getBoundingClientRect(), vis = r.top < innerHeight * .7 && r.bottom > innerHeight * .25;
    if (vis && !seen) { seen = true; make(cur, false); }
    else if (vis && away) { away = false; if (v.paused && !v.ended) v.play(); }
    else if (!vis && !v.paused) { away = true; v.pause(); } }
  addEventListener('scroll', check, { passive: true }); setTimeout(check, 1500); setInterval(check, 800);
})();
