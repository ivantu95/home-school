# Домашняя школа — материалы для 2 класса

## Анимированная книга «Мерим и считаем» (Papermorph)

Открыть локально (из этой папки):

```
python -m http.server 8765 -d website
```

затем в браузере: http://localhost:8765/moro2/ — лучше в **Microsoft Edge**: там русский нейронный голос читает урок, пока нет MP3.

Главы: 1. Миллиметр · 2. Метр.

### Настоящая озвучка (один раз, нужен интернет)

Нужны `uv` и `ffmpeg` (для `ffprobe`). В PowerShell из этой папки:

```
$env:PYTHONUTF8=1
uv run --with edge-tts .claude/skills/papermorph/scripts/tts.py lessons/moro2/ch01/narration.ru.json website/moro2/ch01/audio/ru
uv run --with edge-tts .claude/skills/papermorph/scripts/tts.py lessons/moro2/ch02/narration.ru.json website/moro2/ch02/audio/ru
```

Скрипт положит MP3 и заменит `timings.js` точными таймингами; страницы уроков менять не нужно.

### Папки
- `source/` — сканы учебников (не публикуются).
- `curriculum/moro2/` — план книги, карта глав, раскадровки.
- `lessons/moro2/` — тексты озвучки.
- `website/moro2/` — готовая книга (статические файлы).
- `tools/moro2/` — вспомогательные скрипты (тайминги без озвучки, снимки кадров, проверка).
- `worksheets/` — листы для печати (появятся на следующем шаге).
