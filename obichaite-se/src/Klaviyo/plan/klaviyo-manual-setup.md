# Klaviyo MVP — Manual Setup Checklist

**Audience:** Developer / admin with access to the target Klaviyo account  
**Project:** Custom e-commerce platform — Next.js 15 + Payload CMS + Neon  
**Goal:** Prepare the Klaviyo account for a production-ready MVP integration before and during implementation.

---

## 0. MVP Scope

The agreed MVP Klaviyo integration includes:

1. Customer profiles
2. Viewed Product
3. Added to Cart
4. Started Checkout
5. Placed Order
6. Product catalog
7. Core automated email flows

Core automated flows for MVP:

- Welcome email / Welcome flow
- Abandoned Cart
- Abandoned Checkout
- Post-Purchase

---

## 1. Admin Access Requirements

Before implementation, confirm that the dev team has one of the following roles in Klaviyo:

- Owner
- Admin
- Manager

Admin/Manager access is needed for:

- API key management
- List management
- Flow setup and QA
- Event/metric validation
- Profile inspection
- Catalog validation
- Domain and sending settings review

Manual action:

- Invite the developer account/team account to Klaviyo.
- Avoid sharing personal passwords.
- Use the client's organization account, not a temporary duplicated Klaviyo account.

---

## 2. API Keys

Go to:

```text
Klaviyo → Account name → Settings → API keys
```

### 2.1 Public API Key / Site ID

Copy the **Public API Key**, also called **Site ID**.

This will be used in the frontend for:

- Klaviyo onsite script
- Browser/client-side tracking
- Profile identification in the browser
- Viewed Product / Added to Cart client-side tracking if used

Target env variable:

```env
NEXT_PUBLIC_KLAVIYO_PUBLIC_API_KEY=
```

Security note:

- This key is safe to expose in the browser.
- It identifies the Klaviyo account but does not grant private account access.

### 2.2 Private API Key

Create a new **Private API Key** specifically for this integration.

Recommended name:

```text
Website Production Integration
```

Use **Custom** scopes, not full access, unless the client explicitly approves temporary full access for setup/testing.

Recommended scopes:

| Scope | Access | Purpose |
|---|---:|---|
| Profiles | Read/Write | Create/update customer profiles |
| Events | Read/Write | Send and validate events |
| Catalogs | Read/Write | Sync products, variants, categories |
| Lists | Read/Write | Newsletter/welcome flow list handling |
| Metrics | Read | Validate Klaviyo metrics/events during QA |

Target env variable:

```env
KLAVIYO_PRIVATE_API_KEY=
```

Security rules:

- Store the key in a password manager or secrets vault.
- Do not paste it in Slack/Email/plain chat.
- Do not commit it to Git.
- The private key cannot be viewed again after creation; save it immediately.
- Rotate the key after any suspected exposure.

---

## 3. Public API Key Allowlist

In Klaviyo, configure the public key / Site ID allowlist if the client account uses this security option.

Recommended allowed domains:

```text
https://production-domain.com
https://www.production-domain.com
https://staging-domain.com
http://localhost:3000
```

Adjust according to the real domains.

Important:

- If the allowlist is enabled and the staging/local domain is missing, client-side tracking may silently fail.
- Do not leave unnecessary domains in the allowlist after production launch.
- Remove localhost from production account after implementation if the client requires strict security.

---

## 4. Lists

Create or identify the list used for newsletter/welcome subscribers.

Recommended list name:

```text
Newsletter Subscribers
```

Required value:

```env
KLAVIYO_NEWSLETTER_LIST_ID=
```

Manual checks:

- Confirm whether double opt-in should be enabled or disabled.
- Confirm whether this list should trigger the Welcome flow.
- Confirm whether historical/imported users should trigger Welcome emails or not.

Recommended MVP rule:

- New frontend newsletter signups should trigger the Welcome flow.
- Existing migrated customers should not trigger Welcome flow unless the client explicitly wants this.

---

## 5. Consent Settings

Confirm with the client how marketing consent is collected.

Minimum decisions needed:

