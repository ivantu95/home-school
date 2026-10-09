"""Обзорный лист главы: конечный кадр каждого шага (вопросы — с карточкой), 4×4 плитки на одном PNG.
    python3 tools/moro2/review.py OUTDIR ch01 ch02 ...
"""
import asyncio, sys
from pathlib import Path
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw
BASE = "http://localhost:8765/moro2/"
async def main(out, chs):
    out = Path(out); out.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1600, "height": 960})
        errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        for ch in chs:
            errs.clear()
            await pg.goto(f"{BASE}{ch}/index.html?beat=0&t=0"); await pg.wait_for_timeout(300)
            durs = await pg.evaluate("BEATS.map(b => TIMINGS[b.id].dur)")
            tiles = []
            for i, d in enumerate(durs):
                await pg.goto(f"{BASE}{ch}/index.html?beat={i}&t={d + 3}"); await pg.wait_for_timeout(350)
                f = out / f"_{ch}_{i}.png"; await pg.screenshot(path=str(f)); tiles.append(f)
            n = len(tiles); cols = 4; rows = (n + cols - 1) // cols
            sheet = Image.new("RGB", (1600, 240 * rows), "black")
            for k, f in enumerate(tiles):
                im = Image.open(f).resize((400, 240)); ImageDraw.Draw(im).text((6, 4), str(k), fill="yellow")
                sheet.paste(im, ((k % cols) * 400, (k // cols) * 240)); f.unlink()
            sheet.save(out / f"{ch}.png")
            print(ch, n, "beats", "errors:", errs or "none")
        await b.close()
asyncio.run(main(sys.argv[1], sys.argv[2:]))
