// Chalk sketches for the unit headers on the contents page, one per unit, drawn in the unit's colour.
// Each entry is the inside of an SVG with viewBox 0 0 600 180; keep the left ~200 px light (the unit title sits there
// on narrow screens). Classes, styled in book.html:
//   d  a stroke that draws itself in when the unit scrolls into view (--k orders the strokes)
//   t  text or a filled shape that fades in
//   a  faint chalk white instead of the unit colour;  faint  even fainter
// A sketch may add one looping motion after it is drawn: give an element a class and add a .seen .unit-art .NAME
// rule with its keyframes in book.html (see the examples there: swap-a, hop, spin, tilt, breathe, ...).
'use strict';
(() => {
  let k = 0;
  const P = (d, cls = '', extra = '') => `<path class="d ${cls}" pathLength="1" style="--k:${k++}" d="${d}" ${extra}/>`;
  const Tx = (x, y, s, size = 24, cls = '', anchor = 'start') => `<text class="t ${cls}" style="--k:${k++}" x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}">${s}</text>`;
  const C = (cx, cy, r, cls = '') => `<circle class="d ${cls}" pathLength="1" style="--k:${k++}" cx="${cx}" cy="${cy}" r="${r}"/>`;
  const reset = s => { k = 0; return s; };

  window.UNIT_ART = [
    // 1 Numbers to 100 / lengths: a ruler with a millimetre bracket and a ladybug hopping along it.
    reset(P('M230 120H570V150H230Z') +
      Array.from({ length: 9 }, (_, i) => P(`M${250 + i * 40} 120v16`, 'a')).join('') +
      Array.from({ length: 8 }, (_, i) => P(`M${270 + i * 40} 120v8`, 'faint')).join('') +
      Tx(250, 172, '0', 20, 'a', 'middle') + Tx(290, 172, '1', 20, 'a', 'middle') + Tx(330, 172, '2', 20, 'a', 'middle') +
      Tx(400, 70, '1 см = 10 мм', 26) +
      `<circle class="t hop" r="9" fill="currentColor" stroke="none" style="--k:${k++};offset-path:path('M260 108Q280 82 300 108Q320 82 340 108Q360 82 380 108')"/>`),
  ];
})();