1. Is newsletter subscription optional or preselected?
2. Does checkout include a marketing consent checkbox?
3. Is SMS marketing included in MVP or email-only?
4. Is double opt-in required?
5. Which consent text should be displayed on the website?
6. Which privacy policy URL should be linked?

Recommended MVP:

- Email marketing only.
- Explicit checkbox for marketing consent.
- Store consent timestamp and source.
- Do not subscribe checkout users unless they explicitly opt in.

Suggested profile properties:

```text
marketing_consent_source
marketing_consent_at
marketing_consent_page
customer_type
last_order_id
last_order_status
```

---

## 6. Product Catalog Setup

Klaviyo should receive product catalog data from the website/Payload/Neon source of truth.

Manual decisions needed:

1. What is the stable product ID?
2. Are there product variants?
3. Are experiences/events modeled as products, services, or separate item types?
4. Should unavailable products remain in Klaviyo catalog?
5. Which product URL should be used in emails?
6. Which image should be used as the main image?
7. Which product categories/collections should be synced?

Recommended stable IDs:

```text
Product item ID: website product ID / Payload product ID
Variant ID: product ID + variant ID, if variants exist
```

Recommended required fields:

| Field | Required | Notes |
|---|---:|---|
| External ID | Yes | Stable product identifier |
| Title | Yes | Product name |
| URL | Yes | Absolute production URL |
| Image URL | Yes | Absolute production image URL |
| Price | Yes | Final visible price |
| Currency | Yes | BGN/EUR according to website |
| Availability | Yes | In stock / out of stock |
| Category | Recommended | Useful for segmentation and product feeds |
| Product type | Recommended | article / experience / event service / poster |

Manual Klaviyo check after first sync:

```text
Klaviyo → Content / Products / Catalogs
```

Validate:

- Products appear
- Images load
- Prices are correct
- URLs open production/staging pages correctly
- Variants, if any, are mapped correctly

---

## 7. Metrics / Events to Validate in Klaviyo

After implementation, verify that these metrics appear in Klaviyo:

```text
Viewed Product
Added to Cart
Started Checkout
Placed Order
```

Optional supporting/custom metrics:

```text
Signed Up for Newsletter
Created Customer Profile
```

Manual validation location:

```text
Klaviyo → Analytics → Metrics
```

For each event, check:

- Correct profile is attached
- Correct timestamp
- Correct product data
- Correct cart/order value
- Correct currency
- Correct URL/image fields
- Event is not duplicated on page refresh or retry

---

## 8. Flow Setup

### 8.1 Welcome Flow

Trigger:

```text
Added to Newsletter Subscribers list / subscribed to email marketing
```

Recommended filters:

```text
Has not placed order since starting this flow
Is consented to email marketing
```

Minimum content:

- Welcome message
- Brand/shop introduction
- Popular categories/products
- Optional first-order incentive if client approves

Manual decision:

- Does this flow include a discount?
- If yes, is it static or unique per user?

---

### 8.2 Abandoned Cart Flow

Trigger:

```text
Added to Cart
```

Recommended flow filter:

```text
Has Placed Order zero times since starting this flow
```

Recommended timing:

```text
Email 1: 1–3 hours after Added to Cart
Email 2: 20–24 hours later, optional
```

Minimum content:

- Reminder message
- Cart/product block
- CTA back to cart or product

Manual decision:

- Should the email show product data dynamically?
- Should there be a discount in the second email?

---

### 8.3 Abandoned Checkout Flow

Trigger:

```text
Started Checkout
```

Recommended flow filter:

```text
Has Placed Order zero times since starting this flow
```

Recommended timing:

```text
Email 1: 1 hour after Started Checkout
Email 2: 20–24 hours later, optional
```

Minimum content:

- Reminder to complete checkout
- Checkout/cart details
- CTA back to checkout

Manual decision:

- What checkout recovery URL should be used?
- Is checkout state restorable, or should CTA return to cart/product page?

---

### 8.4 Post-Purchase Flow

Trigger:

```text
Placed Order
```

Recommended filters:

