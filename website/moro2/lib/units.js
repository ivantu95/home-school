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
// ---- Tens and ones (from ch02). Tens are blue (COL.whole), ones orange (COL.task) throughout the book. ----
// One stick, top-left corner at (x - 5, y), height h. Starts hidden (o: 0); show it with show()/pop().
function uStick(p, x, y, colr = COL.task, h = 120) {
  const g = G(p, { x, y, o: 0 });
  g.setAttribute('fill', colr);
  mk('rect', { x: -5, y: 0, width: 10, height: h, rx: 5, stroke: COL.board, 'stroke-width': 1.5 }, g);
  return g;
}
// The rope around a bundle, centred on x at height y.
function uRope(p, x, y) {
  const g = G(p, { o: 0 });
  path(g, `M${x - 47} ${y}H${x + 47}`, { stroke: COL.board, 'stroke-width': 8 });
  path(g, `M${x - 47} ${y}H${x + 47}M${x + 40} ${y}l14 -8M${x + 40} ${y}l14 8`, { stroke: COL.chalk, 'stroke-width': 2.5 });
  return g;
}
// A bundle of ten sticks (a ten) centred on x, top at y, about 94 px wide. Starts hidden.
function uBundle(p, x, y, colr = COL.whole, h = 120) {
  const g = G(p, { x, y, o: 0 });
  g.setAttribute('fill', colr);
  for (let i = 0; i < 10; i++) mk('rect', { x: -41 + i * 8, y: 0, width: 10, height: h, rx: 5, stroke: COL.board, 'stroke-width': 1.5 }, g);
  put(uRope(g, 0, h / 2), { o: 1 });
  return g;
}
// A two-digit number: tens digit blue, ones digit orange; the digits meet at x. Shown at t0.
function uNum(p, n, x, y, t0, size = 110) {
  const g = G(p, { o: 0 });
  T(g, String(Math.floor(n / 10)), { x, y, size, fill: COL.whole, font: MATH, weight: 600, anchor: 'end' });
  T(g, String(n % 10), { x, y, size, fill: COL.task, font: MATH, weight: 600, anchor: 'start' });
  show(g, t0);
  return g;
}
// A text whose content changes at given times: steps = [[t, 'new text'], ...] (deterministic for seeking).
function uCounter(p, x, y, first, t0, steps, { size = 120, fill = COL.chalk } = {}) {
  const e = T(p, first, { x, y, size, fill, font: MATH, weight: 600, anchor: 'middle', o: 0 });
  show(e, t0);
  steps.forEach(([t, s]) => { prog(q => { if (q >= 1) e.textContent = s; }, t, .01, lin); pulse(e, t, 1.12); });
  return e;
}
