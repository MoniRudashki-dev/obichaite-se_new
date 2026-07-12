# Klaviyo MVP — Validation Checklist

**Audience:** Developer / QA / client-side technical owner  
**Project:** Next.js 15 + Payload CMS + Neon custom e-commerce  
**Goal:** Validate that the Klaviyo MVP integration is production-ready before release.

---

## Status Legend

Use the **Status** column as the single source of truth during QA.

- `[ ]` Not tested
- `[~]` In progress / needs review
- `[x]` Passed
- `[!]` Failed / requires fix
- `[n/a]` Not applicable

Recommended workflow:

1. Test first in staging/sandbox.
2. Confirm events in Klaviyo profile activity.
3. Confirm no duplicate or incorrect events are sent.
4. Repeat critical checkout/order tests in production with a real low-value order or test payment mode if available.

---

## 1. Environment & Access Validation

| # | Постигнат резултат | Как да го изтестваме мануално | Статус |
|---:|---|---|---|
| 1.1 | Klaviyo integration can be enabled/disabled via environment variable. | Set `KLAVIYO_ENABLED=false`, trigger product/cart/checkout/order actions, and confirm no Klaviyo events are sent. Then set `true` and confirm events are sent. | [ ] |
| 1.2 | Public Klaviyo Site ID is configured correctly. | Open the site, inspect network/browser console, and confirm the Klaviyo onsite script loads without errors. | [ ] |
| 1.3 | Private Klaviyo API key is configured only server-side. | Confirm the private API key is not present in browser source, network requests, client bundle, logs, or public env variables. | [ ] |
| 1.4 | Klaviyo API revision/version is configured consistently. | Check project env/config and confirm all server API requests use the intended Klaviyo API revision. | [ ] |
| 1.5 | Staging and production environments are clearly separated. | Trigger test events in staging and confirm they are distinguishable from production events by environment property, test profile, or separate Klaviyo account/list strategy. | [ ] |
| 1.6 | Klaviyo failures do not break the website UX. | Temporarily use an invalid private API key in staging, complete checkout/order flow, and confirm the site still works while logging the Klaviyo error. | [ ] |

---

## 2. Customer Profiles & Consent

| # | Постигнат резултат | Как да го изтестваме мануално | Статус |
|---:|---|---|---|
| 2.1 | New customer profile is created in Klaviyo when a user registers or provides email. | Register with a new test email, then search the email in Klaviyo Profiles and confirm the profile exists. | [ ] |
| 2.2 | Existing customer profile is updated instead of duplicated. | Use the same test email in a second flow, such as checkout or newsletter signup, and confirm the same Klaviyo profile is updated. | [ ] |
| 2.3 | Profile contains expected core fields. | Open the Klaviyo profile and confirm email, first name, last name, phone if available, and relevant custom properties are present. | [ ] |
| 2.4 | Email marketing consent is synced correctly. | Subscribe via newsletter/checkout consent checkbox and confirm the profile has the expected consent/subscription state in Klaviyo. | [ ] |
| 2.5 | Non-consenting users are not incorrectly subscribed to marketing. | Complete checkout without marketing consent and confirm the profile exists only as needed, without being subscribed to marketing list. | [ ] |
| 2.6 | Newsletter list subscription works. | Submit newsletter form with a fresh test email and confirm the profile is added to the configured newsletter/welcome list. | [ ] |
| 2.7 | Profile identification works after user login or email capture. | Log in or submit email, browse the site, and confirm later events are attached to the same Klaviyo profile. | [ ] |

---

## 3. Onsite Script & Browser Tracking

| # | Постигнат резултат | Как да го изтестваме мануално | Статус |
|---:|---|---|---|
| 3.1 | Klaviyo onsite script loads on public pages. | Open homepage/product page, inspect browser network requests, and confirm Klaviyo script is loaded successfully. | [ ] |
| 3.2 | Script does not crash SSR or Next.js rendering. | Hard refresh key pages and check browser console/server logs for hydration, script, or runtime errors. | [ ] |
| 3.3 | Browser tracking respects environment configuration. | Test in staging and production and confirm events contain the correct environment marker or are sent to the intended account. | [ ] |
| 3.4 | Anonymous browsing does not create broken profiles. | Open site in incognito, browse without email, and confirm no malformed profile/event payloads are created. | [ ] |

---

## 4. Viewed Product Event