```text
Order status is successful/paid
```

Minimum content:

- Thank-you email
- Order-related help/info
- Cross-sell or next-step content
- Optional review request later

Manual decision:

- Should this replace existing transactional emails or remain marketing-only?
- Should review request be included in MVP or phase 2?

---

## 9. Transactional vs Marketing Emails

Important production decision:

- MVP automated emails should be marketing/automation emails unless the client explicitly approves using Klaviyo for transactional emails.
- Existing order confirmation/payment/shipping emails should not be replaced until a separate transactional email plan is approved.

Recommended MVP:

```text
Keep existing system transactional emails.
Use Klaviyo for marketing automation flows only.
```

This avoids delivery, legal, and operational risk during first integration.

---

## 10. Sender Domain / Email Deliverability

Before enabling flows, check sending setup.

Manual checks in Klaviyo:

```text
Klaviyo → Settings → Email → Domains / Sending domain
```

Confirm:

- Sender name
- Sender email
- Reply-to email
- Branded sending domain
- DNS records are configured
- Domain authentication is complete

Do not enable production flows until sending domain status is healthy.

---

## 11. Testing Profiles

Create test users/emails for QA.

Recommended:

```text
klaviyo-test+profile@example.com
klaviyo-test+cart@example.com
klaviyo-test+checkout@example.com
klaviyo-test+order@example.com
```

Use real accessible inboxes where possible.

Test scenarios:

1. Anonymous user views product
2. Known user views product
3. User subscribes to newsletter
4. User adds product to cart
5. User starts checkout but does not order
6. User completes order with card payment
7. User completes order with Box Now delivery
8. User completes order with manually entered courier
9. User refreshes product/cart/checkout pages — no unwanted duplicates
10. User completes order — abandoned cart/checkout should stop

---

## 12. Launch Checklist

Before production launch:

- [ ] Public API key/Site ID configured
- [ ] Private API key created with least required scopes
- [ ] Env vars added to production hosting
- [ ] Newsletter list ID confirmed
- [ ] Consent rules confirmed
- [ ] Product catalog sync tested
- [ ] Viewed Product appears in Klaviyo
- [ ] Added to Cart appears in Klaviyo
- [ ] Started Checkout appears in Klaviyo
- [ ] Placed Order appears in Klaviyo
- [ ] Event payloads validated
- [ ] Flow filters prevent emails after purchase
- [ ] Sending domain is authenticated
- [ ] Test profiles cleaned or marked as test
- [ ] Staging/test events are not mixed with production reporting, or are clearly marked
- [ ] Client approves email copy/templates
- [ ] Flows are reviewed before switching live

---

## 13. Post-Launch Monitoring

First 48–72 hours:

- Check event volume
- Check duplicate events
- Check profiles created
- Check catalog sync status
- Check flow triggers
- Check email sends
- Check unsubscribe/complaint rate
- Check order attribution only after enough real data exists

If something looks wrong:

1. Pause affected flow
2. Inspect recent profiles/events
3. Check app logs
4. Check Klaviyo API errors
5. Fix integration issue
6. Re-test with controlled test profile
7. Re-enable flow

---

## 14. Reference Links

- Custom ecommerce integration guide: https://developers.klaviyo.com/en/docs/guide_to_integrating_a_platform_without_a_pre_built_klaviyo_integration
- JavaScript API: https://developers.klaviyo.com/en/docs/javascript_api
- Events API: https://developers.klaviyo.com/en/reference/events_api_overview
- Create Event endpoint: https://developers.klaviyo.com/en/reference/create_event
- Client Event endpoint: https://developers.klaviyo.com/en/reference/create_client_event
- Profiles API: https://developers.klaviyo.com/en/reference/profiles_api_overview
- Create or Update Profile: https://developers.klaviyo.com/en/reference/create_or_update_profile
- Lists API: https://developers.klaviyo.com/en/reference/lists_api_overview
- Catalogs API: https://developers.klaviyo.com/en/reference/catalogs_api_overview
- API keys help: https://help.klaviyo.com/hc/en-us/articles/115005062267
