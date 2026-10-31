/* Perdeci — çizimler: cephe, kumaş dokusu, barkod, grafikler */
(function () {
  const Viz = {};
  let seq = 0;
  const sh = (hex, a) => U.shade(hex, a);

  function geometry(op) {
    switch (op) {
      case 'Balkon Kapısı': return [{ x: 145, y: 52, w: 110, h: 206, cols: 2, door: true }];
      case 'Balkon Kapısı + Pencere': return [{ x: 74, y: 52, w: 86, h: 206, cols: 1, door: true }, { x: 160, y: 52, w: 164, h: 128, cols: 2 }];
      case 'Fransız Balkon': return [{ x: 125, y: 46, w: 150, h: 212, cols: 2, door: true, rail: true }];
      case 'Sürme Kapı': return [{ x: 58, y: 46, w: 284, h: 212, cols: 3, door: true }];
      case 'Cam Cephe': return [{ x: 34, y: 40, w: 332, h: 218, cols: 4, rows: 2 }];
      case 'Köşe Pencere': return [{ x: 78, y: 70, w: 200, h: 124, cols: 2 }, { x: 278, y: 70, w: 58, h: 124, cols: 1, skew: true }];
      case 'Çatı Penceresi': return [{ x: 140, y: 64, w: 120, h: 92, cols: 1, roof: true }];
      default: return [{ x: 108, y: 72, w: 184, h: 118, cols: 2 }];
    }
  }

  function wavy(x0, y0, x1, yb, amp = 2.6, period = 13) {
    let d = `M${x0.toFixed(1)} ${y0.toFixed(1)} H${x1.toFixed(1)} V${yb.toFixed(1)} `;
    const n = Math.max(2, Math.round((x1 - x0) / period));
    const step = (x1 - x0) / n;
    for (let i = 0; i < n; i++) {
      const xa = x1 - step * i, xb = x1 - step * (i + 1);
      d += `Q${((xa + xb) / 2).toFixed(1)} ${(yb + (i % 2 ? -amp : amp)).toFixed(1)} ${xb.toFixed(1)} ${yb.toFixed(1)} `;
    }
    return d + 'Z';
  }

  function foldGrad(id, color, width, strength = 1, sheer = false) {
    const d = sh(color, -0.22 * strength), l = sh(color, 0.18 * strength);
    const op = sheer ? 0.55 : 1;
    return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${width}" y2="0" spreadMethod="repeat">
      <stop offset="0" stop-color="${d}" stop-opacity="${op}"/><stop offset=".38" stop-color="${color}" stop-opacity="${op * 0.9}"/>
      <stop offset=".55" stop-color="${l}" stop-opacity="${op * 0.85}"/><stop offset=".75" stop-color="${color}" stop-opacity="${op * 0.9}"/>
      <stop offset="1" stop-color="${d}" stop-opacity="${op}"/></linearGradient>`;
  }

  Viz.facade = function (facade, curtains, opt = {}) {
    const id = 'vz' + (++seq);
    const mini = !!opt.mini;
    const hidden = new Set(opt.hidden || []);
    const hl = opt.highlight || null;
    const W = 400, H = 280, floorY = 258;
    const wins = geometry(facade?.opening);
    const bx0 = Math.min(...wins.map((w) => w.x)), bx1 = Math.max(...wins.map((w) => w.x + w.w));
    const by0 = Math.min(...wins.map((w) => w.y)), by1 = Math.max(...wins.map((w) => w.y + w.h));
    const rx0 = Math.max(14, bx0 - 38), rx1 = Math.min(W - 14, bx1 + 38);
    const rodY = Math.max(20, by0 - 18);
    const seed = U.hash(facade?.id || 'x');
    const list = (curtains || []).filter((c) => !hidden.has(c.id)).slice()
      .sort((a, b) => (C.CURTAIN_TYPES[a.type]?.layer || 2) - (C.CURTAIN_TYPES[b.type]?.layer || 2));
    let defs = '';
    let body = '';

    // Duvar ve zemin
    body += `<rect x="0" y="0" width="${W}" height="${H}" style="fill:var(--viz-wall)"/>`;
    body += `<rect x="0" y="0" width="${W}" height="10" style="fill:var(--viz-ceil)"/>`;
    body += `<rect x="0" y="${floorY}" width="${W}" height="${H - floorY}" style="fill:var(--viz-floor)"/>`;
    for (let x = -20; x < W; x += 46) body += `<path d="M${x + (seed % 20)} ${floorY} l-14 ${H - floorY}" style="stroke:var(--viz-floor-line)" stroke-width="1"/>`;
    body += `<rect x="0" y="${floorY - 5}" width="${W}" height="5" style="fill:var(--viz-base)"/>`;

    // Pencereler
    defs += `<linearGradient id="${id}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--viz-sky1)"/><stop offset="1" style="stop-color:var(--viz-sky2)"/></linearGradient>`;
    let clip = '';
    wins.forEach((w) => {
      clip += w.skew ? `<polygon points="${w.x},${w.y} ${w.x + w.w},${w.y - 8} ${w.x + w.w},${w.y + w.h + 8} ${w.x},${w.y + w.h}"/>` : `<rect x="${w.x}" y="${w.y}" width="${w.w}" height="${w.h}"/>`;
    });
    defs += `<clipPath id="${id}clip">${clip}</clipPath>`;
    body += `<g clip-path="url(#${id}clip)"><rect x="0" y="0" width="${W}" height="${H}" fill="url(#${id}sky)"/>`;
    const sunny = /Güney|Batı/.test(facade?.direction || '');
    if (sunny) body += `<circle cx="${bx0 + (bx1 - bx0) * 0.72}" cy="${by0 + 26}" r="12" style="fill:var(--viz-sun)" opacity=".9"/>`;
    // şehir silueti
    let cx = bx0 - 10; let k = seed;
    while (cx < bx1 + 10) {
      k = (k * 1103515245 + 12345) & 0x7fffffff;
      const bw = 16 + (k % 22), bh = 18 + ((k >> 5) % 46);
      const baseY = Math.min(by1, floorY - 40) + 4;
      body += `<rect x="${cx}" y="${baseY - bh}" width="${bw}" height="${bh + 60}" style="fill:var(--viz-city)"/>`;
      cx += bw + 2;
    }
    body += `</g>`;
    wins.forEach((w) => {
      if (w.skew) {
        body += `<polygon points="${w.x},${w.y} ${w.x + w.w},${w.y - 8} ${w.x + w.w},${w.y + w.h + 8} ${w.x},${w.y + w.h}" fill="none" style="stroke:var(--viz-frame)" stroke-width="5" stroke-linejoin="round"/>`;
        body += `<rect x="${w.x - 3}" y="${w.y + w.h}" width="${w.w + 6}" height="6" style="fill:var(--viz-frame)" opacity=".0"/>`;
        return;
      }
      body += `<rect x="${w.x}" y="${w.y}" width="${w.w}" height="${w.h}" fill="none" style="stroke:var(--viz-frame)" stroke-width="5" rx="1.5"/>`;
      for (let i = 1; i < (w.cols || 1); i++) body += `<line x1="${w.x + (w.w / w.cols) * i}" y1="${w.y}" x2="${w.x + (w.w / w.cols) * i}" y2="${w.y + w.h}" style="stroke:var(--viz-frame)" stroke-width="3.5"/>`;
      if (w.rows) body += `<line x1="${w.x}" y1="${w.y + w.h * 0.42}" x2="${w.x + w.w}" y2="${w.y + w.h * 0.42}" style="stroke:var(--viz-frame)" stroke-width="3"/>`;
      if (!w.door) body += `<rect x="${w.x - 6}" y="${w.y + w.h}" width="${w.w + 12}" height="6" rx="1" style="fill:var(--viz-sill)"/>`;
      if (w.door) body += `<rect x="${w.x + (w.cols > 1 ? w.w / w.cols - 9 : w.w - 11)}" y="${w.y + w.h * 0.52}" width="3" height="16" rx="1.5" style="fill:var(--viz-handle)"/>`;
      if (w.rail) {
        const ry = w.y + w.h * 0.6;
        body += `<line x1="${w.x + 3}" y1="${ry}" x2="${w.x + w.w - 3}" y2="${ry}" style="stroke:var(--viz-rail-iron)" stroke-width="3"/>`;
        for (let x = w.x + 10; x < w.x + w.w - 4; x += 10) body += `<line x1="${x}" y1="${ry}" x2="${x}" y2="${w.y + w.h - 2}" style="stroke:var(--viz-rail-iron)" stroke-width="1.5"/>`;
      }
    });

    // Ray / Korniş
    const mounts = list.map((c) => c.mount);
    const hasTrack = mounts.some((m) => /Ray/.test(m || ''));
    const hasRod = mounts.some((m) => /Korniş|Boru/.test(m || ''));
    if (hasTrack) body += `<rect x="${rx0 - 4}" y="${rodY - 5}" width="${rx1 - rx0 + 8}" height="5" rx="1.5" style="fill:var(--viz-track)"/>`;
    if (hasRod) {
      body += `<line x1="${rx0 - 6}" y1="${rodY + 1}" x2="${rx1 + 6}" y2="${rodY + 1}" stroke="#7a5b40" stroke-width="4" stroke-linecap="round"/>`;
      body += `<circle cx="${rx0 - 9}" cy="${rodY + 1}" r="5.5" fill="#6a4c33"/><circle cx="${rx1 + 9}" cy="${rodY + 1}" r="5.5" fill="#6a4c33"/>`;
    }

    // Perdeler
    list.forEach((c, i) => {
      const T = C.CURTAIN_TYPES[c.type] || {};
      const col = c.color || C.colorHex(c.colorName);
      const gid = `${id}g${i}`;
      const dim = hl && hl !== c.id;
      const isShort = !T.flat && facade && Number(c.height) < Number(facade.height) * 0.75;
      const bottom = isShort ? by1 + 16 : floorY - 3;
      let g = '';
      if (c.type === 'Dikey') {
        const x0 = bx0 - 10, x1 = bx1 + 10, yb = Math.min(floorY - 3, by1 + 12);
        g += `<rect x="${x0 - 2}" y="${rodY - 4}" width="${x1 - x0 + 4}" height="5" rx="1.5" style="fill:var(--viz-track)"/>`;
        for (let x = x0; x < x1 - 4; x += 11) g += `<rect x="${x}" y="${rodY}" width="9" height="${yb - rodY}" rx="1" fill="${(x / 11) % 2 < 1 ? col : sh(col, -0.08)}" opacity=".96"/>`;
      } else if (T.flat) {
        wins.forEach((w) => {
          if (w.skew) return;
          const drop = { Stor: 0.56, Zebra: 0.62, Plise: 0.5, Jaluzi: 0.66 }[c.type] || 0.55;
          const h = w.h * drop;
          g += `<rect x="${w.x - 3}" y="${w.y - 7}" width="${w.w + 6}" height="8" rx="2" fill="${sh(col, -0.25)}"/>`;
          if (c.type === 'Stor') {
            g += `<rect x="${w.x + 1}" y="${w.y + 1}" width="${w.w - 2}" height="${h}" fill="${col}" opacity=".96"/>`;
            g += `<rect x="${w.x + 1}" y="${w.y + h - 3}" width="${w.w - 2}" height="4" rx="1" fill="${sh(col, -0.3)}"/>`;
          } else if (c.type === 'Zebra') {
            for (let y = w.y + 1; y < w.y + h; y += 12) {
              g += `<rect x="${w.x + 1}" y="${y}" width="${w.w - 2}" height="${Math.min(7, w.y + h - y)}" fill="${col}" opacity=".97"/>`;
              g += `<rect x="${w.x + 1}" y="${y + 7}" width="${w.w - 2}" height="${Math.max(0, Math.min(5, w.y + h - y - 7))}" fill="${col}" opacity=".35"/>`;
            }
            g += `<rect x="${w.x + 1}" y="${w.y + h - 2}" width="${w.w - 2}" height="4" rx="1" fill="${sh(col, -0.3)}"/>`;
          } else if (c.type === 'Jaluzi') {
            for (let y = w.y + 2; y < w.y + h; y += 6) g += `<rect x="${w.x + 2}" y="${y}" width="${w.w - 4}" height="4" rx="1" fill="${col}"/><line x1="${w.x + 2}" y1="${y + 4}" x2="${w.x + w.w - 2}" y2="${y + 4}" stroke="${sh(col, -0.3)}" stroke-width=".8"/>`;
            g += `<line x1="${w.x + w.w * 0.3}" y1="${w.y}" x2="${w.x + w.w * 0.3}" y2="${w.y + h}" stroke="${sh(col, -0.35)}" stroke-width=".7"/><line x1="${w.x + w.w * 0.7}" y1="${w.y}" x2="${w.x + w.w * 0.7}" y2="${w.y + h}" stroke="${sh(col, -0.35)}" stroke-width=".7"/>`;
          } else if (c.type === 'Plise') {
            let d = `M${w.x + 1} ${w.y + 1}`;
            g += `<rect x="${w.x + 1}" y="${w.y + 1}" width="${w.w - 2}" height="${h}" fill="${col}" opacity=".93"/>`;
            for (let y = w.y + 5; y < w.y + h; y += 5) g += `<line x1="${w.x + 1}" y1="${y}" x2="${w.x + w.w - 1}" y2="${y}" stroke="${(y / 5) % 2 < 1 ? sh(col, -0.2) : sh(col, 0.25)}" stroke-width="1"/>`;
            g += `<rect x="${w.x + 1}" y="${w.y + h - 2}" width="${w.w - 2}" height="4" rx="1" fill="${sh(col, -0.3)}"/>`;
            void d;
          }
        });
      } else if (c.type === 'Tül') {
        defs += foldGrad(gid, col, 7, 0.9, true);
        const panels = Number(c.panels) > 1 ? 2 : 1;
        const top = rodY + 1;
        if (panels === 1) {
          g += `<path d="${wavy(rx0 + 2, top, rx1 - 2, bottom)}" fill="url(#${gid})"/>`;
        } else {
          const mid = (rx0 + rx1) / 2;
          g += `<path d="${wavy(rx0 + 2, top, mid + 5, bottom)}" fill="url(#${gid})"/>`;
          g += `<path d="${wavy(mid - 5, top, rx1 - 2, bottom)}" fill="url(#${gid})"/>`;
        }
      } else if (c.type === 'Kruvaze') {
        defs += foldGrad(gid, col, 7, 0.9, true);
        const mid = (rx0 + rx1) / 2, top = rodY + 1, tieY = top + (bottom - top) * 0.5;
        const L = (x) => x, Rr = (x) => rx0 + rx1 - x;
        [L, Rr].forEach((X) => {
          g += `<path d="M${X(rx0 + 1)} ${top} L${X(mid + 34)} ${top} Q${X(mid - 10)} ${tieY - 40} ${X(rx0 + 16)} ${tieY} Q${X(rx0 + 30)} ${bottom - 40} ${X(rx0 + 44)} ${bottom} L${X(rx0 + 1)} ${bottom} Z" fill="url(#${gid})"/>`;
          g += `<rect x="${Math.min(X(rx0 + 10), X(rx0 + 24))}" y="${tieY - 2}" width="14" height="4" rx="2" fill="${sh(col, -0.35)}" opacity=".7"/>`;
        });
      } else {
        // Fon & Blackout
        const strength = c.type === 'Blackout' ? 0.75 : 1.1;
        defs += foldGrad(gid, col, 9, strength);
        const panels = Number(c.panels) >= 2 ? 2 : 1;
        const span = rx1 - rx0;
        const pw = Math.max(30, Math.min(70, span * 0.17));
        const top = rodY + 1, tieY = top + (bottom - top) * 0.56;
        const sides = panels === 2 ? [(x) => x, (x) => rx0 + rx1 - x] : [(x) => x];
        sides.forEach((X) => {
          const a = rx0 - 1, b = rx0 + pw;
          const d = `M${X(a)} ${top} L${X(b)} ${top} C${X(b)} ${top + (tieY - top) * 0.5} ${X(a + pw * 0.62)} ${tieY - 26} ${X(a + pw * 0.62)} ${tieY} C${X(a + pw * 0.62)} ${tieY + 30} ${X(b + 4)} ${bottom - 44} ${X(b + 8)} ${bottom} L${X(a)} ${bottom} Z`;
          g += `<path d="${d}" fill="url(#${gid})"/>`;
          g += `<path d="${d}" fill="none" stroke="${sh(col, -0.3)}" stroke-width=".8" opacity=".6"/>`;
          const tx = Math.min(X(a + 2), X(a + pw * 0.66));
          g += `<rect x="${tx}" y="${tieY - 3}" width="${Math.abs(X(a + pw * 0.66) - X(a + 2))}" height="5" rx="2.5" fill="${sh(col, -0.35)}"/>`;
        });
      }
      const title = `${c.code} · ${c.type} · ${c.fabric} · ${c.colorName}`;
      body += `<g class="vz-c${hl === c.id ? ' vz-hl' : ''}" data-curtain="${c.id}" opacity="${dim ? 0.16 : 1}"><title>${U.esc(title)}</title>${g}</g>`;
    });

    // Ölçüler
    if (!mini && opt.dims !== false && facade) {
      const y = Math.max(6, rodY - 13);
      body += `<g class="vz-dim"><line x1="${rx0}" y1="${y}" x2="${rx1}" y2="${y}"/><line x1="${rx0}" y1="${y - 4}" x2="${rx0}" y2="${y + 4}"/><line x1="${rx1}" y1="${y - 4}" x2="${rx1}" y2="${y + 4}"/>
        <rect x="${(rx0 + rx1) / 2 - 26}" y="${y - 7}" width="52" height="14" rx="7"/><text x="${(rx0 + rx1) / 2}" y="${y + 3.5}" text-anchor="middle">${U.esc(facade.width)} cm</text></g>`;
      const x = W - 7;
      body += `<g class="vz-dim"><line x1="${x}" y1="${rodY}" x2="${x}" y2="${floorY}"/><line x1="${x - 4}" y1="${rodY}" x2="${x + 4}" y2="${rodY}"/><line x1="${x - 4}" y1="${floorY}" x2="${x + 4}" y2="${floorY}"/>
        <g transform="translate(${x} ${(rodY + floorY) / 2}) rotate(-90)"><rect x="-26" y="-7" width="52" height="14" rx="7"/><text x="0" y="3.5" text-anchor="middle">${U.esc(facade.height)} cm</text></g></g>`;
    }

    return `<svg class="vz ${mini ? 'vz-mini' : ''}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${U.esc((facade?.name || 'Cephe') + ' çizimi')}" preserveAspectRatio="xMidYMid meet"><defs>${defs}</defs>${body}</svg>`;
  };

  Viz.swatch = function (c, size = 56) {
    const id = 'sw' + (++seq);
    const col = c.color || C.colorHex(c.colorName);
    const f = (c.fabric || '').toLowerCase();
    let defs = '', body = '';
    const sheer = c.type === 'Tül' || c.type === 'Kruvaze';
    if (sheer) {
      defs += `<pattern id="${id}ck" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#d9d9d9"/><rect width="5" height="5" fill="#f2f2f2"/><rect x="5" y="5" width="5" height="5" fill="#f2f2f2"/></pattern>`;
      body += `<rect width="60" height="60" fill="url(#${id}ck)"/><rect width="60" height="60" fill="${col}" opacity=".62"/>`;
      for (let x = 2; x < 60; x += 4) body += `<line x1="${x}" y1="0" x2="${x + 1}" y2="60" stroke="#fff" stroke-opacity=".35" stroke-width="1.2"/>`;
    } else {
      body += `<rect width="60" height="60" fill="${col}"/>`;
      if (c.type === 'Jaluzi') {
        for (let y = 0; y < 60; y += 7) body += `<rect x="0" y="${y}" width="60" height="5.5" fill="${U.shade(col, 0.12)}"/><line x1="0" y1="${y + 5.5}" x2="60" y2="${y + 5.5}" stroke="${U.shade(col, -0.3)}" stroke-width="1"/>`;
      } else if (c.type === 'Zebra') {
        for (let y = 0; y < 60; y += 12) body += `<rect x="0" y="${y + 7}" width="60" height="5" fill="#fff" opacity=".45"/>`;
      } else if (c.type === 'Plise') {
        for (let y = 0; y < 60; y += 5) body += `<line x1="0" y1="${y}" x2="60" y2="${y}" stroke="${(y / 5) % 2 ? U.shade(col, 0.3) : U.shade(col, -0.25)}" stroke-width="1.4"/>`;
      } else if (c.type === 'Dikey') {
        for (let x = 0; x < 60; x += 10) body += `<rect x="${x}" y="0" width="8.5" height="60" fill="${U.shade(col, (x / 10) % 2 ? -0.08 : 0.06)}"/>`;
      } else if (/kadife|şönil/.test(f)) {
        defs += `<radialGradient id="${id}r" cx=".3" cy=".25" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></radialGradient>`;
        body += `<rect width="60" height="60" fill="url(#${id}r)"/>`;
      } else if (/saten/.test(f)) {
        defs += `<linearGradient id="${id}l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".45" stop-color="#fff" stop-opacity=".45"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".15"/></linearGradient>`;
        body += `<rect width="60" height="60" fill="url(#${id}l)"/>`;
      } else if (/jakar/.test(f)) {
        defs += `<pattern id="${id}j" width="14" height="14" patternUnits="userSpaceOnUse"><path d="M7 1 13 7 7 13 1 7Z" fill="none" stroke="${U.shade(col, -0.25)}" stroke-width="1.3"/><circle cx="7" cy="7" r="1.6" fill="${U.shade(col, 0.25)}"/></pattern>`;
        body += `<rect width="60" height="60" fill="url(#${id}j)"/>`;
      } else {
        defs += `<pattern id="${id}w" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 1h4M1 0v4" stroke="${U.lum(col) > 0.5 ? '#000' : '#fff'}" stroke-opacity=".09" stroke-width="1"/></pattern>`;
        body += `<rect width="60" height="60" fill="url(#${id}w)"/>`;
        if (/blackout/.test(f) || c.type === 'Blackout') body += `<rect width="60" height="60" fill="#000" opacity=".06"/>`;
      }
    }
    return `<svg class="swatch" width="${size}" height="${size}" viewBox="0 0 60 60" aria-hidden="true"><defs>${defs}</defs>${body}</svg>`;
  };

  Viz.barcode = function (text, w = 200, h = 50) {
    const mods = [1, 1, 1, 1];
    for (const ch of String(text)) {
      let v = (ch.charCodeAt(0) * 2654435761) >>> 0;
      for (let i = 0; i < 6; i++) { mods.push((v & 3) + 1); v >>>= 2; }
      mods.push(1);
    }
    mods.push(1, 1, 1, 1);
    const total = mods.reduce((s, m) => s + m, 0);
    const unit = w / total;
    let x = 0, out = '';
    mods.forEach((m, i) => { if (i % 2 === 0) out += `<rect x="${(x * unit).toFixed(2)}" y="0" width="${(m * unit).toFixed(2)}" height="${h}" fill="#111"/>`; x += m; });
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-label="Barkod ${U.esc(text)}">${out}</svg>`;
  };

  // Sütun grafik (HTML): tek seri, tooltip, ızgara çizgileri
  Viz.columns = function (data, opt = {}) {
    const max = Math.max(1, ...data.map((d) => d.value));
    const step = niceStep(max / 4);
    const top = Math.ceil(max / step) * step;
    const ticks = [];
    for (let v = 0; v <= top + 0.001; v += step) ticks.push(v);
    const fmt = opt.fmt || ((v) => U.compact(v));
    const tipFmt = opt.tipFmt || ((d) => `${d.label}: ${U.money(d.value)}`);
    return `<div class="cols" style="--h:${opt.height || 200}px">
      <div class="cols-y">${ticks.slice().reverse().map((t) => `<span>${fmt(t)}</span>`).join('')}</div>
      <div class="cols-plot">
        <div class="cols-grid">${ticks.map(() => '<i></i>').join('')}</div>
        <div class="cols-bars">${data.map((d, i) => `
          <div class="col" data-tip="${U.esc(tipFmt(d))}">
            <div class="col-bar${d.hl || (opt.hlLast && i === data.length - 1) ? ' hl' : ''}" style="height:${(d.value / top) * 100}%"></div>
          </div>`).join('')}</div>
        <div class="cols-x">${data.map((d) => `<span>${U.esc(d.label)}</span>`).join('')}</div>
      </div></div>`;
  };

  // Yatay çubuk
  Viz.hbars = function (data, opt = {}) {
    const max = Math.max(1, ...data.map((d) => d.value));
    const fmt = opt.fmt || ((v) => U.num(v));
    return `<div class="hbars">${data.map((d) => `
      <div class="hbar" data-tip="${U.esc(d.tip || `${d.label}: ${fmt(d.value)}`)}">
        <div class="hbar-label">${d.icon ? I(d.icon, 14) : ''}<span>${U.esc(d.label)}</span></div>
        <div class="hbar-track"><div class="hbar-fill" style="width:${Math.max(1.5, (d.value / max) * 100)}%;${d.color ? `--c:${d.color}` : ''}"></div></div>
        <div class="hbar-val">${fmt(d.value)}</div>
      </div>`).join('')}</div>`;
  };

  function niceStep(raw) {
    const p = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 1))));
    const n = raw / p;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
  }

  window.Viz = Viz;
})();
