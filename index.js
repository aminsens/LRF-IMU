/* =====================================================================
   LRF-IMU — All Interactions
   ===================================================================== */
(function () {
  'use strict';

  var qs = function (s, el) { return (el || document).querySelector(s); };
  var qsa = function (s, el) { return Array.from((el || document).querySelectorAll(s)); };

  /* ─── Navigation ─── */
  var navLinks = qsa('.site-nav-links a[data-nav]');
  var tabPanels = qsa('.tab-panel');

  function switchTab(tabId) {
    navLinks.forEach(function (b) { b.classList.toggle('active', b.dataset.nav === tabId); });
    tabPanels.forEach(function (p) { p.classList.toggle('active', p.id === 'panel-' + tabId); });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    history.replaceState(null, '', '#' + tabId);
    // Close mobile menu
    var navLinksWrap = document.getElementById('site-nav-links');
    if (navLinksWrap) navLinksWrap.classList.remove('open');
  }

  navLinks.forEach(function (link) { link.addEventListener('click', function (e) { e.preventDefault(); switchTab(link.dataset.nav); }); });

  // Brand link goes to home
  var brand = qs('.site-brand');
  if (brand) brand.addEventListener('click', function (e) { e.preventDefault(); switchTab('home'); });

  // Mobile menu toggle
  var navToggle = document.getElementById('nav-toggle');
  var navLinksWrap = document.getElementById('site-nav-links');
  if (navToggle && navLinksWrap) {
    navToggle.addEventListener('click', function () {
      var open = navLinksWrap.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }

  var hash = location.hash.replace('#', '');
  if (hash && document.getElementById('panel-' + hash)) switchTab(hash);

  window.addEventListener('hashchange', function () {
    var h = location.hash.replace('#', '');
    if (h && document.getElementById('panel-' + h)) {
      navLinks.forEach(function (b) { b.classList.toggle('active', b.dataset.nav === h); });
      tabPanels.forEach(function (p) { p.classList.toggle('active', p.id === 'panel-' + h); });
    }
  });

  /* ─── Architecture Sub-Tabs ─── */
  var architectureDetails = qs('.disclosure-block');
  if (architectureDetails) architectureDetails.open = true;

  qsa('.arch-tab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      qsa('.arch-tab').forEach(function (b) { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      qsa('.arch-panel').forEach(function (p) { p.classList.remove('active'); p.hidden = true; });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      var panel = document.getElementById('arch-' + btn.dataset.arch);
      if (panel) { panel.classList.add('active'); panel.hidden = false; }
    });
  });

  /* ─── Design Blocks (expand/collapse) ─── */
  qsa('.design-head').forEach(function (head) {
    function toggle() {
      var block = head.closest('.design-block');
      var isOpen = block.classList.toggle('open');
      head.setAttribute('aria-expanded', String(isOpen));
    }
    head.addEventListener('click', toggle);
    head.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

  /* ─── Coverage Panel ─── */
  var covBody = document.getElementById('covBody');
  if (covBody) {
    var PERF = [
      { name: 'TSTR (Synthetic-only)', val: 0.956, max: 1.0, color: 'var(--accent)', sub: 'macro F1' },
      { name: 'TRTR (Real upper bound)', val: 0.985, max: 1.0, color: 'var(--text-3)', sub: 'macro F1' },
      { name: 'Augmented (2 real/class)', val: 0.979, max: 1.0, color: 'var(--green)', sub: 'macro F1' },
      { name: 'Low-data baseline', val: 0.467, max: 1.0, color: 'var(--amber)', sub: 'macro F1' },
      { name: 'VAE-only (no flow)', val: 0.443, max: 1.0, color: '#ef4444', sub: 'macro F1' }
    ];
    var FIDELITY = [
      { name: 'Physical plausibility', val: 100, max: 100, color: 'var(--green)', sub: '0 values > 10 g', pct: '100%' },
      { name: 'Structural fidelity (Δr)', val: 84.2, max: 100, color: 'var(--accent)', sub: 'syn–real ≈ real–real', pct: '0.158' },
      { name: 'Membership inference', val: 50.5, max: 100, color: 'var(--green)', sub: 'near-chance AUC', pct: '0.495' },
      { name: 'Reconstruction attack', val: 100, max: 100, color: 'var(--green)', sub: '0% success rate', pct: '0%' },
      { name: 'TSTR retention', val: 97.1, max: 100, color: 'var(--accent)', sub: 'of TRTR performance', pct: '97.1%' }
    ];

    function renderRows(data) {
      covBody.innerHTML = '';
      data.forEach(function (d) {
        var row = document.createElement('div');
        row.className = 'cov-row';
        var pct = (d.val / d.max * 100).toFixed(1);
        row.innerHTML =
          '<div class="cov-row-inner">' +
          '<div class="cov-name"><span class="cov-dot" style="background:' + d.color + '"></span>' + d.name + '</div>' +
          '<div class="cov-track"><span data-w="' + pct + '%" style="background:' + d.color + '"></span></div>' +
          '<div class="cov-val">' + (d.pct || d.val) + '<small>' + d.sub + '</small></div></div>';
        covBody.appendChild(row);
      });
    }

    function growBars() {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          covBody.querySelectorAll('.cov-track > span').forEach(function (s) {
            var w = s.getAttribute('data-w');
            if (w) s.style.width = w;
          });
        });
      });
      setTimeout(function () {
        covBody.querySelectorAll('.cov-track > span').forEach(function (s) {
          var w = s.getAttribute('data-w');
          if (w) s.style.width = w;
        });
      }, 500);
    }

    renderRows(PERF);
    growBars();

    qsa('.cov-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        qsa('.cov-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        renderRows(tab.dataset.view === 'fidelity' ? FIDELITY : PERF);
        growBars();
        var hint = qs('.cov-hint');
        if (hint) {
          hint.textContent = tab.dataset.view === 'fidelity'
            ? 'Physical plausibility, privacy audit, and retention metrics.'
            : 'Bars are sized relative to the best observed value. Higher is better unless noted.';
        }
      });
    });
  }

  /* ─── Lightbox ─── */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = lightbox ? lightbox.querySelector('img') : null;
  var lightboxCaption = lightbox ? lightbox.querySelector('.lightbox-caption') : null;

  qsa('[data-lightbox]').forEach(function (img) {
    img.addEventListener('click', function () {
      if (!lightbox || !lightboxImg) return;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      var fig = img.closest('figure');
      var cap = fig ? (fig.querySelector('figcaption') || {}).textContent : img.alt;
      if (lightboxCaption) lightboxCaption.textContent = cap || '';
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (lightbox) {
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox && lightbox.classList.contains('open')) closeLightbox();
  });

  /* ─── Copy BibTeX ─── */
  var copyBtn = document.getElementById('copy-bibtex');
  if (copyBtn) {
    copyBtn.addEventListener('click', async function () {
      var text = document.getElementById('bibtex-value').textContent;
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = 'Copied!';
      } catch (err) {
        var range = document.createRange();
        range.selectNodeContents(document.getElementById('bibtex-value'));
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        copyBtn.textContent = 'Selected';
      }
      setTimeout(function () { copyBtn.textContent = 'Copy'; }, 1600);
    });
  }

  /* ─── Stat Count-Up ─── */
  var strip = qs('.stat-strip');
  if (strip && 'IntersectionObserver' in window) {
    var animated = false;
    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
    function animateCounts() {
      if (animated) return;
      animated = true;
      strip.querySelectorAll('.stat-num').forEach(function (el) {
        var raw = el.textContent;
        var target = parseFloat(raw);
        if (isNaN(target)) return;
        var suffix = raw.replace(/[\d.]/g, '');
        var isInt = Number.isInteger(target);
        var t0 = performance.now();
        var dur = 900;
        function step(now) {
          var p = Math.min((now - t0) / dur, 1);
          var v = easeOut(p) * target;
          el.textContent = (isInt ? Math.round(v) : v.toFixed(1)) + suffix;
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = raw;
        }
        requestAnimationFrame(step);
      });
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { animateCounts(); obs.disconnect(); } });
    }, { threshold: 0.4 });
    obs.observe(strip);
  }

  /* ═══════════════════════════════════════════════════════════════════
     TRAJECTORY VIEWER
     ═══════════════════════════════════════════════════════════════════ */
  (function () {
    var root = document.getElementById('trajectory-viewer');
    if (!root) return;

    var el = {
      subject: qs('#traj-subject'),
      activity: qs('#traj-activity'),
      speed: qs('#traj-speed'),
      title: qs('#traj-title'),
      subtitle: qs('#traj-subtitle'),
      download: qs('#traj-download'),
      canvas: qs('#traj-canvas'),
      empty: qs('#traj-empty'),
      range: qs('#traj-range'),
      play: qs('#traj-play'),
      prev: qs('#traj-prev'),
      next: qs('#traj-next'),
      step: qs('#traj-step'),
      time: qs('#traj-time'),
      capRate: qs('#traj-cap-rate'),
      capWindow: qs('#traj-cap-window'),
      capSteps: qs('#traj-cap-steps'),
      nodes: qsa('.traj-node', root)
    };

    var state = {
      entries: [],
      currentEntry: null,
      trajectory: null,
      frameIndex: 0,
      playing: false,
      timer: null,
      abortController: null
    };

    var defaultChannels = ['Acc X', 'Acc Y', 'Acc Z', 'Gyr X', 'Gyr Y', 'Gyr Z'];
    var defaultUnits = ['m/s²', 'm/s²', 'm/s²', 'rad/s', 'rad/s', 'rad/s'];

    var paperActivities = [
      { class_id: 0, activity: 'Walking', slug: 'walking' },
      { class_id: 1, activity: 'Running', slug: 'running' },
      { class_id: 2, activity: 'Jump Up', slug: 'jump-up' },
      { class_id: 3, activity: 'Cycling', slug: 'cycling' }
    ];

    function setEnabled(enabled) {
      [el.subject, el.activity, el.speed, el.range, el.play, el.prev, el.next].forEach(function (e) {
        if (e) e.disabled = !enabled;
      });
    }

    function stopPlayback() {
      state.playing = false;
      if (state.timer) clearInterval(state.timer);
      state.timer = null;
      if (el.play) el.play.textContent = 'Play';
    }

    function setEmpty(msg, detail) {
      stopPlayback();
      state.trajectory = null;
      el.empty.hidden = false;
      el.empty.innerHTML = '<strong>' + escHtml(msg) + '</strong>' + (detail ? '<span>' + escHtml(detail) + '</span>' : '');
      setEnabled(false);
      el.title.textContent = msg;
      el.subtitle.textContent = detail || '';
      drawPlaceholder();
    }

    function escHtml(s) {
      return String(s).replace(/[&<>'"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c];
      });
    }

    function pad2(n) { return String(n).padStart(2, '0'); }

    function pathExists(url) {
      return fetch(url, { method: 'HEAD', cache: 'no-store' })
        .then(function (r) { return r.ok; })
        .catch(function () { return false; });
    }

    function fetchJson(url, signal) {
      return fetch(url, { cache: 'no-store', signal: signal }).then(function (r) {
        if (!r.ok) throw new Error(r.status + ' ' + r.statusText);
        return r.json();
      });
    }

    async function discoverEntries(basePath, maxSubject, knownSubjects) {
      var entries = [];
      var subjects = Array.isArray(knownSubjects) ? knownSubjects.slice() : [];
      var shouldProbe = subjects.length === 0;
      if (shouldProbe) {
        for (var i = 1; i <= maxSubject; i++) subjects.push(i);
      }

      var results = shouldProbe
        ? await Promise.all(subjects.map(async function (subj) {
          var probe = basePath + '/subject_' + pad2(subj) + '/walking.json';
          var exists = await pathExists(probe);
          return exists ? subj : null;
        }))
        : subjects;

      results.filter(function (s) { return s !== null; }).forEach(function (subj) {
        paperActivities.forEach(function (act) {
          entries.push({
            subject: subj,
            subject_label: 'Subject ' + pad2(subj),
            class_id: act.class_id,
            activity: act.activity,
            path: basePath + '/subject_' + pad2(subj) + '/' + act.slug + '.json'
          });
        });
      });

      entries.sort(function (a, b) { return a.subject - b.subject || a.class_id - b.class_id; });
      return entries;
    }

    function normalisePayload(payload, entry) {
      if (Array.isArray(payload.signals) && payload.generation && payload.signal) {
        var steps = payload.generation.stored_steps || [];
        var flowTimes = payload.generation.flow_times || [];
        var subject = payload.provenance && payload.provenance.held_out_subject;
        if (!Number.isFinite(Number(subject))) {
          var m = String(payload.subject || '').match(/(\d+)/);
          subject = m ? Number(m[1]) : entry.subject;
        } else {
          subject = Number(subject);
        }
        return {
          steps: steps,
          flow_times: flowTimes,
          signals_raw: payload.signals,
          metadata: {
            signal: {
              channel_names: payload.signal.channels,
              channel_units: payload.signal.units,
              sampling_rate_hz: payload.signal.sampling_rate_hz,
              window_samples: payload.signal.samples,
              duration_seconds: payload.signal.duration_seconds
            },
            generation: payload.generation,
            activity: { class_name: payload.activity ? payload.activity.name : entry.activity, class_id: payload.activity ? payload.activity.id : entry.class_id },
            fold: { held_out_subject: subject },
            paper_context: {
              matches_accepted_paper_step_count: Number(payload.generation.num_steps) === Number(payload.generation.paper_sampling_steps)
            }
          }
        };
      }
      return payload;
    }

    function validatePayload(p) {
      if (!Array.isArray(p.steps) || !p.steps.length) throw new Error('Missing stored generation steps.');
      if (!Array.isArray(p.signals_raw) || p.signals_raw.length !== p.steps.length) throw new Error('Signals array must have one frame per stored step.');
      var frame = p.signals_raw[0];
      if (!Array.isArray(frame) || !frame.length || !Array.isArray(frame[0])) throw new Error('Signal arrays must have shape [frames, channels, samples].');
    }

    /* ─── Canvas Drawing ─── */
    function resizeCanvas() {
      var canvas = el.canvas;
      var visibleWidth = canvas.clientWidth || (canvas.parentElement && canvas.parentElement.clientWidth);
      if (!visibleWidth) return null;
      var w = Math.max(320, visibleWidth);
      var h = Math.max(380, canvas.clientHeight || 460);
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      var ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { ctx: ctx, w: w, h: h };
    }

    function drawPlaceholder() {
      var r = resizeCanvas();
      if (!r) return;
      r.ctx.clearRect(0, 0, r.w, r.h);
      r.ctx.fillStyle = '#ffffff';
      r.ctx.fillRect(0, 0, r.w, r.h);
      r.ctx.strokeStyle = '#e2e8f0';
      r.ctx.lineWidth = 1;
      for (var i = 1; i < 6; i++) {
        var y = (r.h / 6) * i;
        r.ctx.beginPath();
        r.ctx.moveTo(78, y);
        r.ctx.lineTo(r.w - 14, y);
        r.ctx.stroke();
      }
    }

    function paddedLimits(min, max) {
      if (!Number.isFinite(min) || !Number.isFinite(max)) return [-1, 1];
      if (Math.abs(max - min) < 1e-9) {
        var pad = Math.max(1, Math.abs(max) * 0.1);
        return [min - pad, max + pad];
      }
      var pad2 = (max - min) * 0.08;
      return [min - pad2, max + pad2];
    }

    function frameLimits(frame) {
      return frame.map(function (ch) {
        var finite = ch.filter(Number.isFinite);
        return paddedLimits(Math.min.apply(null, finite), Math.max.apply(null, finite));
      });
    }

    function fmtNum(v) {
      if (!Number.isFinite(v)) return '—';
      var a = Math.abs(v);
      if (a >= 100) return v.toFixed(0);
      if (a >= 10) return v.toFixed(1);
      return v.toFixed(2);
    }

    function drawFrame() {
      if (!state.trajectory) { drawPlaceholder(); return; }

      var signals = state.trajectory.signals_raw;
      var frame = signals[state.frameIndex];
      var meta = state.trajectory.metadata || {};
      var sigMeta = meta.signal || {};
      var names = sigMeta.channel_names || defaultChannels.slice(0, frame.length);
      var units = sigMeta.channel_units || defaultUnits.slice(0, frame.length);
      var samplingRate = Number(sigMeta.sampling_rate_hz || 50);
      var limits = frameLimits(frame);

      var r = resizeCanvas();
      if (!r) return;
      var ctx = r.ctx, w = r.w, h = r.h;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);

      var nCh = frame.length;
      var left = w < 600 ? 60 : 80;
      var right = 16;
      var top = 14;
      var bottom = 26;
      var gap = 6;
      var plotW = Math.max(40, w - left - right);
      var plotH = (h - top - bottom - gap * (nCh - 1)) / nCh;
      var nSamples = frame[0].length;
      var duration = (nSamples - 1) / samplingRate;

      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      frame.forEach(function (values, ch) {
        var yTop = top + ch * (plotH + gap);
        var yBot = yTop + plotH;
        var lim = limits[ch] || [-1, 1];
        var range = lim[1] - lim[0] || 1;

        // Background
        ctx.fillStyle = ch < 3 ? '#f8fbff' : '#fffaf3';
        ctx.fillRect(left, yTop, plotW, plotH);
        ctx.strokeStyle = '#e6ebf2';
        ctx.lineWidth = 1;
        ctx.strokeRect(left + 0.5, yTop + 0.5, plotW - 1, plotH - 1);

        // Grid lines
        for (var g = 1; g < 4; g++) {
          var gx = left + (plotW * g) / 4;
          ctx.beginPath(); ctx.moveTo(gx, yTop); ctx.lineTo(gx, yBot); ctx.stroke();
        }

        // Zero line
        if (lim[0] <= 0 && lim[1] >= 0) {
          var zeroY = yBot - ((0 - lim[0]) / range) * plotH;
          ctx.strokeStyle = '#cbd5e1';
          ctx.beginPath(); ctx.moveTo(left, zeroY); ctx.lineTo(left + plotW, zeroY); ctx.stroke();
        }

        // Channel label
        ctx.fillStyle = '#172033';
        ctx.font = '600 11px Inter, system-ui, sans-serif';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        ctx.fillText(names[ch] || 'Ch ' + (ch + 1), 8, yTop + plotH * 0.38);

        // Unit
        ctx.fillStyle = '#6b778c';
        ctx.font = '10px Inter, system-ui, sans-serif';
        ctx.fillText('[' + (units[ch] || '') + ']', 8, yTop + plotH * 0.62);

        // Y-axis values
        ctx.fillStyle = '#7b8798';
        ctx.font = '9px Inter, system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(fmtNum(lim[1]), left - 5, yTop + 6);
        ctx.fillText(fmtNum(lim[0]), left - 5, yBot - 6);
        ctx.textAlign = 'left';

        // Signal line
        ctx.strokeStyle = ch < 3 ? '#2563eb' : '#b45309';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        values.forEach(function (v, si) {
          var x = left + (si / Math.max(1, nSamples - 1)) * plotW;
          var y = yBot - ((v - lim[0]) / range) * plotH;
          if (si === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke();
      });

      // Time axis
      ctx.fillStyle = '#6b778c';
      ctx.font = '10px Inter, system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('0 s', left, h - 8);
      ctx.textAlign = 'center';
      ctx.fillText((duration / 2).toFixed(1) + ' s', left + plotW / 2, h - 8);
      ctx.textAlign = 'right';
      ctx.fillText(duration.toFixed(1) + ' s', left + plotW, h - 8);
      ctx.textAlign = 'left';
    }

    /* ─── UI Updates ─── */
    function updateFrame() {
      if (!state.trajectory) return;
      var steps = state.trajectory.steps;
      var flowTimes = state.trajectory.flow_times || [];
      state.frameIndex = Math.max(0, Math.min(state.frameIndex, steps.length - 1));
      el.range.value = String(state.frameIndex);
      el.step.textContent = 'Step ' + steps[state.frameIndex] + ' of ' + steps[steps.length - 1];
      var ft = Number(flowTimes[state.frameIndex]);
      el.time.textContent = Number.isFinite(ft) ? 'Flow time t = ' + ft.toFixed(3) : 'Flow time —';
      drawFrame();
      updateRail();
    }

    function updateRail() {
      if (!state.trajectory) return;
      var last = state.trajectory.steps.length - 1;
      var progress = last > 0 ? state.frameIndex / last : 1;
      var active = 0;
      if (progress > 0 && progress < 0.9) active = 1;
      if (progress >= 0.9 && progress < 0.98) active = 2;
      if (progress >= 0.98 && progress < 1) active = 3;
      if (progress >= 1) active = 4;
      el.nodes.forEach(function (node, i) {
        node.classList.toggle('active', i === active);
        node.classList.toggle('complete', i < active);
      });
    }

    function updateMeta() {
      var meta = state.trajectory.metadata || {};
      var gen = meta.generation || {};
      var sig = meta.signal || {};
      var activity = (meta.activity && meta.activity.class_name) || (state.currentEntry && state.currentEntry.activity) || '';
      var subject = (meta.fold && meta.fold.held_out_subject) || (state.currentEntry && state.currentEntry.subject) || 0;
      el.title.textContent = 'Subject ' + pad2(subject) + ' · ' + activity;

      var paperMatch = meta.paper_context && meta.paper_context.matches_accepted_paper_step_count;
      el.subtitle.textContent = paperMatch === false
        ? 'Dense website trajectory; the accepted-paper experiments used 10 Euler integration steps.'
        : 'Decoded states from the exported generation trajectory.';

      if (el.capRate) el.capRate.textContent = sig.sampling_rate_hz ? sig.sampling_rate_hz + ' Hz' : '—';
      if (el.capWindow) el.capWindow.textContent = (sig.window_samples && sig.duration_seconds) ? sig.window_samples + ' samples · ' + sig.duration_seconds + ' s' : '—';
      if (el.capSteps) el.capSteps.textContent = String((state.trajectory.steps && state.trajectory.steps.length) || gen.num_steps || '—');
    }

    function slug(v) { return String(v).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

    /* ─── Load Entry ─── */
    function uniqueSubjects() {
      var map = {};
      state.entries.forEach(function (e) { map[e.subject] = e.subject_label; });
      return Object.keys(map).map(Number).sort(function (a, b) { return a - b; }).map(function (id) {
        return { id: id, label: map[id] };
      });
    }

    function populateSubjects() {
      el.subject.innerHTML = '';
      uniqueSubjects().forEach(function (s) {
        var opt = document.createElement('option');
        opt.value = String(s.id);
        opt.textContent = s.label;
        el.subject.appendChild(opt);
      });
      populateActivities();
    }

    function populateActivities() {
      var subj = Number(el.subject.value);
      var entries = state.entries.filter(function (e) { return e.subject === subj; });
      var prev = el.activity.value;
      el.activity.innerHTML = '';
      entries.forEach(function (e) {
        var opt = document.createElement('option');
        opt.value = e.path;
        opt.textContent = e.activity;
        opt.dataset.classId = String(e.class_id);
        el.activity.appendChild(opt);
      });
      if (entries.some(function (e) { return e.path === prev; })) el.activity.value = prev;
    }

    function selectedEntry() {
      var subj = Number(el.subject.value);
      var path = el.activity.value;
      return state.entries.find(function (e) { return e.subject === subj && e.path === path; }) || null;
    }

    async function loadEntry() {
      stopPlayback();
      var entry = selectedEntry();
      if (!entry) return;
      state.currentEntry = entry;

      el.title.textContent = entry.subject_label + ' · ' + entry.activity;
      el.subtitle.textContent = 'Loading exported solver trajectory…';
      el.empty.hidden = false;
      el.empty.innerHTML = '<strong>Loading trajectory…</strong><span>The JSON may be several megabytes for a dense 100-step export.</span>';
      setEnabled(false);

      if (state.abortController) state.abortController.abort();
      state.abortController = new AbortController();

      try {
        var raw = await fetchJson(entry.path, state.abortController.signal);
        var payload = normalisePayload(raw, entry);
        validatePayload(payload);
        state.trajectory = payload;
        state.frameIndex = 0;
        el.empty.hidden = true;
        setEnabled(true);
        el.range.min = '0';
        el.range.max = String(payload.steps.length - 1);
        el.range.value = '0';
        el.download.href = entry.path;
        el.download.download = slug(entry.subject_label) + '-' + slug(entry.activity) + '-trajectory.json';
        el.download.removeAttribute('aria-disabled');
        updateMeta();
        updateFrame();
      } catch (err) {
        if (err.name === 'AbortError') return;
        setEmpty('Trajectory could not be loaded.', entry.path + ': ' + err.message);
        el.subject.disabled = false;
        el.activity.disabled = false;
      }
    }

    /* ─── Playback ─── */
    function advanceFrame(delta) {
      if (!state.trajectory) return;
      var len = state.trajectory.steps.length;
      state.frameIndex = (state.frameIndex + delta + len) % len;
      updateFrame();
    }

    function togglePlay() {
      if (!state.trajectory) return;
      if (state.playing) { stopPlayback(); return; }
      state.playing = true;
      el.play.textContent = 'Pause';
      var fps = Math.max(1, Number(el.speed.value || 8));
      state.timer = setInterval(function () {
        if (state.frameIndex >= state.trajectory.steps.length - 1) {
          stopPlayback();
          return;
        }
        state.frameIndex += 1;
        updateFrame();
      }, 1000 / fps);
    }

    /* ─── Init ─── */
    async function init() {
      drawPlaceholder();
      var basePath = (root.dataset.basePath || 'uploads/trajectories').replace(/\/$/, '');
      var maxSubject = Math.max(1, Number(root.dataset.maxSubject || 17));
      var knownSubjects = String(root.dataset.subjects || '').split(',').map(Number).filter(function (subject) {
        return Number.isInteger(subject) && subject > 0;
      });

      state.entries = await discoverEntries(basePath, maxSubject, knownSubjects);

      if (!state.entries.length) {
        setEmpty(
          'No trajectory JSON files were found.',
          'Place subject_XX/activity.json files under uploads/trajectories/. Serve via a local HTTP server (e.g. python -m http.server).'
        );
        return;
      }

      populateSubjects();
      setEnabled(true);

      // Default to subject 03 and cycling if available
      var defaultSubj = '3';
      var defaultActSlug = 'cycling';
      var subjOptions = Array.from(el.subject.options);
      if (subjOptions.some(function (o) { return o.value === defaultSubj; })) {
        el.subject.value = defaultSubj;
        populateActivities();
        var actOptions = Array.from(el.activity.options);
        var cyclingOpt = actOptions.find(function (o) { return o.value.indexOf(defaultActSlug) !== -1; });
        if (cyclingOpt) el.activity.value = cyclingOpt.value;
      }

      await loadEntry();
    }

    /* ─── Events ─── */
    el.subject.addEventListener('change', async function () { populateActivities(); await loadEntry(); });
    el.activity.addEventListener('change', loadEntry);
    el.speed.addEventListener('change', function () { if (state.playing) { stopPlayback(); togglePlay(); } });
    el.range.addEventListener('input', function () { stopPlayback(); state.frameIndex = Number(el.range.value); updateFrame(); });
    el.play.addEventListener('click', togglePlay);
    el.prev.addEventListener('click', function () { stopPlayback(); advanceFrame(-1); });
    el.next.addEventListener('click', function () { stopPlayback(); advanceFrame(1); });

    if ('ResizeObserver' in window) {
      var canvasResizeObserver = new ResizeObserver(function () {
        if (el.canvas.clientWidth > 0) drawFrame();
      });
      canvasResizeObserver.observe(el.canvas);
    }

    var resizeTimer;
    window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(drawFrame, 80); });

    init();
  })();

})();
