# HM Home — Test Cases

Manual test cases for the HM Home ecommerce site (Next.js 15 + Supabase).
Language of the UI is Albanian; expected texts below note the Albanian label where relevant.

**Environments**
- Local: `nvm use 22.22.2` → `yarn dev` (http://localhost:3000)
- Prod: Vercel deployment

**Legend** — Priority: P0 (critical / smoke), P1 (high), P2 (normal).
Status column is for the tester to fill in (✅ Pass / ❌ Fail / ⏭ Skipped).

---

## 1. Smoke Test (P0 — run on every deploy)

Fast end-to-end pass confirming the site is up and the core purchase path works.

| # | Test case | Steps | Expected result | Status |
|---|-----------|-------|-----------------|--------|
| S1 | Home page loads | Open `/` | 200 OK, hero image + nav render, no console errors | |
| S2 | Shop page loads | Open `/shop` | Product grid renders with at least one product | |
| S3 | Dynamic category nav | Open header/drawer nav | Categories load from DB (`dekore`, `dhoma-gjumi`, `divana`, `kuzhina`), links resolve (no 404) | |
| S4 | Product detail loads | Open a `/product/[slug]` | Gallery, price, description, "Shto në shportë" button, JSON-LD present | |
| S5 | Add to cart | On a product, click add-to-cart | Cart count increments; item shows in `/cart` | |
| S6 | Checkout happy path | Fill checkout form with valid data, submit | Order placed; redirect to `/checkout/success/[id]`; stock decremented | |
| S7 | Order emails sent | Complete S6 | Owner alert email to `ORDER_ALERT_EMAIL` + customer confirmation received | |
| S8 | Login works | Log in with valid admin creds | Redirect to intended page; session set | |
| S9 | Admin guard | Visit `/admin` while logged out | Redirected to login (not exposed) | |
| S10 | Admin dashboard | Visit `/admin` as admin | Stats, low stock, recent orders render | |

> If any S1–S6 fails, treat the deploy as broken and roll back / block.

---

## 2. Authentication (P0/P1)

| # | Test case | Steps | Expected result | Status |
|---|-----------|-------|-----------------|--------|
| A1 | Register new user | `/auth/register` with new email + valid password | Account created; confirmation email sent; user must confirm | |
| A2 | Register duplicate email | Register with an existing email | Generic error (no enumeration / no raw Supabase error echoed) | |
| A3 | Login valid | `/auth/login` correct creds | Logged in, redirected | |
| A4 | Login invalid | Wrong password | Generic error, no session | |
| A5 | Login rate limit | Many rapid failed logins from same IP | Throttled (rate limit kicks in) | |
| A6 | Forgot password | `/auth/forgot-password` with valid email | Always redirects `?sent=1`; reset email sent | |
| A7 | Forgot password (unknown email) | Submit unknown email | Still `?sent=1` (no enumeration) | |
| A8 | Reset link flow | Click email reset link | Lands `/auth/update-password` via `/auth/callback`; can set new password | |
| A9 | Login success banner | Arrive at login with `?reset=1` | "Password updated" success banner shown | |
| A10 | Signout | Click signout | Session cleared; protected pages redirect to login | |
| A11 | Account guard | Visit `/account/*` logged out | Redirect to login | |

---

## 3. Catalog & Shop (P1)

| # | Test case | Steps | Expected result | Status |
|---|-----------|-------|-----------------|--------|
| C1 | Filter by category | Use shop filters | Only matching products shown | |
| C2 | Sort by price | Sort ascending/descending | Order uses **effective (discounted)** price, not base price | |
| C3 | Discounted product | View product with discount | Discounted price displayed; effective price used in sort/filter | |
| C4 | Made-to-order product | View product with `stock = null` | No "out of stock"; can still add to cart | |
| C5 | Out-of-stock product | Product with `stock = 0` | Add-to-cart blocked / shown unavailable | |
| C6 | Related products | On product detail | Related products section renders | |
| C7 | Sitemap | Open `/sitemap.xml` | Valid XML with product/category URLs | |
| C8 | Invalid slug | Open `/product/does-not-exist` | Custom `not-found` page (404), no crash | |

---

## 4. Cart (P1)

| # | Test case | Steps | Expected result | Status |
|---|-----------|-------|-----------------|--------|
| CA1 | Guest cart | Add item while logged out | Persisted via `session_id` cookie | |
| CA2 | Authed cart | Add item while logged in | Persisted in DB | |
| CA3 | Cart merge on login | Add as guest, then log in | Guest cart merges into user cart | |
| CA4 | Update quantity | Change qty in cart | Totals update; router refreshes | |
| CA5 | Remove item | Remove a line | Item gone; totals update | |
| CA6 | Cart ownership (IDOR) | Try mutating another user's cart id | Denied (ownership-scoped) | |
| CA7 | Empty cart state | Empty the cart | Empty-state message + valid category links | |

---

## 5. Checkout & Orders (P0/P1)

| # | Test case | Steps | Expected result | Status |
|---|-----------|-------|-----------------|--------|
| CO1 | Valid checkout | Submit valid form | `place_order` RPC runs atomically: order + items created, stock decremented, cart cleared | |
| CO2 | Price tampering | Alter price client-side, submit | Server-side validation rejects / uses DB price | |
| CO3 | Stock tampering | Order more than available stock | Rejected (insufficient stock) | |
| CO4 | Duplicate on reload | Submit, then reload/resubmit | Idempotency key (server-derived sha256) prevents duplicate order | |
| CO5 | Field length limits | Submit overly long name/notes | Rejected by zod `.max()` bounds | |
| CO6 | Success page (owner) | View `/checkout/success/[id]` as buyer | Order shown (authorized via owner / `hm_orders` cookie) | |
| CO7 | Success page (PII leak) | View another user's order id | Denied — no PII leak | |
| CO8 | Order in account | Logged-in buyer opens `/account/orders` | Order appears in list; detail opens | |

---

## 6. Admin (P1)

| # | Test case | Steps | Expected result | Status |
|---|-----------|-------|-----------------|--------|
| AD1 | Admin layout re-check | Non-admin user hits `/admin` | Denied (layout re-checks `getUser()` + admin role) | |
| AD2 | Product create | Create product + upload images | Saved; images converted Sharp→WebP; slug auto-suffixed if dup | |
| AD3 | Upload limits | Upload oversized / wrong-type file | Rejected (size/type limits) | |
| AD4 | Discount validation | Set discount ≥ price | Rejected (discount < price required) | |
| AD5 | Product delete | Delete product | Storage images cleaned up; `order_items.product_id` set null (orders preserved) | |
| AD6 | Category CRUD | Create/edit/delete category | Reflected in nav + shop filters | |
| AD7 | Orders list + status | Change order status | Status updated; cancel restores stock | |
| AD8 | Pagination | Many products/orders | Pagination works | |
| AD9 | Visits management | `/admin/visits` change status | Status cycles new → confirmed → done → cancelled | |

---

## 7. Showroom Visit Booking (P2)

| # | Test case | Steps | Expected result | Status |
|---|-----------|-------|-----------------|--------|
| V1 | Submit visit request | `/caktoni-viziten` valid form | Inserted into `visit_requests`; appears in `/admin/visits` | |
| V2 | Validation | Missing required fields / oversized input | Rejected | |
| V3 | Entry points | Footer link + ShowroomCTA button | Both route to `/caktoni-viziten` | |

---

## 8. Security & RLS (P0 — verify periodically)

| # | Test case | Steps | Expected result | Status |
|---|-----------|-------|-----------------|--------|
| SEC1 | Anon read sensitive tables | Query orders/carts/profiles/etc. with anon key | Empty results (RLS blocks) | |
| SEC2 | Anon write | Attempt insert/update/delete with anon key | Denied (0 rows) | |
| SEC3 | Role self-elevation | Try setting `profiles.role = admin` | Denied (column REVOKE + WITH CHECK) | |
| SEC4 | Direct RPC call | Anon calls `place_order` via PostgREST | 42501 / denied | |
| SEC5 | Catalog public read | Anon reads products/categories/product_images | Allowed (public catalog) | |
| SEC6 | Client IP spoof | Spoof `x-forwarded-for` header | Rate limiting unaffected (uses `x-vercel-forwarded-for`) | |
| SEC7 | Open redirect | Pass malicious `next` param to auth | Validated/blocked via `safe-redirect.ts` | |
| SEC8 | Middleware fail-closed | Prod with Supabase env missing | `/admin` + `/account` blocked (fail closed) | |

> Note: migration `0009_audit_hardening.sql` must be applied for SEC3 column-level REVOKE + money CHECKs to hold on live DB.

---

## 9. Responsive / Cross-cutting (P2)

| # | Test case | Steps | Expected result | Status |
|---|-----------|-------|-----------------|--------|
| R1 | Mobile menu | Open hamburger drawer on mobile | Drawer slides from left; a11y focus handled | |
| R2 | Breakpoints | Resize across 768/820/900/1024px | Grid reflows cleanly | |
| R3 | Error boundaries | Trigger a render error | `error.tsx` / `global-error.tsx` shown, not white screen | |
| R4 | 404 | Hit unknown route | `not-found.tsx` shown | |

---

## 10. Build / CI gate (P0)

| # | Test case | Command | Expected result | Status |
|---|-----------|---------|-----------------|--------|
| B1 | Type check | `npx tsc --noEmit` | No errors | |
| B2 | Lint | `yarn lint` | No errors | |
| B3 | Production build | `yarn build` (stop dev first) | Build succeeds | |

---

_Last updated: 2026-06-19_
