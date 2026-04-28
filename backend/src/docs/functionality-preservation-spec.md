# Functionality Preservation Spec

## Purpose

This document must be given together with:

- [rearchitecture-roadmap.md](</d:/Workspace/LeadgenrationApp/backend/src/docs/rearchitecture-roadmap.md:1>)
- the full current codebase

This file exists to prevent a future engineer or AI model from breaking existing product behavior while performing re-architecture.

This is a preservation document, not a bug-for-bug compatibility promise.

## Use This Document Like This

Any future engineer or AI model must follow this rule:

1. preserve all intended business flows listed here
2. preserve all user-visible panels and API surfaces listed here unless explicitly changed
3. do **not** preserve the known bugs and unsafe behaviors listed later in this document

## Preservation Priority

### P0: Must Preserve

- authentication and login flows
- role-based panel access
- lead upload, browse, purchase, and ownership flows
- wallet and subscription credit behavior
- referral hierarchy behavior
- vendor and sub-vendor approval flows
- poster generation rules
- admin CRUD surfaces for operational content
- notification side effects that users/admins rely on

### P1: Preserve Unless Requirement Explicitly Changes It

- current route paths
- response field names used by frontend
- current role names and effective-role logic
- transaction history and dashboard summaries

### P2: Can Be Improved While Preserving Outcome

- internal file structure
- SQL implementation
- queue implementation
- deployment model
- caching strategy
- socket transport implementation

## Current Role Model

The current system uses these roles:

- `admin`
- `vendor`
- `user`
- `customer`

The frontend also derives an effective role:

- `sub-vendor`

Important current rule:

- a `sub-vendor` is treated in the frontend as a `vendor` user whose `referred_by` is set
- this means backend role values and frontend route access are not perfectly identical
- any re-architecture must preserve the product behavior even if the internal representation is cleaned up

## Account Status Model

Current statuses visible in code:

- `ACTIVE`
- `PENDING`
- `REJECTED`
- `BLOCKED`

Behavior to preserve:

- `PENDING` users cannot log in
- `BLOCKED` users cannot log in
- referred registrations commonly start in `PENDING`
- organic public registrations are generally created as `ACTIVE`

## Public and Auth Functionality

### Public Endpoints and Pages

These public entry points currently exist and should remain available unless explicitly redesigned:

- login page
- register page
- forgot password page
- public contact form
- health endpoint

Current backend mounts:

- `/api/auth`
- `/api/contact`
- `/api/health`

### Registration Behavior

Current intended behavior:

- public registration allows `user` and `vendor`
- public registration must not create `admin`
- registration accepts `name` or `full_name`
- email is required
- phone is optional in public registration but used where available
- referral codes are accepted during signup

Current referral behavior to preserve:

- referral codes may carry a suffix:
  `-V` for vendor-targeted referral
  `-U` for user-targeted referral
- vendor-targeted referral cannot be used to create the wrong type of account
- when a user registers through a referral:
  the new account records `referred_by`
  a referral history row may be created for user referrals
  the parent receives a notification

Current account creation side effects to preserve:

- passwords are hashed before storage
- a referral code is generated for the new account
- vendor self-registration is also synchronized into the `vendors` table for admin visibility
- welcome email is attempted asynchronously
- welcome in-app notification is attempted asynchronously

### Login Behavior

Current intended behavior:

- login accepts identifier in the `email` field
- valid login returns a JWT token
- login response includes user summary fields used by frontend

Important response fields currently used:

- `token`
- `user.id`
- `user.email`
- `user.phone`
- `user.role`
- `user.name`
- `user.profile_pic`
- `user.status`
- `user.referred_by`

## Frontend Panel Surface

The current frontend expects these top-level panel families:

- admin panel
- vendor panel
- sub-vendor panel
- user/customer panel

### Admin Panel Pages

Current admin routes/pages include:

- dashboard
- profile
- customers CRUD
- vendors CRUD
- sub-vendors CRUD
- lead categories
- lead approval
- purchased leads
- available leads
- lead creation
- lead list
- facebook leads page
- banners
- news categories
- news CRUD
- poster categories
- posters CRUD
- contact page
- contact messages
- transactions
- subscription plans CRUD
- subscriptions CRUD
- settings
- commissions approval
- analytics
- send notifications

