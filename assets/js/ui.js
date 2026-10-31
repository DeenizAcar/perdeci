/* Perdeci — arayüz bileşenleri */
(function () {
  const { esc } = U;
  const UI = {};

  /* ---------- Modal ---------- */
  UI.modal = function ({ title, subtitle = '', body = '', foot = '', size = 'md', onMount, onClose, icon }) {
    const root = document.getElementById('modal-root');
    const wrap = document.createElement('div');
    wrap.className = 'modal-wrap';
    wrap.innerHTML = `<div class="modal-backdrop"></div>
      <div class="modal modal-${size}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
        <div class="modal-head">
          ${icon ? `<div class="modal-icon">${I(icon, 20)}</div>` : ''}
          <div class="modal-titles"><h3>${esc(title)}</h3>${subtitle ? `<p>${esc(subtitle)}</p>` : ''}</div>
          <button class="btn-icon ghost" data-close aria-label="Kapat">${I('x')}</button>
        </div>
        <div class="modal-body">${body}</div>
        ${foot ? `<div class="modal-foot">${foot}</div>` : ''}
      </div>`;
    root.appendChild(wrap);
    document.body.classList.add('no-scroll');
    void wrap.offsetWidth;
    wrap.classList.add('open');
    let closed = false;
    const close = () => {
      if (closed) return; closed = true;
      wrap.classList.remove('open');
      document.removeEventListener('keydown', onKey);
      setTimeout(() => { wrap.remove(); if (!root.children.length) document.body.classList.remove('no-scroll'); }, 180);
      onClose && onClose();
    };
    const onKey = (e) => { if (e.key === 'Escape' && root.lastElementChild === wrap) close(); };
    document.addEventListener('keydown', onKey);
    wrap.querySelector('.modal-backdrop').addEventListener('click', close);
    wrap.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', close));
    const api = { el: wrap, close, setBody: (h) => { wrap.querySelector('.modal-body').innerHTML = h; }, setFoot: (h) => { const f = wrap.querySelector('.modal-foot'); if (f) f.innerHTML = h; } };
    onMount && onMount(wrap, api);
    setTimeout(() => { const f = wrap.querySelector('[autofocus], .modal-body input:not([type=hidden]):not([type=checkbox]):not([type=radio]), .modal-body select, .modal-body textarea'); if (f && !opts_noFocus(f)) f.focus(); }, 60);
    return api;
  };
  function opts_noFocus(el) { return el.closest('[data-nofocus]'); }

  UI.confirm = function ({ title = 'Emin misiniz?', text = '', ok = 'Onayla', danger = false, icon }) {
    return new Promise((resolve) => {
      let done = false;
      const m = UI.modal({
        title, size: 'sm', icon: icon || (danger ? 'alert' : 'info'),
        body: `<p class="muted">${text}</p>`,
        foot: `<button class="btn ghost" data-close>Vazgeç</button><button class="btn ${danger ? 'danger' : 'primary'}" data-ok>${ok}</button>`,
        onMount: (el, api) => el.querySelector('[data-ok]').addEventListener('click', () => { done = true; api.close(); resolve(true); }),
        onClose: () => { if (!done) resolve(false); },
      });
      return m;
    });
  };

  /* ---------- Toast ---------- */
  UI.toast = function (text, kind = 'ok', sub = '') {
    const root = document.getElementById('toast-root');
    const t = document.createElement('div');
    const icon = { ok: 'check-circle', err: 'alert', info: 'info', sms: 'message' }[kind] || 'info';
    t.className = `toast toast-${kind}`;
    t.innerHTML = `${I(icon, 18)}<div><strong>${text}</strong>${sub ? `<span>${sub}</span>` : ''}</div>`;
    root.appendChild(t);
    void t.offsetWidth;
    t.classList.add('show');
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, kind === 'sms' ? 5200 : 3400);
  };

  /* ---------- Form ---------- */
  UI.field = function (f, values = {}) {
    const v = values[f.name] ?? f.value ?? '';
    const req = f.required ? 'required' : '';
    const id = 'f_' + f.name + '_' + Math.random().toString(36).slice(2, 6);
    const label = f.label ? `<span class="field-label">${f.label}${f.required ? ' <em>*</em>' : ''}</span>` : '';
    const hint = f.hint ? `<small class="field-hint">${f.hint}</small>` : '';
    const opts = (typeof f.options === 'function' ? f.options(values) : f.options) || [];
    const norm = opts.map((o) => (typeof o === 'object' ? o : { value: o, label: o }));
    let input;
    switch (f.type) {
      case 'select':
        input = `<select class="input" id="${id}" name="${f.name}" ${req}>${f.placeholder ? `<option value="">${f.placeholder}</option>` : ''}${norm.map((o) => `<option value="${esc(o.value)}" ${String(o.value) === String(v) ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}</select>`;
        break;
      case 'textarea':
        input = `<textarea class="input" id="${id}" name="${f.name}" rows="${f.rows || 3}" placeholder="${esc(f.placeholder || '')}" ${req}>${esc(v)}</textarea>`;
        break;
      case 'toggle':
        return `<label class="field toggle-field ${f.col || ''}"><input type="checkbox" name="${f.name}" ${v ? 'checked' : ''}><span class="switch"></span><span><strong>${f.label}</strong>${f.hint ? `<small>${f.hint}</small>` : ''}</span></label>`;
      case 'colors':
        input = `<div class="color-grid" data-name="${f.name}">${C.COLORS.map((c) => `<label class="color-opt" title="${esc(c.name)}"><input type="radio" name="${f.name}" value="${esc(c.name)}" ${c.name === v ? 'checked' : ''}><span style="--sw:${c.hex}"></span><em>${esc(c.name)}</em></label>`).join('')}</div>`;
        break;
      case 'chips':
        input = `<div class="chip-select" data-name="${f.name}">${norm.map((o) => `<label class="chip-opt"><input type="checkbox" name="${f.name}" value="${esc(o.value)}" ${(Array.isArray(v) ? v : []).includes(o.value) ? 'checked' : ''}><span>${esc(o.label)}</span></label>`).join('')}</div>`;
        break;
      case 'radio-cards':
        input = `<div class="radio-cards">${norm.map((o) => `<label class="radio-card"><input type="radio" name="${f.name}" value="${esc(o.value)}" ${String(o.value) === String(v) ? 'checked' : ''}><span>${o.icon ? I(o.icon, 18) : ''}<strong>${esc(o.label)}</strong>${o.sub ? `<small>${esc(o.sub)}</small>` : ''}</span></label>`).join('')}</div>`;
        break;
      default:
        input = `<div class="input-wrap">${f.icon ? I(f.icon, 16, 'input-ic') : ''}<input class="input${f.icon ? ' has-ic' : ''}" id="${id}" type="${f.type || 'text'}" name="${f.name}" value="${esc(v)}" placeholder="${esc(f.placeholder || '')}" ${f.min !== undefined ? `min="${f.min}"` : ''} ${f.max !== undefined ? `max="${f.max}"` : ''} ${f.step ? `step="${f.step}"` : ''} ${req} ${f.autofocus ? 'autofocus' : ''}>${f.suffix ? `<span class="input-suffix">${f.suffix}</span>` : ''}</div>`;
    }
    return `<label class="field ${f.col || ''}" for="${id}">${label}${input}${hint}</label>`;
  };

  UI.form = (fields, values) => `<div class="form-grid">${fields.map((f) => (f.section ? `<div class="form-section">${f.section}</div>` : UI.field(f, values))).join('')}</div>`;

  UI.readForm = function (form, fields) {
    const out = {};
    fields.forEach((f) => {
      if (!f.name) return;
      if (f.type === 'toggle') out[f.name] = !!form.querySelector(`[name="${f.name}"]`)?.checked;
      else if (f.type === 'chips') out[f.name] = [...form.querySelectorAll(`[name="${f.name}"]:checked`)].map((x) => x.value);
      else if (f.type === 'colors' || f.type === 'radio-cards') out[f.name] = form.querySelector(`[name="${f.name}"]:checked`)?.value || '';
      else {
        const el = form.querySelector(`[name="${f.name}"]`);
        out[f.name] = el ? (f.type === 'number' ? Number(el.value) : el.value.trim()) : '';
      }
    });
    return out;
  };

  UI.formModal = function ({ title, subtitle, icon, fields, values = {}, submit = 'Kaydet', size = 'md', onSubmit, onMount, danger }) {
    return UI.modal({
      title, subtitle, icon, size,
      body: `<form class="mform" novalidate>${UI.form(fields, values)}<button type="submit" hidden></button></form>`,
      foot: `${danger ? `<button class="btn ghost danger-text" data-danger>${I('trash', 16)} ${danger.label}</button><span class="grow"></span>` : ''}<button class="btn ghost" data-close>Vazgeç</button><button class="btn primary" data-submit>${I('check', 16)} ${submit}</button>`,
      onMount: (el, api) => {
        const form = el.querySelector('form');
        const go = (e) => {
          e && e.preventDefault();
          const vals = UI.readForm(form, fields);
          const missing = fields.find((f) => f.required && (vals[f.name] === '' || vals[f.name] === undefined || (typeof vals[f.name] === 'number' && isNaN(vals[f.name]))));
          form.querySelectorAll('.field.invalid').forEach((x) => x.classList.remove('invalid'));
          if (missing) {
            const fe = form.querySelector(`[name="${missing.name}"]`);
            fe?.closest('.field')?.classList.add('invalid');
            fe?.focus();
            UI.toast(`"${missing.label}" alanı zorunlu`, 'err');
            return;
          }
          const r = onSubmit(vals, api);
          if (r !== false) api.close();
        };
        form.addEventListener('submit', go);
        el.querySelector('[data-submit]').addEventListener('click', go);
        if (danger) el.querySelector('[data-danger]').addEventListener('click', () => danger.onClick(api));
        onMount && onMount(el, api, form);
      },
    });
  };

  /* ---------- Tooltip ---------- */
  let tipEl;
  UI.initTooltips = function () {
    tipEl = document.createElement('div');
    tipEl.className = 'tip';
    document.body.appendChild(tipEl);
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest('[data-tip]');
      if (!t) { tipEl.classList.remove('show'); return; }
      tipEl.textContent = t.getAttribute('data-tip');
      tipEl.classList.add('show');
    });
    document.addEventListener('pointermove', (e) => {
      if (!tipEl.classList.contains('show')) return;
      const r = tipEl.getBoundingClientRect();
      let x = e.clientX + 14, y = e.clientY - r.height - 12;
      if (x + r.width > innerWidth - 8) x = e.clientX - r.width - 14;
      if (y < 8) y = e.clientY + 18;
      tipEl.style.transform = `translate(${x}px, ${y}px)`;
    });
    document.addEventListener('pointerleave', () => tipEl.classList.remove('show'));
    document.addEventListener('scroll', () => tipEl.classList.remove('show'), true);
  };

  /* ---------- Küçük bileşenler ---------- */
  UI.avatar = (p, size = 36, extra = '') => {
    const name = p?.name || '?';
    return `<span class="avatar ${extra}" style="--av:${U.avatarColor(name)};--s:${size}px" title="${esc(name)}">${esc(U.initials(name))}</span>`;
  };
  UI.avatars = (people, max = 4, size = 28) => {
    const shown = people.slice(0, max);
    const more = people.length - shown.length;
    return `<span class="avatars">${shown.map((p) => UI.avatar(p, size)).join('')}${more > 0 ? `<span class="avatar more" style="--s:${size}px">+${more}</span>` : ''}</span>`;
  };
  UI.pill = (st, small) => `<span class="pill${small ? ' sm' : ''}" style="--c:${st.color}">${I(st.icon, small ? 12 : 14)}<span>${esc(small ? st.short || st.label : st.label)}</span></span>`;
  UI.status = (key, small) => UI.pill(C.ST[key], small);
  UI.curtainStatus = (cid, small) => UI.pill(S.curtainStatus(cid), small);
  UI.tag = (t) => `<span class="tag tag-${U.norm(t).replace(/[^a-z]/g, '')}">${esc(t)}</span>`;
  UI.typeChip = (type) => `<span class="type-chip">${esc(type)}</span>`;
  UI.houseIcon = (type, size = 20) => I(C.HOUSE_TYPES[type] || 'home', size);
  UI.roomIcon = (type, size = 18) => I(C.ROOM_TYPES[type] || 'door', size);
  UI.empty = (icon, title, text = '', action = '') => `<div class="empty">${I(icon, 28)}<h4>${title}</h4>${text ? `<p>${text}</p>` : ''}${action}</div>`;
  UI.kv = (k, v, icon) => `<div class="kv">${icon ? I(icon, 15) : ''}<span>${k}</span><strong>${v}</strong></div>`;
  UI.stepper = (o) => {
    if (o.status === 'iptal') return `<div class="stepper cancelled">${UI.status('iptal')}<span class="muted">Bu sipariş iptal edildi.</span></div>`;
    const idx = C.FLOW.indexOf(o.status);
    return `<ol class="stepper">${C.FLOW.map((k, i) => {
      const st = C.ST[k];
      const h = [...o.history].reverse().find((x) => x.status === k && !x.payment);
      const cls = i < idx ? 'done' : i === idx ? 'current' : '';
      return `<li class="${cls}" style="--c:${st.color}"><span class="dot">${i < idx || (i === idx && k === 'teslim') ? I('check', 14) : I(st.icon, 14)}</span><span class="st-label">${st.label}</span><small>${h ? U.dshort(h.at) + ' ' + U.time(h.at) : (k === 'teslim' && o.dueAt ? 'Plan: ' + U.dshort(o.dueAt) : '')}</small></li>`;
    }).join('')}</ol>`;
  };
  UI.curtainLabel = (c) => `${esc(c.type)} · ${esc(c.fabric)} · ${esc(c.colorName)}`;
  UI.dim = (c) => `${U.num(c.width)} × ${U.num(c.height)} cm`;

  window.UI = UI;
})();
