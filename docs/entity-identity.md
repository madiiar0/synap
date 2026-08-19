# Akrux — locked identity card

**Purpose.** Every string in this file is copied **byte-for-byte** into every
external profile: LinkedIn, Crunchbase, Wikidata, directories, press lists, app
stores, partner pages. Inconsistency between profiles is what stops a model
merging them into one entity — a different city, a reworded tagline or a second
spelling of the name reads as two organisations, not one. **Nothing here gets
retyped from memory.** Copy from this file, or change this file first.

Everything below is what the codebase actually publishes after the entity and
Kazakh-locale work. The machine-readable source of truth is
`ORGANIZATION_IDENTITY` and `FOUNDER` in `packages/shared/src/seo.ts`; if you
change one, change both, and `pnpm seo:audit` will fail the build if the
Organization node loses `sameAs`, `email`, `telephone` or `address`.

---

## Name

| Field | Value |
|---|---|
| Exact name string | `Akrux` |
| Casing | Initial capital only. Never `AKRUX`, `akrux` or `AkruX`. |
| Website | `https://akrux.app` |

### Disambiguated form

Use where `Akrux` alone is ambiguous:

> **Akrux — AI visibility audit service (Astana, Kazakhstan)**

**Why this is required.** `Akrux` collides with a widely-indexed display
typeface of the same name, which has far more search history than this company
and dominates results for the bare word. A profile whose first sentence does not
carry a **category + country** qualifier will be resolved to the typeface, or
merged with it. Every external profile must therefore name the category and the
country in its opening sentence — not in a later paragraph, and not only in a
tag or industry dropdown.

---

## Tagline

One line per locale. **Derived from the existing Russian homepage**, not newly
invented positioning — Russian is the default locale and carries the intended
register.

Source strings used:
- `landing.heroLine1` — the H1's first line, completed by the cycling model name
  (`Станьте ответом в` → ChatGPT / Gemini / Perplexity / Claude / Grok)
- `landing.heroSub` — the subhead under the H1

| Locale | Tagline |
|---|---|
| ru | `Станьте ответом в ИИ: бесплатный аудит видимости бизнеса в Казахстане.` |
| kk | `Жауап болыңыз: Қазақстандағы бизнеске ЖИ-дегі көрінудің тегін аудиті.` |
| en | `Be the answer in AI: a free AI-visibility audit for businesses in Kazakhstan.` |

---

## Long description

Roughly 250 words per locale. **The first sentence names the category and the
country**, because that sentence is what gets scraped into knowledge panels,
directory summaries and model context. Carries no team, headcount or
organisational-size claim in any direction.

### ru

> Akrux — сервис аудита и улучшения видимости бизнеса в ответах ИИ для компаний
> Казахстана. Владелец бизнеса запускает бесплатную проверку, а Akrux собирает
> датированную выборку ответов семейств моделей, связанных с ChatGPT, Gemini и
> Perplexity, через настроенные API провайдеров.
>
> Проверка исследует указанный бизнес, создаёт около 25 клиентских вопросов с
> разными намерениями — бренд, категория, лучшие варианты, сравнение, покупка и
> информация — и сохраняет результат в закрытом отчёте. Отчёт может включать
> Индекс видимости по небрендовым ответам, отдельный показатель узнаваемости
> бренда, результаты по моделям, появления конкурентов, позиции в отдельных
> ответах, долю голоса и процитированные источники. Ошибки провайдера и неполное
> покрытие показываются как есть и не заменяются выдуманными данными.
>
> После разбора отчёта владелец может записаться на созвон. Akrux определяет
> практические пробелы, отдельно согласует объём и вручную выполняет работы:
> исправление противоречивых публичных фактов, улучшение обхода сайта и ясности
> сущности, доработку страниц услуг и FAQ, укрепление локальных карточек и
> источников. Внедрение не входит в бесплатный аудит автоматически.
>
> Ответы ИИ меняются в зависимости от модели, формулировки, даты и найденных
> источников, поэтому аудит остаётся датированной выборкой. Akrux не гарантирует
> индексацию, упоминания, цитирование, позиции, рейтинги или рекомендации и не
> ведёт постоянный мониторинг. Сервис находится на раннем этапе тестирования.
> Интерфейс и публичная информация доступны на казахском, русском и английском.
> Akrux работает из Астаны, Казахстан; проект начат в июле 2026 года.

### kk

> Akrux — Қазақстан компанияларына арналған, бизнестің ЖИ жауаптарындағы
> көрінуін аудиттеу және жақсарту сервисі. Бизнес иесі тегін тексеруді іске
> қосады, ал Akrux ChatGPT, Gemini және Perplexity-мен байланысты модель
> отбасыларының жауаптарынан күні көрсетілген таңдаманы провайдерлердің
> бапталған API-лары арқылы жинайды.
>
> Тексеру көрсетілген бизнесті зерттеп, түрлі ниеттегі шамамен 25 клиент сұрағын
> жасайды — бренд, санат, үздік нұсқалар, салыстыру, сатып алу және ақпарат —
> және нәтижені жабық есепте сақтайды. Есепке брендсіз жауаптар бойынша Көріну
> индексі, бренд танымалдығының бөлек көрсеткіші, модельдер бойынша нәтижелер,
> бәсекелестердің шығуы, жекелеген жауаптардағы позициялар, дауыс үлесі және
> дәйексөз алынған дереккөздер кіруі мүмкін. Провайдер қателері мен толық емес
> қамту ойдан шығарылған деректермен алмастырылмай, сол күйінде көрсетіледі.
>
> Есепті талдағаннан кейін иесі қоңырауға жазыла алады. Akrux практикалық
> олқылықтарды анықтап, көлемді бөлек келісіп, жұмыстарды қолмен орындайды:
> қайшы жария фактілерді түзету, сайтты аралауды және сущность айқындығын
> жақсарту, қызметтер мен FAQ беттерін пысықтау, жергілікті карточкалар мен
> дереккөздерді нығайту. Енгізу тегін аудитке автоматты кірмейді.
>
> ЖИ жауаптары модельге, тұжырымға, күнге және табылған дереккөздерге қарай
> өзгереді, сондықтан аудит күні көрсетілген таңдама болып қалады. Akrux
> индекстеуге, аталымдарға, дәйексөздерге, позицияларға, рейтингтерге немесе
> ұсыныстарға кепілдік бермейді әрі тұрақты мониторинг жүргізбейді. Сервис ерте
> тестілеу кезеңінде. Интерфейс пен жария ақпарат қазақ, орыс және ағылшын
> тілдерінде қолжетімді. Akrux Астанадан (Қазақстан) жұмыс істейді; жоба 2026
> жылдың шілдесінде басталды.

