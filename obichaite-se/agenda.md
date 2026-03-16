## **ADDONS DECEMBER**

* staging - branch -> obichaite-senew-git-staging-obichaite-ses-projects.vercel.app

[const] ДОПЪЛНИТЕЛНИ НАСТРОЙКИ ДОКУМЕНТ = ДНД
MIDDLE BITS

[done] meta tags -> [AV] [6hours]
[done] price to euro everywhere [SR] - [1:30hours]
[done] точка 9 -> SR - [3hours]

=== PROJECT AGENDA ===

[done] PROJECT MIGRATION START IN 17.10.25 -> 30-45 дни срок около, завършек около 25.11.25

**CURRENT**
[done] install packages (only required)
[done] make the base styles
[done] insert the fonts
[done] transfer the generic components and utils
[done] start the project to seed the database
[done] make config for hero

[done] шоп карти в скрол
[done] възможност за изтриване
[done] възможност за увеличаване и намляване на бройката
[done] калкулиране на оставаща сума до 100 лв ако доставката е безплатна
[done] magic gradient
[done] когато потребител натисне добави да добавя една бройка към продукта в количката

[done] евент да не може да е в промо (админ)
[done] евент да няма конкретна цена (админ)
[done] организиране на събитие не трябва да ходи в чекоут и да няма в картата му бутони
[done] meta image
[done] single category page e.g produkti - all connected with paggination and basic sorts (best sellers, updatedAt) and connected subCategories - QC
[done] single subCategory page e.g vazi - all connected with paggination and and basic sorts (best sellers, updatedAt) all related subCategories - QC

[done] add global loader in (front-end level) - (each page with different title for the loader)
[done] extra section for product - best sales in that category and promotions in that category
[done] user shopping cart products - (fields in config and logic in shopping cart)
[done] auth flow - QC

[done] local storage for shopping cart for anonimni users
[done] make sure that all forms have global error handling
[done] add form inputs error handling

[done] emails for auth

[done] order collection in database - config (ref- MIRO), add orders in the user doc to the owner and the user

[done] checkout page - form (reference to original site),
[done] info about payment,
[done] order logic,
[done] logic to fill user and order docs in database
[done] and finally email- emails for auth
[done] Stripe, интегрираме
Account - office@obichaite-se.com
pass - 8411023033Aa@

[done] STRIPE - когато сайтът е на живо трябва да мине към productions keys and account!!

[done] user page orders and friends two rows with headings
[done] \*orders
[done] friends - трябва да се пита дали искат да правим server
[done] create config - collection or inner
[done] create form
[done] form submission logic
[pending] meta image to all or fallback - (try to use images of each page)
[QC] revalidate sub category (YA project for ref)
[done] update single product with sku or fallback 'id'
[done] продукти - когато продукта има quantity 0 - да пише изчерпана наличност и да не може да влиза количка
[done] при поръчка на неригистриран потребител да не излиза линк към профилна страница
[done] при поръчка потребителя да получава имейл
[done] При смяна на поръчка със статус изпратена клиента да получава мейл
[done] възможност за плащане по банка - да изписва, че ще се свързжат с потребителя за допълнителна информация
[done] дата на раждане да не може да е в бъдещето за приятели

[done] емейл provider-а да бъде сайтът
[done] sitemap
[done] cron job or something similar to handle the daily sending emails

- TODOS
  ?? add basic Seo jsonld and make each page with correct metadata ??
  ?? pwa if its possible ??

_emails_
[done] all needed emails that will be send from the front end and the admin
[done] when user make order - email to client with link to admin orders

_migration scripts_

[done] upcoming script
[done] first bulk upload all the media
[done] get all related to products jsons
[done] if product is new -> created with actual image
[done] else update only the media
[done] migrate all the users from the live database (superhosting)
[done] get all the users
[done] migrate them with script

**FEEDBACK**

[done] - "Прехвърля се в количката с 0лв и вече допълнително ще изпращаме оферти" - Events

**IMPORTANT**
-- each new user "admin", needs to be verifiied manually - [database]

**AFTER LIVE**

- bg-english texts

**BEFORE HANDOVER**
[done] да се отключи stripe в продуктион и да се тества
[done] да се създаде vercel na клиент
[done] да се създаде Neon на клиент
[done] да се оптимизират снимките (unoptimize да бъде динамично)

- да се изтрият поръчките
  [done] да променя всичко от ...vercel.app към live domain и env в нов Vercel URL..

**BACKUP**

- backup jsons in backup-json branch
