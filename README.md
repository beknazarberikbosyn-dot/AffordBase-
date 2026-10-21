# AffordBase

**English** · [Live demo (EN)](https://beknazarberikbosyn-dot.github.io/AffordBase-/en.html) · [Русская версия](https://beknazarberikbosyn-dot.github.io/AffordBase-/)

AffordBase is an affordable-housing platform for people banks don't see: young professionals, low-income families, migrants and gig workers in Kazakhstan. It links seven tools into one path from renting to owning:

1. **Rent together.** Co-tenants are matched by schedule, habits and budget, cutting rent by 40–60%.
2. **Build a track record.** On-time rent and utility payments feed a reliability score (200–900) that replaces a credit history.
3. **Stay protected.** 1.5% of every transaction goes to a mutual-aid fund that pays rent for up to 3 months, interest-free, if income drops. Leases are checked for unlawful clauses.
4. **Buy metre by metre.** Co-op buildings on municipal land cost about 37% less than the market. Members buy their flat 1 m² at a time (rent-to-own), and their rent falls with every metre.

This repository is a working static prototype: every calculation runs in the browser, while member, plot and regional data are illustrative.

---

Платформа доступного жилья для тех, кого не видит банк: молодых специалистов, семей с низким доходом, мигрантов и самозанятых. Двухсторонний маркетплейс и крауд-эквити система для совместного строительства, совместной аренды и поэтапного выкупа жилья.

Это статический прототип: все расчёты на странице работают в браузере, данные участников, участков и регионов — демонстрационные.

## Модули

| Раздел | Что работает в прототипе |
| --- | --- |
| **Совместное строительство** (Co-Building & Micro-Equity) | Квартира из 54 клеток по 1 м² в модели rent-to-own: выкуп метров и пересчёт аренды. Карта участков, вступление в пул, расчёт долей, распределение рисков и очередь на заселение (70% — вклад, 30% — активность). Закупка материалов у поставщиков со скидкой до 30%. |
| **Подбор соарендаторов** (Co-Living Matcher) | Профиль: доход, бюджет, график, район, привычки. Алгоритм совместимости подбирает трёх соарендаторов, считает экономию и генерирует договор совместной аренды с защитой от выселения и повышения платы. |
| **Индекс надёжности** (Alternative Scoring) | Индекс 200–900 из коммунальных платежей, истории переводов, стабильности гиг-дохода, нагрузки жильём, участия в сообществе и числа источников дохода. Подсказки, как его поднять. |
| **Фонд взаимопомощи** (Resilience Vault) | Прогноз накоплений на 12 месяцев при потере работы, болезни или задержке зарплаты, график с фондом и без, беспроцентный микрозаём на аренду до 3 месяцев. |
| **Юридическая самооборона** (Legal Shield) | Проверка договора аренды: опасные пункты подсвечиваются красным, оценка денег на кону, рекомендации простым языком. Распознавание фото договора (Tesseract.js, русский). Цифровой акт состояния жилья: SHA-256 отпечаток и время фиксации каждого фото или видео. |
| **Кабинет партнёров** (B2G & ESG Dashboard) | Для инвесторов — аналитика по регионам и калькулятор финансирования пула под 3–5% годовых. Для городов — размещение пустующих земель и зданий с нулевым налогом. |
| **Коммуналка и гранты** (Green Utility Tracker) | Сравнение расхода с нормой на семью, рекомендации по экономии, сборка заявки на зелёный грант для дома кооператива. |

## Запуск

Сборка не нужна. Откройте `index.html` в браузере или запустите локальный сервер:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

Сайт можно опубликовать через GitHub Pages: Settings → Pages → Deploy from branch → `main`, папка `/ (root)`.

## Структура

```
index.html       разметка всех разделов (русский)
en.html          та же страница на английском
css/styles.css   стили и адаптивная вёрстка
js/data.js       демонстрационные данные и их английские тексты
js/app.js        логика всех модулей, язык берётся из <html lang>
```

## Что дальше

- Бэкенд с учётными записями и реальными данными пулов
- Подключение LLM для разбора договоров вместо правил
- Смарт-контракты для учёта долей и фонда взаимопомощи
- Интеграции с умными счётчиками и платёжными сервисами

Разбор договора — автоматическая подсказка, а не юридическая консультация.
