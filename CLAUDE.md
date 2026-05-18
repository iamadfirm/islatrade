# Hecate33

Laravel 12 + React 19 SPA + Tailwind v4 + MySQL. Mobile-first wallet app.
Features: Wallet, Deposit (manual + admin approval), Withdraw (KYC + admin
approval), wallet-to-wallet Transfer, and Partnership (investment packages
with scheduled interest payouts).

## Stack

- Laravel 12, PHP 8.2+, MySQL 8 (or MariaDB)
- Sanctum cookie SPA auth (`statefulApi()`)
- Spatie Permission (roles: `user`, `admin`)
- React 19 + React Router v7, Vite 7, Axios, Zustand, TanStack Query v5
- Tailwind v4 (CSS-only `@theme` config)

## Setup

```bash
# 1. Database
mysql -u root -e "CREATE DATABASE hecate33 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Backend
composer install
cp .env.example .env  # set DB_USERNAME / DB_PASSWORD
php artisan key:generate
php artisan migrate --seed   # seeds RoleSeeder, AdminSeeder, InvestmentPackageSeeder
php artisan storage:link

# 3. Frontend
npm install
npm run build       # production
# or
npm run dev         # dev (vite + hot reload)

# 4. Run
php artisan serve   # http://localhost:8000
```

Default admin: phone `09000000000`, password `password`.

## Architecture

### Wallet ledger (single source of truth)
`App\Services\WalletService::credit()` / `debit()` — atomic, writes
immutable `wallet_transactions` rows with `balance_before`/`balance_after`.
Balance is `last balance_after`. Polymorphic `reference` column links each
ledger row back to its `Deposit`, `Withdrawal`, `Transfer`, or `Investment`.
**Never** mutate `users.wallet_balance` directly — always go through the
service.

### Investment payouts
`App\Services\InvestmentService::processPayouts()` is invoked hourly by the
`partnership:process-payouts` artisan command (see `routes/console.php`).
Each Active investment with `next_payout_at <= now` gets:
- Interest credited to wallet (rate × principal)
- `next_payout_at` advanced by `frequency.intervalDays`
- At maturity: principal returned, status flips to `Matured`

To process scheduling locally, run:
`* * * * * cd /path && php artisan schedule:run >> /dev/null 2>&1`

### API
- All routes under `/api/v1`
- Public: `auth/register`, `auth/login`
- Authenticated: wallet/*, deposits, withdrawals (POST gated by `kyc.approved`), kyc, partnerships/*
- Admin: `admin/*` gated by `role:admin`

### Frontend
- SPA mounted at every web route (catch-all in `routes/web.php`) via `resources/views/app.blade.php`
- `resources/js/app.jsx` → `App.jsx` → React Router
- Auth bootstrap: `useAuth.hydrate()` calls `/auth/me` on mount
- Axios client (`lib/api.js`) auto-fetches CSRF cookie before mutations and redirects to `/login` on 401
- Mobile-first layouts: `AppLayout` (user) + `AdminLayout` with bottom tab nav, `max-w-md` shell

### Enums (App\Enums\)
Serialized as `{ value, label, color }` in API responses — `<StatusBadge>`
component renders the color directly.

## Notable decisions

- Admin panel is part of the same SPA (role-gated routes), no separate Filament install.
- Login identifier is **phone** (not email).
- Currency is PHP (₱); minimum withdrawal ₱100, minimum deposit ₱50.
- Proof images stored locally in `storage/app/public/{deposits,kyc}` (no GCS).
- Withdrawals debit the wallet at admin-approval time (not at request).
- KYC approval lives on `users.kyc_status`; failed reviews flip user status to `rejected` (resubmittable).