| # | Постигнат резултат | Как да го изтестваме мануално | Статус |
|---:|---|---|---|
| 4.1 | `Viewed Product` event is sent when a product page is opened. | Identify as a test user, open a product page, then check the Klaviyo profile activity for `Viewed Product`. | [ ] |
| 4.2 | Event is attached to the correct customer profile. | Open the test profile in Klaviyo and confirm the viewed product event appears under that same profile. | [ ] |
| 4.3 | Event contains correct product data. | Inspect the event in Klaviyo and confirm product ID, name, price, URL, image, category, and availability if included. | [ ] |
| 4.4 | Event works for different product/category types. | Test at least one standard product, one experience/service item if applicable, and one event-organization product if applicable. | [ ] |
| 4.5 | Event is not sent repeatedly on the same page render. | Refresh/navigate once and confirm only expected events are created, without rapid duplicate events from React rerenders. | [ ] |

---

## 5. Added to Cart Event

| # | Постигнат резултат | Как да го изтестваме мануално | Статус |
|---:|---|---|---|
| 5.1 | `Added to Cart` event is sent when a product is added to cart. | Identify as test user, add a product to cart, then check Klaviyo profile activity for `Added to Cart`. | [ ] |
| 5.2 | Event contains correct item data. | Inspect the event and confirm product ID, name, quantity, unit price, image, URL, and category. | [ ] |
| 5.3 | Event contains useful cart data. | Confirm cart total, cart item count, currency, and cart/checkout URL are included if supported by the app. | [ ] |
| 5.4 | Event works for guest users after email capture. | Add product as guest, enter email later in checkout, and confirm Klaviyo can associate the cart behavior with the profile. | [ ] |
| 5.5 | Quantity updates are handled correctly. | Add the same product multiple times or increase quantity and confirm the event data matches the expected cart state. | [ ] |
| 5.6 | Removing an item from cart does not incorrectly send `Added to Cart`. | Add and remove product, then confirm removal does not create an additional misleading `Added to Cart` event. | [ ] |

---

## 6. Started Checkout Event

| # | Постигнат резултат | Как да го изтестваме мануално | Статус |
|---:|---|---|---|
| 6.1 | `Started Checkout` event is sent when checkout begins. | Add product to cart, start checkout, enter required contact data, then check Klaviyo profile activity. | [ ] |
| 6.2 | Event is sent after email is known. | Start checkout with a new test email and confirm the event is attached to that email profile. | [ ] |
| 6.3 | Event contains checkout and cart summary. | Inspect the event and confirm checkout URL, cart total, currency, line items, item count, and delivery option if available. | [ ] |
| 6.4 | Box Now delivery choice is represented when selected. | Start checkout with Box Now selected and confirm the event contains delivery method/property. | [ ] |
| 6.5 | Manual courier delivery choice is represented when selected. | Start checkout with manually entered courier/address flow and confirm delivery data is represented correctly. | [ ] |
| 6.6 | Duplicate checkout events are controlled. | Reload checkout page or move between checkout steps and confirm events are not spammed unexpectedly. | [ ] |
| 6.7 | Started checkout does not block checkout if Klaviyo fails. | Simulate Klaviyo API failure in staging and confirm checkout can continue. | [ ] |

---

## 7. Placed Order Event

| # | Постигнат резултат | Как да го изтестваме мануално | Статус |
|---:|---|---|---|
| 7.1 | `Placed Order` event is sent only after the agreed successful order condition. | Complete a successful test order and confirm the event appears only after the correct status/payment condition. | [ ] |
| 7.2 | Failed or abandoned payment does not send `Placed Order`. | Start checkout, fail/cancel payment, and confirm no `Placed Order` event is created. | [ ] |
| 7.3 | Event contains correct order ID and total. | Inspect the Klaviyo event and compare order ID, total amount, subtotal, discount, shipping, tax if applicable, and currency with the admin/order record. | [ ] |
| 7.4 | Event contains correct purchased products. | Compare line items in Klaviyo with the actual order: product IDs, names, quantities, prices, and categories. | [ ] |
| 7.5 | Event contains delivery/payment context. | Confirm payment method/status and delivery method such as Box Now/manual courier are included where applicable. | [ ] |
| 7.6 | Event is server-side and reliable. | Complete order with browser devtools closed/open/ad blocker if possible and confirm `Placed Order` still appears. | [ ] |
| 7.7 | Duplicate `Placed Order` events are prevented. | Reload thank-you page, retry webhook, or re-run order finalization if safe in staging and confirm no duplicate `Placed Order` for same order. | [ ] |
| 7.8 | Order completion stops abandoned flows logically. | Complete an order after `Started Checkout` and confirm Klaviyo profile has both events, enabling flow filters to suppress abandoned checkout email. | [ ] |

