"""Оглавление книги из course.py: в UNITS попадают главы, у которых есть website/moro2/chNN/index.html.
Заодно чинит CHAPTER.next: ведёт на следующую готовую главу, у последней — убирается.
    python3 tools/moro2/update_index.py
"""
import json, re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent)); from course import CH, UNITS
ROOT = Path(__file__).resolve().parents[2]; SITE = ROOT / "website/moro2"
ready = [c for c in CH if (SITE / f"ch{c[0]:02d}/index.html").exists()]
nums = [c[0] for c in ready]
assert nums == list(range(1, len(nums) + 1)), f"главы должны идти подряд с 1: {nums}"
units = []
for n, title, unit, part, spec, mins in ready:
    page = (SITE / f"ch{n:02d}/index.html").read_text(encoding="utf-8")
    m = re.search(r"minutes:\s*(\d+)", page); mins = int(m.group(1)) if m else mins
    if not units or units[-1][0] != UNITS[unit - 1]: units.append([UNITS[unit - 1], []])
    units[-1][1].append([title, mins])
js = "const UNITS = [   // создаётся tools/moro2/update_index.py из course.py\n" + "".join(
    f"  [{json.dumps(u, ensure_ascii=False)}, {json.dumps(chs, ensure_ascii=False)}],\n" for u, chs in units) + "];"
idx = SITE / "index.html"; s = idx.read_text(encoding="utf-8")
s = re.sub(r"const UNITS = \[.*?\n\];", lambda _: js, s, count=1, flags=re.S)
idx.write_text(s, encoding="utf-8")
for i, n in enumerate(nums):
    f = SITE / f"ch{n:02d}/index.html"; p = f.read_text(encoding="utf-8")
    p2 = re.sub(r",\s*next:\s*'[^']*'", "", p, count=1)
    if i + 1 < len(nums): p2 = re.sub(r"(const CHAPTER = \{[^}]*?)(\s*\})", rf"\1, next: '../ch{nums[i+1]:02d}/'\2", p2, count=1)
    if p2 != p: f.write_text(p2, encoding="utf-8")
print(f"{len(nums)} глав в {len(units)} разделах")
