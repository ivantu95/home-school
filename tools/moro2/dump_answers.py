"""Выгрузка всех вопросов глав с правильными ответами (через «Показать ответ») — для ручной сверки арифметики.
    python3 tools/moro2/dump_answers.py ch01 ch02 ... > answers.txt
"""
import asyncio, sys
from playwright.async_api import async_playwright
BASE = "http://localhost:8765/moro2/"
JS_CARD = """() => {
  const c = document.querySelector('#ui .quiz, #ui .card'); if (!c) return null;
  const out = [];
  const pr = c.querySelector('.prompt'); out.push('Q: ' + (pr ? pr.innerText.replace(/\\s+/g,' ') : ''));
  c.querySelectorAll('.brow').forEach(r => {
    const l = r.querySelector('.bline'); let s = '';
    l.childNodes.forEach(n => { s += n.tagName === 'INPUT' ? '[' + n.dataset.ans + ']' : n.textContent; });
    out.push('  ' + s.replace(/\\s+/g,' ').replace(/[✓✗]/g,''));
  });
  c.querySelectorAll('.grid .row').forEach(r => {
    const t = r.querySelector('.num').innerText.replace(/\\s+/g,' ');
    const on = [...r.querySelectorAll('.opt')].filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.innerText.replace(/^\\S+\\s*/,'').trim());
    out.push('  ' + t + '  →  ' + on.join(','));
  });
  const g = c.querySelector('.opts:not(.grid .opts) .opt.good'); if (g) out.push('  ✔ ' + g.innerText.replace(/^\\d\\s*/,'').replace(/\\s+/g,' '));
  const ring = document.querySelector('.qlayer .hit.good'); if (ring) out.push('  ✔ (на рисунке) ' + ring.getAttribute('aria-label'));
  const fb = c.querySelector('.fb'); if (fb && fb.innerText) out.push('  ' + fb.innerText.replace(/\\s+/g,' '));
  return out.join('\\n');
}"""
async def main(chs):
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1600, "height": 960})
        for ch in chs:
            await pg.goto(f"{BASE}{ch}/index.html"); await pg.wait_for_timeout(300)
            print(f"\n######## {ch}: {await pg.evaluate('CHAPTER.title')}")
            asks = await pg.evaluate("BEATS.map((b,i)=>b.ask && b.id!=='finish'?i:-1).filter(i=>i>=0)")
            for k in asks:
                await pg.evaluate(f"seek({k}, false); hideCover(); evalTo(Infinity); beatDone();"); await pg.wait_for_timeout(250)
                for _ in range(8):
                    if not await pg.query_selector("#ui .quiz"): break
                    await pg.evaluate("document.activeElement && document.activeElement.blur()")
                    kind = await pg.evaluate("document.querySelector('#ui .quiz .grid') ? 'grid' : document.querySelector('#ui .quiz .opts .opt') ? 'choice' : document.querySelector('#ui .quiz input.box') ? 'blanks' : 'pick'")
                    if kind == 'grid':
                        await pg.click("#ui .quiz button.btn:has-text('Проверить')")
                    elif kind == 'choice':
                        await pg.click("#ui .quiz .opts .opt >> nth=0")
                    elif kind == 'pick':
                        h = await pg.query_selector(".qlayer .hit")
                        if h: await h.click()
                    else:
                        await pg.click("#ui .quiz button.btn:has-text('Проверить')")
                    await pg.wait_for_timeout(120)
                    if await pg.evaluate("!!document.querySelector('#ui .quiz button.btn.quiet:not([hidden])')"):
                        await pg.evaluate("document.activeElement && document.activeElement.blur()")
                        await pg.keyboard.press("s"); await pg.wait_for_timeout(120)
                    print(f"[beat {k}] " + (await pg.evaluate(JS_CARD) or ''))
                    before = await pg.evaluate("document.querySelector('#ui .prompt')?.innerText")
                    await pg.keyboard.press("Enter"); await pg.wait_for_timeout(200)
                    if await pg.evaluate("P.i") != k: break
                    if await pg.evaluate("document.querySelector('#ui .prompt')?.innerText") == before: break
        await b.close()
asyncio.run(main(sys.argv[1:]))