---

## 8. Product Catalog Sync

| # | Постигнат резултат | Как да го изтестваме мануално | Статус |
|---:|---|---|---|
| 8.1 | Product catalog is synced from Payload/Neon to Klaviyo. | Run catalog sync job/action and confirm products appear in Klaviyo catalog. | [ ] |
| 8.2 | Catalog item fields are correct. | Open sample products in Klaviyo and compare ID, title, description, URL, image, price, category, and availability with CMS/admin data. | [ ] |
| 8.3 | Product updates are reflected in Klaviyo. | Change product title/price/image/category in CMS, trigger sync, and confirm Klaviyo catalog updates. | [ ] |
| 8.4 | Product availability is reflected correctly. | Set product as unavailable/out of stock if supported, sync, and confirm Klaviyo catalog availability changes. | [ ] |
| 8.5 | Deleted/unpublished products are handled safely. | Unpublish a product in staging, sync, and confirm it is hidden/disabled/updated according to the selected strategy. | [ ] |
| 8.6 | Catalog sync handles products with missing optional fields. | Test product with missing image/description/optional metadata and confirm sync does not fail unexpectedly. | [ ] |
| 8.7 | Catalog sync does not create duplicate items. | Run sync twice and confirm Klaviyo catalog does not contain duplicate products for the same product ID. | [ ] |
| 8.8 | Catalog sync logs failures without exposing secrets. | Force one invalid product payload in staging if possible and confirm error logs are actionable and safe. | [ ] |

---

## 9. Automated Email Flow Readiness

> Note: This section validates that the code sends the required triggers and data. Actual email design/content may be managed manually inside Klaviyo.

| # | Постигнат резултат | Как да го изтестваме мануално | Статус |
|---:|---|---|---|
| 9.1 | Welcome flow trigger data is available. | Subscribe a new email to newsletter and confirm the profile/list subscription can trigger the Welcome flow. | [ ] |
| 9.2 | Abandoned Cart flow trigger data is available. | Identify user, add product to cart, do not checkout, and confirm `Added to Cart` event has enough data for an email block/link. | [ ] |
| 9.3 | Abandoned Checkout flow trigger data is available. | Start checkout and abandon it, then confirm `Started Checkout` event has checkout URL and cart items. | [ ] |
| 9.4 | Post-Purchase flow trigger data is available. | Complete order and confirm `Placed Order` event can trigger post-purchase email with order/product data. | [ ] |
| 9.5 | Flow filters can exclude purchasers from abandonment emails. | For a profile with `Started Checkout` followed by `Placed Order`, confirm Klaviyo flow logic can filter/suppress abandoned checkout message. | [ ] |
| 9.6 | Test emails render product data correctly. | Send preview/test emails from each flow and confirm product name, image, price, and CTA links render correctly. | [ ] |

---

## 10. Data Quality & Naming Consistency

| # | Постигнат резултат | Как да го изтестваме мануално | Статус |
|---:|---|---|---|
| 10.1 | Event names are consistent and documented. | Compare emitted event names with the implementation plan and Klaviyo flow triggers. | [ ] |
| 10.2 | Product IDs are consistent across events and catalog. | Compare `Viewed Product`, `Added to Cart`, `Placed Order`, and catalog item IDs for the same product. | [ ] |
| 10.3 | Currency is consistent. | Confirm all monetary events use the expected currency, e.g. `BGN` or project-defined currency. | [ ] |
| 10.4 | URLs in events are production-ready. | Confirm product and checkout URLs point to the correct domain/environment and are not localhost/staging in production. | [ ] |
| 10.5 | Image URLs are accessible by Klaviyo/email clients. | Open image URLs from event/catalog payloads in an incognito browser and confirm they are publicly accessible if required. | [ ] |
| 10.6 | PII is not logged unsafely. | Review server/client logs and confirm API keys, full payloads with sensitive personal data, and payment details are not exposed. | [ ] |

---

## 11. Error Handling, Logging & Production Safety

