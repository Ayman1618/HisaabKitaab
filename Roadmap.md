# HisaabKitaab — Bug Fixes & World-Class Roadmap

---

## 🐛 What Was Broken & What Was Fixed

### 1. Critical: SMS Reading Won't Work in Expo Go
**Root Cause:** `react-native-get-sms-android` is a native module. Expo Go uses its own
JavaScript runtime and cannot load arbitrary native modules. The app was silently falling
back to mock data but the code was written as if real SMS would work.

**Fix:**
- `sms-service.ts` now lazy-loads the module via `require()` inside a try/catch
- If the module isn't available, it throws a clear `SMS_MODULE_UNAVAILABLE` error instead of hanging
- `DashboardScreen.tsx` detects Expo Go at runtime and shows a badge warning
- Added a Real/Mock toggle in the UI so devs can switch modes without touching code
- `app.json` now declares `READ_SMS` and `RECEIVE_SMS` Android permissions (required for Dev Build)

**To enable real SMS:**
```bash
npx expo run:android   # builds a Dev Build with native modules
```

### 2. Critical: `SALARY` Category Enum Missing from Prisma Schema
**Root Cause:** `regex.engine.ts` returned `category: 'SALARY'` but the Prisma `Category`
enum only had `FOOD | TRAVEL | SHOPPING | BILLS | ENTERTAINMENT | OTHER`. The `$transaction`
block would throw a Prisma validation error and silently drop all salary transactions.

**Fix:**
- Added `SALARY` to `schema.prisma` enum
- Added migration `20260504000000_add_salary_category/migration.sql`
- Run: `npx prisma migrate deploy` after pulling changes

### 3. Regex Engine: Poor Amount Extraction & Merchant Detection
**Root Cause:** The `amountPattern` regex used a simple non-anchored match that would pick
up account numbers (e.g., "XX1234") as amounts. Merchant patterns were too broad, pulling
in banking phrases like "your account".

**Fix in `regex.engine.ts`:**
- Anchored amount regex to `[1-9][\d,]*` — won't match account numbers starting with `X`
- Added 20+ known Indian merchants/apps with direct category mapping
- Added more expense/income keywords (`withdrawn`, `purchase`, `cashback`, `reversal`)
- Merchant pattern now rejects candidates starting with generic banking words
- `predictCategory()` expanded with broader keyword sets

