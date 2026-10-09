"""Оценочные тайминги без синтеза речи (для урока без MP3: голос браузера + субтитры).

    python3 tools/moro2/make_timings.py lessons/moro2/ch01/narration.ru.json website/moro2/ch01/audio/ru

Формат timings.js тот же, что у Papermorph tts.py. Когда настоящая озвучка будет готова,
tts.py перезапишет timings.js и положит MP3 рядом — страница урока не меняется.
"""
import json, re, sys
from pathlib import Path

MARK = re.compile(r"\[\[(\w+)\]\]")
CPS = 11.0      # символов в секунду (русский голос, rate ~0.95, с запасом)
GAP = 0.45      # пауза после предложения
LEAD = 0.3

def split_marks(raw):
    marks, clean, pos = {}, [], 0
    for i, part in enumerate(MARK.split(raw)):
        if i % 2:
            if part in marks: raise SystemExit(f"duplicate mark {part}")
            marks[part] = pos
        else:
            clean.append(part); pos += len(part)
    return "".join(clean), marks

def main(src, out):
    spec = json.loads(Path(src).read_text(encoding="utf-8"))
    out = Path(out); out.mkdir(parents=True, exist_ok=True)
    res = {}
    for beat, raw in spec["beats"].items():
        clean, marks = split_marks(raw)
        ends = [m.end() for m in re.finditer(r"[.?!…]\s+", clean)]
        def at(pos):
            n = sum(1 for e in ends if e <= pos)
            # skip leading spaces so the mark lands on the word itself
            while pos < len(clean) and clean[pos] == " ": pos += 1
            return round(LEAD + pos / CPS + n * GAP, 3)
        cues, start = [], 0
        for e in ends + [len(clean)]:
            t = clean[start:e].strip()
            if t: cues.append([at(start), t])
            start = e
        res[beat] = {"dur": round(at(len(clean)) + 0.2, 3),
                     "marks": {k: at(v) for k, v in marks.items()}, "cues": cues}
    (out / "timings.js").write_text("window.TIMINGS = " + json.dumps(res, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    print(f"{len(res)} beats, {sum(v['dur'] for v in res.values())/60:.1f} min narration")

if __name__ == "__main__":
    main(*sys.argv[1:3])