| # | Постигнат резултат | Как да го изтестваме мануално | Статус |
|---:|---|---|---|
| 11.1 | Klaviyo API errors are logged with enough context. | Simulate invalid API response in staging and confirm logs include operation name and safe identifiers. | [ ] |
| 11.2 | Checkout and order creation do not fail because of Klaviyo. | Temporarily disable/break Klaviyo in staging and complete order flow successfully. | [ ] |
| 11.3 | Retry or safe fallback exists for critical server-side events. | Simulate transient failure for `Placed Order` if possible and confirm retry/job/manual replay strategy exists. | [ ] |
| 11.4 | Idempotency exists for critical order events. | Re-trigger order success handling and confirm duplicate events are prevented or safely deduplicated. | [ ] |
| 11.5 | Feature flag can be used during incidents. | Disable Klaviyo via env/config and confirm the app continues operating normally. | [ ] |
| 11.6 | Deployment does not require manual code changes for secrets. | Confirm all Klaviyo keys/list IDs are configured through environment variables or secret manager. | [ ] |

---

## 12. End-to-End Test Scenarios

| # | Постигнат резултат | Как да го изтестваме мануално | Статус |
|---:|---|---|---|
| 12.1 | Guest user browse → add to cart → checkout abandon is tracked. | Use incognito, browse product, add to cart, enter email at checkout, abandon, then confirm profile/events in Klaviyo. | [ ] |
| 12.2 | Registered user browse → cart → successful order is tracked. | Log in as test user, view product, add to cart, complete order, and confirm full event timeline in Klaviyo. | [ ] |
| 12.3 | Box Now order is tracked correctly. | Complete an order using Box Now and confirm `Started Checkout`/`Placed Order` include the correct delivery method. | [ ] |
| 12.4 | Manual courier order is tracked correctly. | Complete an order using manual courier/address flow and confirm delivery data is correct in Klaviyo. | [ ] |
| 12.5 | Failed payment does not create purchase event. | Attempt payment failure/cancel scenario and confirm `Placed Order` is not sent. | [ ] |
| 12.6 | Multiple products in one order are tracked correctly. | Order 2+ different products and confirm all line items are present in `Placed Order`. | [ ] |
| 12.7 | Discounted order is tracked correctly if discounts exist. | Complete order with discount code and confirm total/discount data is accurate. | [ ] |
| 12.8 | Mobile checkout tracking works. | Repeat core browse/cart/checkout/order scenario on mobile viewport/device and confirm events. | [ ] |

---

## 13. Final Production Release Checklist

| # | Постигнат резултат | Как да го изтестваме мануално | Статус |
|---:|---|---|---|
| 13.1 | Production env variables are configured. | Check deployment environment/secrets and confirm production keys/list IDs are present and correct. | [ ] |
| 13.2 | Staging/test data will not pollute production reporting. | Confirm staging uses separate markers/account/list or has a clear exclusion strategy in Klaviyo. | [ ] |
| 13.3 | Core events appear in production Klaviyo account. | Perform a controlled production smoke test and confirm profile/events appear correctly. | [ ] |
| 13.4 | Core flows are in correct Klaviyo mode. | Confirm each MVP flow is Draft/Manual/Live according to launch decision. | [ ] |
| 13.5 | Email sender/domain settings are verified. | Check Klaviyo sender settings/domain authentication status before enabling live email sends. | [ ] |
| 13.6 | Client/admin knows where to check profiles/events/flows. | Walk through Klaviyo Profiles, Metrics/Events, Catalog, and Flows with the responsible person. | [ ] |
| 13.7 | Rollback/disable plan is documented. | Confirm the team knows how to disable Klaviyo tracking quickly via env/config if needed. | [ ] |
| 13.8 | Final QA sign-off is completed. | Review all checklist sections and confirm all critical items are `[x]` or explicitly `[n/a]`. | [ ] |

---

## QA Notes

Use this area during validation.

```text
Date:
Environment:
Tester:
Klaviyo account/list:
Test profile email(s):
Test order ID(s):
Issues found:
Fix owner:
Retest result:
```

---

## Critical Pass Criteria

The integration should not be considered production-ready unless these are passed:

- `[ ]` Private API key is never exposed client-side.
- `[ ]` `Placed Order` is sent only for successful orders.
- `[ ]` Failed payments do not create purchase events.
- `[ ]` Duplicate `Placed Order` events are prevented.
- `[ ]` Product IDs match across catalog and events.
- `[ ]` Checkout/order flow works even if Klaviyo fails.
- `[ ]` Welcome, Abandoned Cart, Abandoned Checkout, and Post-Purchase triggers have valid data.
- `[ ]` Production/staging data separation is clear.
