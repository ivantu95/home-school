"""Пакеты исходников для глав: картинки страниц учебника (150 dpi) и OCR-текст. Приватно, не публикуется."""
import subprocess, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent)); from course import CH, pages
ROOT = Path(__file__).resolve().parents[2]; P = ROOT / "curriculum/moro2/pages"; SRC = Path("/home/claude/hs-src")
for n, title, unit, part, spec, mins in CH:
    d = P / f"ch{n:02d}"; d.mkdir(parents=True, exist_ok=True)
    txt = [f"# Глава {n}. {title}\n\nУчебник, часть {part}, с. {spec}. OCR НЕНАДЁЖЕН: числа, кружки ○ (читаются как 0/O), окошки □, рисунки и таблицы сверяй с картинками tPPP.png.\n"]
    for p in pages(spec):
        pdfp = p + 2; png = d / f"t{p:03d}.png"
        if not png.exists():
            subprocess.run(["pdftoppm", "-f", str(pdfp), "-l", str(pdfp), "-r", "150", "-png", "-singlefile", str(SRC / f"t{part}.pdf"), str(png.with_suffix(""))], check=True)
        o = P / f"t{part}" / f"p{pdfp:03d}.txt"
        txt.append(f"\n## Учебник ч.{part}, с. {p} (картинка {png.name})\n\n" + (o.read_text(encoding="utf-8") if o.exists() else "(нет OCR)"))
    (d / "text.md").write_text("".join(txt), encoding="utf-8")
print("ok", len(CH))