### Vendor Panel Pages

Current vendor routes/pages include:

- dashboard
- referrals
- refer user
- refer vendor
- earnings
- lead upload
- settings

### Sub-Vendor Panel Pages

Current sub-vendor routes/pages include:

- dashboard
- referrals
- refer user
- lead upload
- earnings
- settings

### User/Customer Panel Pages

Current user routes/pages include:

- dashboard
- available leads
- my leads
- referrals
- posters
- subscriptions
- news
- profile

## User/Customer Functionality

### Dashboard

Current dashboard behavior to preserve:

- returns wallet balance
- returns total purchased leads
- returns available leads count
- returns referral code
- returns parent linkage metadata
- returns recent purchases
- returns recent transactions
- returns poster availability summary

Important current response fields:

- `creditBalance`
- `wallet_balance`
- `totalPurchasedLeads`
- `availableLeads`
- `totalReferrals`
- `referralCode`
- `parentId`
- `parentName`
- `parentRole`
- `parentCode`
- `isReferral`
- `todaysPosters`
- `recentPurchases`
- `recentTransactions`

### Available Leads

Current intended behavior:

- authenticated user can browse leads not yet purchased by them
- endpoint supports filters:
  `city`, `state`, `pincode`, `category`
- endpoint supports pagination
- lead previews are masked
- user wallet balance is returned with the response
- active leads are shown

Current preview behavior to preserve:

- full personal details are not shown before purchase
- masked name, masked contact hints, masked city/state are returned
- credit cost is shown to the user

### Purchase Lead

Current intended behavior:

- user purchases a lead by ID
- system checks that the lead exists
- system prevents duplicate purchase for the same user and lead
- purchase deducts wallet credits
- purchase inserts a row into `lead_purchases`
- purchase creates a transaction log
- purchase triggers a wallet update realtime event after commit

Current business rule to preserve:

- lead purchase cost is currently fixed at `10` credits

### My Leads

Current intended behavior:

- after purchase, full lead details become visible
- purchased leads are listed with purchase date and status

### Profile

Current intended behavior:

- user can fetch profile data
- user can update profile data
- user profile data spans both `users` and `user_profiles`
- updates also synchronize into the `vendors` table when relevant

### Subscription Plans

Current intended behavior:

- users can fetch active subscription plans
- response includes compatibility fields expected by frontend

Compatibility fields to preserve:

- `lead_limit`
- `validity_days`

### Referral Stats

Current intended behavior:

- user can fetch their referral code
- user can see referral history
- total referrals and total rewards are returned
- referral code is generated if missing

### News and Banners

Current intended behavior:

- users can fetch published news
- users can fetch active banners
- user can record banner interaction

### Posters

Current intended behavior:

- users can list generated posters
- users can fetch shared poster templates
- users can generate a poster from a template

Current poster business rules to preserve:

- user gets `1` free poster per day if no poster plan is active
- additional poster costs `5` credits when free daily quota is exhausted
- poster-specific or combined subscription can bypass daily free-limit logic
- subscription-based poster usage may decrement `used_posters`
- generated poster stores layout/config data derived from template and user input
- poster generation supports optional uploaded `logo` and `image`

Current poster response semantics to preserve:

- `freePosterAvailable`
- `hasPosterPlan`

### Subscription Purchase

Current intended behavior:

- user can activate a subscription plan directly
- wallet credits from the plan are added
- subscription row is created
- transaction log is created
- referral commission processing may run
- wallet update realtime event is emitted after commit

### Lead Feedback

Current intended behavior:

- user can submit rating and optional comment for a purchased/known lead
- feedback links user, lead, and vendor

## Vendor Functionality

### Vendor Dashboard Stats

Current vendor stats behavior to preserve:

- total referred users
- total referred vendors
- total completed earnings
- pending earnings
- active requested settlement amount
- referral code
- wallet balance
- parent vendor/user metadata

### Vendor Referrals

Current intended behavior:

- vendor can list referrals with pagination
- list includes status, role, create date, recent activity, and revenue hints

### Vendor Earnings

Current intended behavior:

- vendor can list commission transactions ordered by latest first

### Vendor Refer User

Current intended behavior:

- vendor can directly create a referred `user`
- user is created under `referred_by = vendorId`
- optional location info is synchronized into `user_profiles`

