// moro2: shared drawing helpers for lengths (rulers, bars, small pictures). Loaded after engine.js.
'use strict';
// A ruler on the chalkboard. x0 = position of 0, y = top edge, u = pixels per centimetre, n = centimetres.
// mm: draw millimetre and half-centimetre ticks. Returns { g, X(v in cm) }.
function uRuler(p, x0, y, u, n, { mm = true, labels = true } = {}) {
  const g = G(p, { o: 0 });
  mk('rect', { x: x0 - 22, y, width: n * u + 44, height: 72, rx: 6, fill: COL.int, 'fill-opacity': .14, stroke: COL.int, 'stroke-width': 2.5 }, g);
  let d = '';
  for (let k = 0; k <= n * (mm ? 10 : 1); k++) {
    const v = mm ? k / 10 : k, x = x0 + v * u;
    const len = mm ? (k % 10 === 0 ? 30 : k % 5 === 0 ? 22 : 13) : 30;
    d += `M${x.toFixed(1)} ${y}v${len}`;
  }
  path(g, d, { stroke: COL.chalk, 'stroke-width': mm ? 1.8 : 2.5 });
  if (labels) for (let v = 0; v <= n; v++) T(g, String(v), { x: x0 + v * u, y: y + 64, size: 28, fill: COL.chalk, font: MATH, anchor: 'middle' });
  return { g, X: v => x0 + v * u };
}
// A small ladybug centred on (x, y), radius r.
function uLadybug(p, x, y, r) {
  const g = G(p, { x, y, o: 0, s: .4 });
  mk('circle', { cx: 0, cy: -r * .9, r: r * .55, fill: '#2a2a2a', stroke: COL.chalk, 'stroke-width': 1.5 }, g);
  mk('circle', { cx: 0, cy: 0, r, fill: '#e2574c', stroke: COL.chalk, 'stroke-width': 1.5 }, g);
  path(g, `M0 ${-r}V${r}`, { stroke: '#2a2a2a', 'stroke-width': 1.5 });
  for (const [dx, dy] of [[-.45, -.35], [.45, -.35], [-.4, .4], [.4, .4]]) mk('circle', { cx: dx * r, cy: dy * r, r: r * .17, fill: '#2a2a2a' }, g);
  return g;
}
// A vertical bracket on the left of something, from y1 to y2 at x.
function uVBrace(p, x, y1, y2, colr) {
  return path(p, `M${x + 12} ${y1}H${x}V${y2}H${x + 12}`, { stroke: colr, 'stroke-width': 3 });
}
// A row of equal blocks: n blocks of width w from x0 at y (height h), alternating colours.
function uBlocks(p, x0, y, n, w, h, cols = [COL.int, COL.task]) {
  return Array.from({ length: n }, (_, i) => {
    const g = G(p, { o: 0 });
    mk('rect', { x: x0 + i * w + 1, y, width: w - 2, height: h, rx: 3, fill: cols[i % cols.length], 'fill-opacity': .6, stroke: cols[i % cols.length], 'stroke-width': 2 }, g);
    return g;
  });
}
// A bracket under (or over, up = true) a stretch from x1 to x2, with a label in large readable type.
function uBracket(p, x1, x2, y, label, colr, t0, { up = false, size = 30 } = {}) {
  const k = up ? 10 : -10;
  draw(path(p, `M${x1} ${y + k}V${y}H${x2}V${y + k}`, { stroke: colr, 'stroke-width': 3 }, { d: 0 }), t0, .5);
  if (label) show(T(p, label, { x: (x1 + x2) / 2, y: up ? y - 14 : y + 36, size, fill: colr, weight: 600, anchor: 'middle', o: 0 }), t0 + .3);
}
