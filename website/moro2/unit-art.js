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
    // 2 Addition and subtraction: the whole and its two parts, with a "?" that the arcs explain.
    reset(P('M240 120H560') + C(240, 120, 4) + C(420, 120, 4) + C(560, 120, 4) +
      P('M240 116Q330 70 420 116') + P('M420 116Q490 80 560 116') + P('M240 126Q400 175 560 126', 'a') +
      Tx(330, 70, 'часть', 22, '', 'middle') + Tx(490, 76, '?', 30, '', 'middle') + Tx(400, 172, 'целое', 22, 'a', 'middle')),
    // 3 Mental calculation: 26 + 7 split through ten.
    reset(Tx(250, 90, '26 + 7 = 33', 34) + P('M362 100L344 128M362 100L380 128', 'a') +
      Tx(344, 152, '4', 24, '', 'middle') + Tx(384, 152, '3', 24, '', 'middle') + Tx(430, 152, '26 + 4 = 30', 20, 'a')),
    // 4 Expressions and equations: a balance with x on one pan.
    reset(P('M300 150H500M400 150V70M310 82H490', 'tilt') + P('M310 82L290 116H330ZM490 82L470 116H510Z', 'tilt') +
      Tx(310, 110, 'x + 3', 20, 'tilt', 'middle') + Tx(490, 110, '10', 20, 'tilt', 'middle') + Tx(560, 60, 'x = 7', 24, 'a', 'end')),
    // 5 Written calculation: a column sum.
    reset(Tx(420, 70, '37', 32, '', 'end') + Tx(360, 92, '+', 26, 'a') + Tx(420, 110, '48', 32, '', 'end') +
      P('M370 122H430') + Tx(420, 160, '85', 32, '', 'end') + Tx(395, 44, '1', 18, 'a', 'middle') +
      P('M470 60H560V150H470Z', 'a') + P('M470 150V60', 'faint')),
    // 6 Multiplication and division: three rows of four dots.
    reset(Array.from({ length: 12 }, (_, i) => C(260 + (i % 4) * 34, 70 + Math.floor(i / 4) * 34, 9)).join('') +
      Tx(420, 110, '4 · 3 = 12', 28) + Tx(420, 150, '12 : 3 = 4', 22, 'a')),
    // 7 Multiplication table: the rows for 2 and 3.
    reset(Array.from({ length: 5 }, (_, i) => Tx(250 + i * 64, 80, String(2 * (i + 1)), 26, '', 'middle')).join('') +
      Array.from({ length: 5 }, (_, i) => Tx(250 + i * 64, 130, String(3 * (i + 1)), 26, 'a', 'middle')).join('') +
      P('M220 98H560', 'faint')),
    // 8 Final review: a star of everything learnt.
    reset(P('M400 40L420 95L478 95L431 128L449 183L400 150L351 183L369 128L322 95L380 95Z') +
      Tx(520, 70, '100', 24, 'a') + Tx(250, 70, 'см', 22, 'a') + Tx(520, 150, '× :', 22, 'a') + Tx(250, 150, '+ −', 22, 'a')),
  ];
})();