### en

> Akrux is an AI-visibility audit and improvement service for businesses in
> Kazakhstan. A business owner starts a free, user-initiated audit, and Akrux
> collects a dated sample of answers from the model families associated with
> ChatGPT, Gemini and Perplexity through configured provider APIs.
>
> The audit researches the submitted business, generates about 25 customer-style
> questions across intents — branded, category, best-of, comparison, purchase and
> informational — and stores the result in a private report. The report can
> include a Visibility Score over unbranded answers, a separate branded
> recognition figure, provider-level results, competitor appearances,
> answer-level positions, Share of Voice and cited sources. Provider failures and
> incomplete coverage are shown as they are, never replaced with invented data.
>
> After reviewing the report the owner can book a call. Akrux identifies
> practical gaps, agrees a scope separately, and carries the work out by hand:
> correcting contradictory public facts, improving site crawlability and entity
> clarity, strengthening service and FAQ pages, and improving relevant local
> listings and sources. Implementation is not automatically included in the free
> audit.
>
> AI answers vary by model, wording, date and retrieved sources, so an audit
> stays a dated sample. Akrux does not guarantee indexing, mentions, citations,
> positions, rankings or recommendations, and does not run continuous
> monitoring. The service is at an early testing stage. The interface and public
> information are available in Kazakh, Russian and English. Akrux works from
> Astana, Kazakhstan; the project started in July 2026.

---

## Facts

| Field | Value | Notes |
|---|---|---|
| Industry | AI visibility / generative engine optimization (GEO) / marketing analytics | Pick the closest available option per directory; keep the wording above in free-text fields. |
| HQ city | `Astana` | |
| HQ country | `Kazakhstan` (`KZ`) | |
| Founding date | `2026-07` | Rendered publicly as "July 2026" / «июле 2026 года» / «2026 жылдың шілдесінде». |
| Languages | Kazakh, Russian, English | Public site and interface. Report content is still produced in Russian and English. |
| Primary market | Businesses in Kazakhstan | |

### Contact

| Field | Value | Framing — do not vary this |
|---|---|---|
| Support email | `support@akrux.app` | **Platform support, not sales.** Never list it as a sales, partnership or press address. |
| Phone (display) | `+7 775 713 8329` | Reachable by call, WhatsApp and Telegram. |
| Phone (E.164) | `+77757138329` | Schema and `tel:` links only. |
| Sales / commercial intent | The existing **Book a call** action on the site | Commercial scope is agreed on a call, never over email. |

### Founder

The **only** human named anywhere on the site, in schema, or in any external
profile.

| Field | Value |
|---|---|
| Name | `Madiyar Askaruly` |
| Title | `Founder` |
| LinkedIn | `https://www.linkedin.com/in/askkaruly/` |

Do not add any other person, and do not describe the organisation's size in
either direction: no team section, no headcount, no `numberOfEmployees`, and
equally no "solo founder", "one-person company" or "founded and run alone". The
site carries no information on this subject, and that is deliberate.

---

## External profile checklist

| Profile | URL | Status |
|---|---|---|
| LinkedIn company page | `https://www.linkedin.com/company/akrux/` | **Slug reserved, page NOT YET CREATED.** This URL is already published in the Organization `sameAs`, so the page must be created or the reference points at nothing. |
| Crunchbase | — | **Not yet created.** |
| Wikidata | — | **Not yet created.** |

When creating each one:

1. Open with the disambiguated form, category and country in the first sentence.
2. Paste the long description for that profile's language from this file.
3. Use `https://akrux.app` as the website, with no trailing slash and no `www`.
4. Use `Astana, Kazakhstan` and `July 2026` exactly as written here.
5. Link back to the site, and add the new profile URL to
   `ORGANIZATION_IDENTITY.sameAs` in `packages/shared/src/seo.ts` so the link is
   reciprocal. A one-way `sameAs` is much weaker evidence than a two-way one.

---

## `legalName` is deliberately absent

The Organization node carries **no `legalName` property**, and `pnpm seo:audit`
fails the build if one appears. No registered legal entity exists yet. An absent
field is correct and readable as "not stated"; a placeholder, a trading name
dressed up as a legal name, or a guess is a false statement in machine-readable
data and is much harder to retract than to omit.

Add `legalName` only when a registered entity exists, and then add the exact
registered string — matching the registry character for character — to this file
first, and to `ORGANIZATION_IDENTITY` second.

The public `/terms` and `/privacy` pages already state that the legal operator,
registered address, governing law and dispute venue still have to be supplied.
Keep that statement until it stops being true.