### Vendor Refer Vendor

Current intended behavior:

- only primary vendors can refer another vendor
- sub-vendors must not create third-tier vendors
- referred vendor is created in both `users` and `vendors`
- hierarchy is synchronized with the `vendors` registry table
- optional location info is synchronized into `user_profiles`
- admin-facing realtime signal is emitted when a new vendor referral is created

### Vendor Settlement Request

Current intended behavior:

- vendor can request payout for pending commissions
- all `PENDING` commission transactions are moved to `REQUESTED`
- admins receive realtime notification

### Vendor Approval of Referred Vendors

Current intended behavior:

- vendor can approve or reject pending referred vendors
- approval updates user status
- approved vendor may be synchronized to `vendors` registry

## Sub-Vendor Functionality

### Sub-Vendor Dashboard

Current intended behavior:

- total referred users
- wallet balance
- total leads injected
- own referral code
- parent metadata

### Sub-Vendor Referrals

Current intended behavior:

- sub-vendor can list only referred users
- list is paginated

### Sub-Vendor Earnings

Current intended behavior:

- sub-vendor can view transaction history relevant to their earnings

### Sub-Vendor Settlement

Current intended behavior:

- sub-vendor can request payout on pending commissions
- admins receive realtime notification

### Sub-Vendor Approval of User Referrals

Current intended behavior:

- sub-vendor can approve or reject referred users
- only referred `user` accounts are covered by this flow

## Lead Management Functionality

### Lead Creation

Current intended behavior:

- admins and vendors/sub-vendors can upload leads
- admin-uploaded leads become `ACTIVE` immediately
- vendor/sub-vendor-uploaded leads become `PENDING`
- empty `lead_value` and empty `expiry_date` are normalized

Current side effects to preserve:

- active lead may trigger user-facing broadcast/new lead notification
- vendor-submitted lead may trigger admin-facing approval notification

### Lead Listing

Current intended behavior:

- admin can list leads with pagination and search
- admin can list pending leads separately
- admin can fetch a single lead by ID
- admin can remove a lead

### Lead Approval

Current intended behavior:

- admin can mark a lead active or rejected
- on approval, creator may receive a direct notification
- on approval, users may receive a general new-lead notification

### Lead Assignment and Match Suggestions

The admin route surface currently includes:

- available leads listing for admin
- assign leads
- suggest best match

These features must not disappear during re-architecture even if internally redesigned.

## Admin Operational Functionality

### User Administration

Current intended behavior:

- list users
- block/unblock users
- adjust wallet balances
- inspect referral tree
- update admin profile
- upload admin profile photo
- update vendor commission rate
- review commission records
- approve commission
- reject commission

### Lead Administration

Current intended behavior:

- CRUD leads
- view purchased leads
- approve pending leads
- suggest lead matches
- assign leads

### Category Administration

Current intended behavior:

- CRUD lead categories
- CRUD news categories
- CRUD poster categories

### Content Administration

Current intended behavior:

- CRUD news
- CRUD posters/templates
- CRUD banners

### Customer, Vendor, and Sub-Vendor Administration

Current intended behavior:

- CRUD customers
- CRUD vendors
- CRUD sub-vendors
- vendor stats lookup
- vendor status management

### Contact Message Administration

Current intended behavior:

- list contact messages
- update contact message status
- delete contact message

### Subscription and Package Administration

Current intended behavior:

- CRUD packages
- CRUD subscription plans
- CRUD subscriptions

### Transaction Administration

Current intended behavior:

- list transactions
- view transaction by ID
- create transaction manually

### Settings and Stats

Current intended behavior:

- fetch dashboard stats
- fetch all settings
- fetch setting by key
- update settings

### Broadcasts and Notifications

Current intended behavior:

- create broadcast campaigns
- fetch campaign status
- send targeted notifications to all, by role, or by specific IDs

### Analytics and Reports

Current intended behavior:

- granular analytics endpoint
- lead reports endpoint
- export leads/reports endpoint
- banner interaction recording

### Maintenance

Current intended behavior:

- admin can trigger maintenance tasks manually

## Public Contact Functionality

Current intended behavior:

- public contact form exists at `/api/contact`
- it is rate-limited
- admin-side contact message management exists

