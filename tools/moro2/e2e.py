"""Прогон глав в Chromium: ошибки страницы, автопроигрывание без MP3, вопросы (неверно → показать ответ → дальше), итоговая карточка.
    python3 tools/moro2/e2e.py http://localhost:8765/moro2/ ch01 ch02
"""
import asyncio, sys
from playwright.async_api import async_playwright

async def run(base, ch):
    errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 1600, "height": 960})
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: m.type == "error" and "404" not in m.text and errs.append(m.text))
        await pg.goto(f"{base}{ch}/index.html"); await pg.wait_for_timeout(400)
        n = await pg.evaluate("BEATS.length")
        # 1) autoplay: start, then the intro must advance to beat 1 on wall time
        await pg.keyboard.press("Space")
        d0 = await pg.evaluate("TIMINGS[BEATS[0].id].dur")
        await pg.wait_for_timeout(int((d0 + 2.5) * 1000))
        i = await pg.evaluate("P.i")
        print(f"{ch}: autoplay reached beat {i} after {d0 + 2.5:.1f}s (afail={await pg.evaluate('P.afail')})")
        # 2) every question beat: wrong try, show answer, continue
        asks = await pg.evaluate("BEATS.map((b,i)=>b.ask && b.id!=='finish'?i:-1).filter(i=>i>=0)")
        for k in asks:
            await pg.evaluate(f"seek({k}, true)"); await pg.evaluate("hideCover()")
            await pg.wait_for_timeout(int((await pg.evaluate(f"P.end")) * 1000) + 600)
            kind = await pg.evaluate("document.querySelector('#ui .box') ? 'blanks' : document.querySelector('#ui .grid') ? 'grid' : 'choice'")
            if kind == "blanks":
                for bx in await pg.query_selector_all("#ui input.box"): await bx.fill("7")
                await pg.keyboard.press("Enter")
            elif kind == "grid":
                await pg.keyboard.press("Enter")   # nothing chosen = wrong
                btn = await pg.query_selector("#ui button.btn:has-text('Проверить')"); await btn.click()
            else:
                opts = await pg.query_selector_all("#ui .opt"); await opts[-1].click()
            fb = (await pg.inner_text("#ui .fb")).strip()[:60]
            await pg.keyboard.press("Escape"); await pg.keyboard.press("s"); await pg.wait_for_timeout(200)
            fb2 = (await pg.inner_text("#ui .fb")).strip()[:70]
            await pg.keyboard.press("Enter"); await pg.wait_for_timeout(400)
            print(f"  beat {k} {kind}: wrong→ «{fb}» | show→ «{fb2}» | now beat {await pg.evaluate('P.i')}")
        await pg.evaluate(f"seek({n-1}, true)"); await pg.wait_for_timeout(1500)
        print("  finish:", (await pg.inner_text("#ui")).replace("\n", " | ")[:200])
        await b.close()
    print("  errors:", errs or "none")

async def main():
    base = sys.argv[1]
    for ch in sys.argv[2:]: await run(base, ch)
asyncio.run(main())