### 4. Parser Service: Flawed AI Fallback Logic
**Root Cause:** The condition `if (!regexResult.is_transaction && regexResult.confidence >= 0.90)`
was unreachable (confidence can't be >= 0.90 if `is_transaction` is false with the old engine).
Also, AI results replaced regex even when AI was only marginally better.

**Fix in `parser.service.ts`:**
- Cleaner branching: high-confidence regex → skip AI; very-low-confidence → junk, skip AI
- AI fallback only fires in the genuine ambiguous middle zone (0.20–0.70)
- Merges best fields from both engines rather than wholesale replacing

### 5. DashboardScreen: Hardcoded "FORCING SIMULATION MODE" Comment & UX Issues
**Root Cause:** `handleSync()` had a `console.log('[DEBUG] Sync Clicked - FORCING SIMULATION MODE')`
comment and always called mock, never real sync. The UI showed no indication of mode.

**Fix:**
- Real/Mock toggle UI added
- `handleSync()` branches on the toggle
- Error messages are specific (permission denied vs network vs module unavailable)
- Greeting is dynamic (Good Morning / Afternoon / Evening)
- Transaction list shows category-appropriate icons and amount coloring
- Low-confidence transactions show a ⚠ badge for manual review

### 6. Transaction Controller: No Filtering, No Summary Endpoint
**Fix:** Added `?category=FOOD&type=EXPENSE&limit=50` query params and a new `/summary` endpoint.

---

## 🗺️ Roadmap to World-Class

### Phase 1 — Core Polish (Next 2–4 weeks)
These make the app actually shippable for beta users.

| Task | Why |
|------|-----|
| **Multi-screen navigation** (React Navigation) | App is stuck on one screen |
| **Auth** (phone + OTP via Firebase or Supabase) | Currently hardcoded `demo-user-1` |
| **Real AI parsing** (replace `AiEngine` mock with GPT-4o-mini or Gemini Flash) | AI fallback is currently fake |
| **Background sync** (Headless JS / WorkManager) | Users shouldn't have to tap sync |
| **Pull-to-refresh with skeleton loaders** | Replace raw `ActivityIndicator` |
| **Error boundary + offline state** | App crashes if backend is unreachable |
| **`.env` config for API URL** | IP address is hardcoded in `api.ts` |

### Phase 2 — Intelligence Layer (1–2 months)
Turn raw data into insights.

| Feature | Description |
|---------|-------------|
| **Monthly budget setting** | Let users set category budgets; alert on overspend |
| **Spending charts** | Bar chart (monthly spend), donut (by category) using Victory Native or Recharts |
| **Merchant auto-correction** | If user renames a merchant once, remember it for all future SMS from that sender |
| **Duplicate detection improvement** | Hash should also consider normalized amount to catch re-sends |
| **Refund detection** | Link refund SMS to original transaction and mark status = REFUND |
| **Split transactions** | Detect transfers and ask "is this a split bill?" |
| **Net Worth tracker** | Track savings accounts alongside spending |

### Phase 3 — UX & Retention (2–3 months)

| Feature | Description |
|---------|-------------|
| **Notifications** | "You've spent 80% of your Food budget" push via Expo Notifications |
| **Weekly/Monthly report** | Beautiful PDF or in-app summary card |
| **Manual transaction entry** | For cash payments without SMS |
| **Transaction search** | Fuzzy search across merchant, body, amount |
| **Dark/Light theme toggle** | Already has Colors defined, just needs a context |
| **Widgets** | Android home screen widget showing today's spend |
| **Biometric lock** | Face ID / fingerprint to open app |
| **CSV/Google Sheets export** | Power users want spreadsheets |

### Phase 4 — Platform & Scale (3–6 months)

| Feature | Description |
|---------|-------------|
| **iOS support** | iOS has no READ_SMS; instead parse email (Gmail API) or bank app notifications |
| **UPI deep link parsing** | Parse UPI payment confirmations from notification shade |
| **Bank statement upload** | PDF upload → parse statement for users who switch phones |
| **Multi-currency** | For users who travel or have foreign accounts |
| **Family/shared accounts** | Share a budget with a partner |
| **Subscription tracker** | Auto-detect recurring charges and flag price changes |
| **Cashflow forecasting** | "Based on your history, you'll run out of budget by the 25th" |
| **Tax-ready reports** | Categorize for ITR filing (medical, HRA, etc.) |

### Phase 5 — Business Model

| Option | Notes |
|--------|-------|
| **Freemium** | Free: 3 months history, 1 account. Pro: unlimited + reports + family |
| **Bank partnerships** | Banks pay for anonymous spending analytics |
| **Financial product recommendations** | Contextual credit card / loan suggestions (SEBI-compliant) |
| **CA/accountant integrations** | Export in Tally / Zoho Books format |

---

## 🏗️ Architecture Improvements Needed

### Backend
- Add `ConfigModule` for env management instead of `process.env` direct calls
- Add `ValidationPipe` with `class-validator` DTOs for all controllers
- Add rate limiting (`@nestjs/throttler`) on the SMS sync endpoint
- Add `PrismaService` shutdown hooks for clean container exits
- Add Sentry or similar error monitoring
- Add API versioning strategy (`/api/v2/...`)
- Consider moving from BullMQ + Redis to a serverless queue (SQS, Cloud Tasks) for cost

### Mobile
- Add React Navigation with Bottom Tab navigator (Dashboard | Budget | Profile)
- Migrate from `axios` instance to React Query (`@tanstack/react-query`) for caching
- Add Zustand or Jotai for global state (user, auth token)
- Implement proper TypeScript strict mode (fix all `any` types)
- Add Sentry mobile SDK for crash reporting

---

## 🚀 Quick Start After This Patch

### Backend
```bash
cd hisaab-kitaab-backend
npx prisma migrate deploy   # applies SALARY enum migration
npm run start:dev
```

### Mobile (Dev Build for real SMS)
```bash
cd hisaab-kitaab-mobile
# Edit src/services/api.ts — set API_URL to your machine's LAN IP
npx expo run:android        # builds native Dev Build with SMS module
```

### Mobile (Expo Go for UI development only)
```bash
npx expo start
# Use Mock Data toggle in the app — real SMS will not work
```