## Realtime and Notification Behavior

The following user-visible outcomes should be preserved even if the transport changes:

- wallet balance updates can arrive in realtime after purchases/subscription actions
- admins can receive realtime notifications for settlement requests
- admins can receive lead approval/review signals
- users can receive welcome or lead-availability notifications
- vendor referral activity can trigger admin-facing signal

Preserve outcome, not necessarily current implementation.

## Current Route Inventory to Preserve

This is the current public API surface shape.

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### User

- `GET /api/user/dashboard-stats`
- `GET /api/user/available-leads`
- `POST /api/user/purchase-lead/:id`
- `POST /api/user/purchase-subscription/:id`
- `POST /api/user/subscription/create-order`
- `POST /api/user/subscription/verify-payment`
- `GET /api/user/my-leads`
- `GET /api/user/referral-stats`
- `GET /api/user/subscription-plans`
- `GET /api/user/posters`
- `GET /api/user/poster-templates`
- `POST /api/user/generate-poster`
- `POST /api/user/lead-feedback`
- `POST /api/user/banners/:id/interaction`
- `GET /api/user/news`
- `GET /api/user/banners`
- `GET /api/user/profile`
- `PUT /api/user/profile`

### Vendor

- `GET /api/vendor/stats`
- `GET /api/vendor/referrals`
- `GET /api/vendor/earnings`
- `GET /api/vendor/sub-vendor-requests`
- `POST /api/vendor/approve-sub-vendor/:subVendorId`
- `POST /api/vendor/refer-user`
- `POST /api/vendor/refer-vendor`
- `POST /api/vendor/leads`
- `POST /api/vendor/request-settlement`

### Sub-Vendor

- `GET /api/sub-vendor/stats`
- `GET /api/sub-vendor/referrals`
- `GET /api/sub-vendor/earnings`
- `POST /api/sub-vendor/request-settlement`
- `POST /api/sub-vendor/approve-referral/:referralId`
- `POST /api/sub-vendor/leads`

### Admin

- preserve the `/api/admin/*` surface currently defined in `src/routes/adminRoutes.js`
- if refactored, either keep paths or provide compatibility layer/versioning

## Response Compatibility Rules

Unless a versioned API migration is introduced, preserve:

- top-level `success` field
- existing message patterns where frontend depends on them
- current key response field names already consumed by frontend
- pagination object shape where already present

## File Upload Compatibility Rules

These upload contracts should be preserved:

- profile/admin photo upload still accepts `file`
- poster generation upload accepts `logo` and `image`
- news create/edit accepts `image`
- poster management create/edit accepts `thumbnail`

## Data Synchronization Rules

These cross-table effects are currently part of product behavior and should not silently disappear:

- vendor-facing identities often exist in both `users` and `vendors`
- user profile data may live in `user_profiles`
- referral approvals affect account status
- subscription actions affect wallet balance and transaction history
- poster generation may affect subscription usage and wallet balance

## What Must Not Be Preserved

These are current issues or unsafe behaviors. Future work should explicitly remove them, not preserve them.

- public diagnostic endpoint exposing vendor/user data
- validation allowing public `admin` registration
- JWT signing fallback secret
- over-aggressive PM2 `instances: "max"` assumptions
- in-memory-only realtime assumptions
- local-process-only socket broadcast as a scale strategy
- synchronous heavy exports in request cycle
- loading very large user sets directly into memory for bulk notifications
- query anti-patterns that do not scale
- duplicate or redundant SQL queries

## Change Control Rules for Future AI Models

Before changing any endpoint or behavior listed here, the implementing model must do one of these:

- preserve current outward behavior exactly
- add a compatibility adapter
- introduce explicit API versioning
- document and approve the breaking change

## Minimum Handoff Package for Safe Re-Architecture

Do not hand off only the roadmap.

For safe implementation, provide the next AI model:

- [rearchitecture-roadmap.md](</d:/Workspace/LeadgenrationApp/backend/src/docs/rearchitecture-roadmap.md:1>)
- this preservation spec
- the full repository
- DB schema and migrations
- any current environment variable template
- current frontend, because it defines practical response compatibility

## Final Rule

If there is a conflict between "better architecture" and "existing product behavior", default to preserving user-visible product behavior first, then improve architecture behind a compatibility layer.
