# Klaviyo — Какво остава до показване на клиент

Кратък практически чеклист. **Кодът е готов** (интеграцията е имплементирана в `src/Klaviyo/`).
Остават предимно настройка на акаунта, env стойности, ръчен QA и конфигурация на flows.

Легенда: `[ ]` предстои · `[~]` в процес · `[x]` готово

---

## 0. Готово (от страна на кода)

- [x] Изолиран модул `src/Klaviyo/` (server client, mappers, services, client script/events).
- [x] Viewed Product, Added to Cart, Started Checkout (client) — закачени.
- [x] Placed Order (server, Order afterChange hook) — за всяка поръчка, идемпотентен (`klaviyoPlacedOrderSentAt` + `orderNumber`).
- [x] Newsletter subscribe при checkout consent (`acceptNextContacts`).
- [x] Catalog sync — incremental (Product hook) + пълен (`pnpm klaviyo:sync-catalog` / route `/api/klaviyo/sync-catalog`).
- [x] Feature flag, redacted logging, retry, mapper unit тестове (17 зелени).

---

## 1. Klaviyo акаунт и достъп  → отговорник: клиент/админ

- [ ] Достъп до **бойния Klaviyo акаунт на клиента** (роля Owner/Admin/Manager). Да НЕ се прави временен дублиран акаунт.
- [ ] Създаден **Private API Key** ("Website Production Integration") с scopes: Profiles, Events, Catalogs, Lists (Read/Write) + Metrics (Read).
- [ ] Копиран **Public API Key / Site ID**.
- [ ] Създаден/избран **Newsletter list** → взет неговият **List ID**.
- [ ] Public key allowlist (ако акаунтът го ползва): production + staging + `http://localhost:3000`.

Детайли: виж `klaviyo-manual-setup.md`.

---

## 2. Env променливи  → отговорник: dev

Попълване в **staging** и **production** (виж `.env.example`):

- [ ] `NEXT_PUBLIC_KLAVIYO_PUBLIC_API_KEY`
- [ ] `KLAVIYO_PRIVATE_API_KEY` (само server, не се commit-ва)
- [ ] `KLAVIYO_NEWSLETTER_LIST_ID`
- [ ] `KLAVIYO_ENABLED=true`, `NEXT_PUBLIC_KLAVIYO_ENABLED=true`
- [ ] `KLAVIYO_ENVIRONMENT` / `NEXT_PUBLIC_KLAVIYO_ENVIRONMENT` = `staging` за тестовата среда, `production` за бойната
- [ ] `KLAVIYO_CATALOG_SYNC_SECRET` (или ще ползва `CRON_SECRET`)
- [ ] `KLAVIYO_API_REVISION=2026-04-15`

> Важно за демо пред клиент: тествай първо със `KLAVIYO_ENVIRONMENT=staging`, за да не замърсиш production репортите.

---

## 3. Първоначален catalog sync  → отговорник: dev

- [ ] Пусни пълен sync: `pnpm klaviyo:sync-catalog` (или GET на route-а със secret).
- [ ] Провери в Klaviyo → Catalog: продуктите ги има, снимки/цени/URL-и са коректни, няма дубликати при повторно пускане.
- [ ] Провери, че `ProductID` в събитията съвпада с catalog `external_id`.

## 3.1 Cron за Placed Order retry sweep  → отговорник: dev

Placed Order има immediate (неблокиращ) опит + durable backstop. Backstop-ът трябва да се вика периодично:

- [ ] Насрочи периодично извикване (напр. на всеки 10–15 мин) на `GET /api/klaviyo/retry-placed-orders?token=<secret>` — през същия cron pinger като `daily-cron` (или `pnpm klaviyo:retry-placed-orders`).
- [ ] Провери еднократно: спри Klaviyo (невалиден ключ), направи поръчка, върни ключа, пусни retry-а → събитието се доизпраща и поръчката получава `klaviyoPlacedOrderSentAt`.
- [ ] Прозорецът е 72h назад (не backfill-ва стари поръчки) — потвърди, че отговаря на нуждите.

---

## 4. Ръчен QA (staging)  → отговорник: dev/QA

Мини през основните сценарии (пълен списък: `klaviyo-validation-checklist.md`):

- [ ] Онсайт скриптът се зарежда, няма конзолни грешки, private key НЕ се вижда в браузъра/network.
- [ ] Продуктова страница → `Viewed Product` в профила.
- [ ] Add to cart → `Added to Cart`.
- [ ] Checkout + въведен email → `Started Checkout` (+ identify).
- [ ] Завършена поръчка (карта / наложен платеж / банков) → точно едно `Placed Order`, коректни value/currency/items/paymentStatus.
- [ ] Reload на "успешна поръчка" НЕ дублира `Placed Order`.
- [ ] Счупен Klaviyo (невалиден ключ) → сайтът/поръчката работят нормално.
- [ ] Поръчка с чекнат "последващи контакти" → профилът е в newsletter list с consent; без чекбокс → само профил.

---

## 5. Flows в Klaviyo (ръчно)  → отговорник: клиент/маркетинг + проверка dev

Кодът праща тригерите; самите имейли се правят в Klaviyo. За демо е достатъчно flow-овете да са в **Draft/Manual**, прегледани:

- [ ] Welcome (тригер: добавяне в newsletter list).
- [ ] Abandoned Cart (тригер: `Added to Cart`, филтър: 0 × `Placed Order`).
- [ ] Abandoned Checkout (тригер: `Started Checkout`, филтър: 0 × `Placed Order`).
- [ ] Post-Purchase (тригер: `Placed Order`).
- [ ] Потвърдено: филтрите изключват купувачите от abandonment имейлите.

Детайли: `klaviyo-manual-setup.md` (раздел 8).

---

## 6. Deliverability / имейли  → отговорник: клиент + dev

- [ ] Проверен sender domain / DNS автентикация в Klaviyo (Settings → Email → Domains).
- [ ] Решено: Klaviyo е само за **маркетинг** флоуове; съществуващите транзакционни имейли остават (препоръка от плана).
- [ ] **Flow-овете НЕ се пускат Live**, докато домейнът не е "healthy" и клиентът не одобри копитата.

---

## 7. Преди самото демо пред клиент  → отговорник: dev

- [ ] `pnpm build` минава чисто (все още не е пускан локално — препоръчително).
- [ ] Пуснат smoke тест в средата за демо (1 поръчка end-to-end, проверен timeline на профила в Klaviyo).
- [ ] Подготвен кратък обход: къде в Klaviyo се гледат Profiles / Metrics / Catalog / Flows.
- [ ] Тестовите профили/поръчки маркирани като test или в staging среда.
- [ ] Ясно как бързо се спира трекингът при нужда (`KLAVIYO_ENABLED=false`).

---

## Отворени решения за клиента (добре е да се питат преди Live)

- Double opt-in за newsletter — да/не?
- Дискаунт в Welcome / втори abandoned имейл — да/не, статичен или уникален код?
- Мигрирани стари клиенти да НЕ тригерят Welcome (препоръка).
- Отделен staging Klaviyo акаунт/лист ли, или само environment маркер за разделяне на данните?
