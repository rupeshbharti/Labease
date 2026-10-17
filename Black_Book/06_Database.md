# CHAPTER 6: DATABASE DESIGN

---

## 6.1 Entity-Relationship (ER) Diagram
The LabEase relational database is constructed on Supabase (PostgreSQL), utilizing UUID primary keys, explicit foreign key constraints, enumerated types, performance indexes, and Row-Level Security (RLS) policies.

```
┌───────────────┐          ┌───────────────────┐          ┌─────────────────┐
│     USERS     │1        *│   FAMILY_MEMBERS  │          │    ADDRESSES    │
│ (auth.users)  ├─────────►│ patient_user_id   │          │  user_id (FK)   │
└───────┬───────┘          └───────────────────┘          └────────┬────────┘
        │1                                                         │1
        │                                                          │
        │1 (owner)                                                 │*
┌───────▼───────┐1        *┌───────────────────┐          ┌────────▼────────┐
│  LAB_PARTNERS ├─────────►│       TESTS       │          │    BOOKINGS     │
│   id (PK)     │          │    lab_id (FK)    │          │ patient_user_id │
└───────┬───────┘          └─────────┬─────────┘          │ lab_id (FK)     │
        │1                           │*                   │ address_id (FK) │
        │                            │                    └────────┬────────┘
        │1                           │ (via package_tests)         │1
        │*                           │*                            │
┌───────▼───────┐          ┌─────────▼─────────┐          ┌────────▼────────┐
│    PAYOUTS    │          │     PACKAGES      │          │  BOOKING_ITEMS  │
│  lab_id (FK)  │          │    lab_id (FK)    │          │ booking_id (FK) │
└───────────────┘          └───────────────────┘          └─────────────────┘
                                                                   │
                                                                   │
                           ┌───────────────────┐                   │1
                           │ PHLEBO_ASSIGNMENTS│*                  │
                           │  booking_id (FK)  │◄──────────────────┤
                           │ phlebo_user_id(FK)│                   │
                           └───────────────────┘                   │*
                                                              ┌────▼────────┐
                                                              │   REPORTS   │
                                                              │ booking_id  │
                                                              └─────────────┘
```

---

## 6.2 Custom Enumerated Types (ENUMs)

```sql
CREATE TYPE user_role AS ENUM ('patient', 'lab_staff', 'phlebotomist', 'platform_admin');
CREATE TYPE lab_status AS ENUM ('pending_review', 'verified', 'live', 'suspended');
CREATE TYPE booking_status AS ENUM (
  'pending_lab_acceptance', 'confirmed', 'phlebotomist_assigned',
  'en_route', 'arrived', 'sample_collected', 'sample_received_at_lab',
  'processing', 'report_ready', 'cancelled', 'failed'
);
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'cash_on_collection', 'refunded');
CREATE TYPE collection_mode AS ENUM ('home_collection', 'walk_in');
CREATE TYPE assignment_status AS ENUM ('assigned', 'accepted', 'declined', 'en_route', 'arrived', 'collected', 'failed');
CREATE TYPE payout_status AS ENUM ('scheduled', 'processing', 'paid', 'failed');
```

---

## 6.3 Data Dictionary / Schema Specifications

### Table 1: `users`
Extends Supabase `auth.users` table with application profile attributes.
* **Primary Key:** `id` (UUID, references `auth.users.id` ON DELETE CASCADE)

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, FK `auth.users(id)` | Unique user identifier |
| `role` | `user_role` | NOT NULL, DEFAULT 'patient' | System role |
| `name` | TEXT | Nullable | Full name of user |
| `email` | TEXT | Nullable | Primary email address |
| `phone` | TEXT | Nullable | Contact phone number |
| `phone_verified` | BOOLEAN | DEFAULT FALSE | Phone validation status |
| `avatar_url` | TEXT | Nullable | User profile picture URL |
| `duty_status` | BOOLEAN | DEFAULT FALSE | Phlebotomist online status |
| `referral_code` | VARCHAR(15) | UNIQUE, Nullable | User referral code |
| `referred_by_id` | UUID | FK `users(id)`, Nullable | Referring user |
| `created_at` | TIMESTAMPTZ| DEFAULT NOW() | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ| DEFAULT NOW() | Last update timestamp |

---

### Table 2: `lab_partners`
Stores registered diagnostic laboratory partner details and configuration.
* **Primary Key:** `id` (UUID, DEFAULT `uuid_generate_v4()`)

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Unique laboratory identifier |
| `owner_user_id` | UUID | NOT NULL, FK `users(id)` | Account owner user ID |
| `name` | TEXT | NOT NULL | Official lab business name |
| `slug` | TEXT | UNIQUE, Nullable | URL-friendly name slug |
| `description` | TEXT | Nullable | Laboratory summary |
| `logo_url` | TEXT | Nullable | Storefront logo image URL |
| `photos` | TEXT[] | DEFAULT '{}' | Lab facility photos array |
| `status` | `lab_status`| NOT NULL, DEFAULT 'pending_review'| Audit verification status |
| `address` | TEXT | Nullable | Street address |
| `city` | TEXT | Nullable | City location |
| `state` | TEXT | Nullable | State location |
| `pincode` | TEXT | Nullable | Postal code |
| `lat` | DOUBLE PRECISION | Nullable | Latitude coordinate |
| `lng` | DOUBLE PRECISION | Nullable | Longitude coordinate |
| `service_radius_km`| DOUBLE PRECISION | DEFAULT 10 | Coverage radius in km |
| `nabl_certificate_url`| TEXT | Nullable | NABL accreditation document URL |
| `bank_account_id` | TEXT | Nullable | Bank payout account ID |
| `commission_rate` | DECIMAL(5,2)| DEFAULT 15.00 | Platform commission rate (%) |
| `rating_avg` | DECIMAL(3,2)| DEFAULT 0 | Average patient review score |
| `rating_count` | INTEGER | DEFAULT 0 | Total reviews count |
| `working_hours` | JSONB | Nullable | Weekly operational schedule |
| `created_at` | TIMESTAMPTZ| DEFAULT NOW() | Record creation timestamp |

---

### Table 3: `family_members`
Stores sub-profiles of family members linked to patient accounts.
* **Primary Key:** `id` (UUID)

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Unique family member ID |
| `patient_user_id`| UUID | NOT NULL, FK `users(id)` | Parent patient user ID |
| `name` | TEXT | NOT NULL | Member full name |
| `dob` | DATE | Nullable | Date of birth |
| `gender` | TEXT | Nullable | Male / Female / Other |
| `relation` | TEXT | Nullable | Spouse, Child, Parent, etc. |
| `created_at` | TIMESTAMPTZ| DEFAULT NOW() | Record creation timestamp |

---

### Table 4: `addresses`
Stores patient home/work locations with GPS coordinates.
* **Primary Key:** `id` (UUID)

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Unique address ID |
| `user_id` | UUID | NOT NULL, FK `users(id)` | Address owner user ID |
| `label` | TEXT | DEFAULT 'Home' | Address label (Home/Work/etc.)|
| `full_address` | TEXT | NOT NULL | Complete formatted address |
| `lat` | DOUBLE PRECISION | Nullable | Latitude coordinate |
| `lng` | DOUBLE PRECISION | Nullable | Longitude coordinate |
| `is_default` | BOOLEAN | DEFAULT FALSE | Default address flag |
| `created_at` | TIMESTAMPTZ| DEFAULT NOW() | Record creation timestamp |

---

### Table 5: `tests`
Individual diagnostic tests offered by laboratory partners.
* **Primary Key:** `id` (UUID)

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Unique test ID |
| `lab_id` | UUID | NOT NULL, FK `lab_partners(id)` | Offering laboratory ID |
| `code` | TEXT | Nullable | Internal lab test code |
| `name` | TEXT | NOT NULL | Diagnostic test title |
| `description` | TEXT | Nullable | Test clinical overview |
| `sample_type` | TEXT | Nullable | Blood, Urine, Saliva, etc. |
| `preparation_instructions`| TEXT | Nullable | Fasting guidelines |
| `turnaround_hours`| INTEGER | Nullable | Expected turnaround in hours |
| `price` | DECIMAL(10,2)| NOT NULL | Test price (INR) |
| `category` | TEXT | Nullable | Test category |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active search status |
| `created_at` | TIMESTAMPTZ| DEFAULT NOW() | Record creation timestamp |

---

### Table 6: `packages` & Table 7: `package_tests`
Multi-test health checkup bundles and join relationships.
* **`packages` PK:** `id` (UUID)
* **`package_tests` Composite PK:** (`package_id`, `test_id`)

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `packages.id` | UUID | PK | Unique package ID |
| `packages.lab_id` | UUID | NOT NULL, FK `lab_partners(id)` | Laboratory partner ID |
| `packages.name` | TEXT | NOT NULL | Package title |
| `packages.price` | DECIMAL(10,2)| NOT NULL | Bundle price (INR) |
| `package_tests.package_id`| UUID | PK, FK `packages(id)` | Target package |
| `package_tests.test_id` | UUID | PK, FK `tests(id)` | Bundled test |

---

### Table 8: `bookings`
Central transaction table tracking order fulfillment lifecycle.
* **Primary Key:** `id` (UUID)

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Unique booking ID |
| `booking_number` | TEXT | UNIQUE, NOT NULL | Human-readable tracking code |
| `patient_user_id`| UUID | NOT NULL, FK `users(id)` | Patient user ID |
| `family_member_id`| UUID | FK `family_members(id)` | Patient sub-profile ID |
| `lab_id` | UUID | NOT NULL, FK `lab_partners(id)` | Assigned lab ID |
| `collection_mode`| `collection_mode`| DEFAULT 'home_collection'| Home collection or walk-in |
| `address_id` | UUID | FK `addresses(id)` | Target collection address |
| `slot_datetime` | TIMESTAMPTZ| Nullable | Scheduled appointment time |
| `status` | `booking_status`| DEFAULT 'pending_lab_acceptance'| Order fulfillment status |
| `payment_status` | `payment_status`| DEFAULT 'pending' | Payment settlement status |
| `total_amount` | DECIMAL(10,2)| NOT NULL | Gross order total |
| `platform_commission`| DECIMAL(10,2)| DEFAULT 0 | Platform fee amount |
| `lab_payout_amount` | DECIMAL(10,2)| DEFAULT 0 | Net lab payout |
| `otp_code` | VARCHAR(4) | Nullable | 4-Digit patient verification OTP |
| `created_at` | TIMESTAMPTZ| DEFAULT NOW() | Booking timestamp |

---

### Table 9: `booking_items`
Line items (tests and packages) included within a booking.
* **Primary Key:** `id` (UUID)

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Unique line item ID |
| `booking_id` | UUID | NOT NULL, FK `bookings(id)` | Parent booking ID |
| `test_id` | UUID | FK `tests(id)`, Nullable | Included test ID |
| `package_id` | UUID | FK `packages(id)`, Nullable | Included package ID |
| `price_at_booking`| DECIMAL(10,2)| NOT NULL | Historical item price |

---

### Table 10: `phlebotomist_assignments`
Tracks sample collection dispatch to field agents.
* **Primary Key:** `id` (UUID)

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Unique assignment ID |
| `booking_id` | UUID | NOT NULL, FK `bookings(id)` | Target booking ID |
| `phlebotomist_user_id`| UUID | NOT NULL, FK `users(id)` | Assigned agent user ID |
| `status` | `assignment_status`| DEFAULT 'assigned' | Assignment progress state |
| `patient_otp_confirmed`| BOOLEAN| DEFAULT FALSE | OTP validation flag |
| `assigned_at` | TIMESTAMPTZ| DEFAULT NOW() | Dispatch timestamp |
| `collected_at` | TIMESTAMPTZ| Nullable | Collection timestamp |

---

### Table 11: `phlebotomist_locations`
Time-series log of live phlebotomist GPS coordinates.
* **Primary Key:** `id` (UUID)

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Unique log entry ID |
| `phlebotomist_user_id`| UUID | NOT NULL, FK `users(id)` | Agent user ID |
| `lat` | DOUBLE PRECISION | NOT NULL | Latitude coordinate |
| `lng` | DOUBLE PRECISION | NOT NULL | Longitude coordinate |
| `is_online` | BOOLEAN | DEFAULT FALSE | Duty status at point |
| `recorded_at` | TIMESTAMPTZ| DEFAULT NOW() | Timestamp |

---

### Table 12: `reports`
Diagnostic report PDF files uploaded by laboratories.
* **Primary Key:** `id` (UUID)

| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Unique report ID |
| `booking_id` | UUID | NOT NULL, FK `bookings(id)` | Linked booking ID |
| `uploaded_by_user_id`| UUID | NOT NULL, FK `users(id)` | Lab staff uploader ID |
| `file_url` | TEXT | NOT NULL | Cloud storage PDF URL |
| `share_token` | UUID | UNIQUE, DEFAULT uuid_generate_v4()| Shareable public token |
| `share_expires_at`| TIMESTAMPTZ| Nullable | Token expiration date |
| `uploaded_at` | TIMESTAMPTZ| DEFAULT NOW() | Upload timestamp |

---

### Table 13: `reviews` & Table 14: `payouts`
Ratings/reviews and financial payout ledger entries.
* **`reviews` PK:** `id` (UUID) — links `booking_id`, `lab_rating` (1–5), `lab_review_text`, `lab_response_text`.
* **`payouts` PK:** `id` (UUID) — links `lab_id`, `period_start`, `period_end`, `gross_amount`, `commission_deducted`, `net_payout`, `status`.

---

## 6.4 Security Policies (Row-Level Security - RLS)
Supabase Row-Level Security (RLS) is explicitly enabled across all database tables to enforce strict data isolation:
* **Patients:** Can view and insert only their own user record, addresses, family members, bookings, and associated reports.
* **Lab Partners:** Can view and manage tests, packages, and bookings associated strictly with their verified `lab_id`.
* **Phlebotomists:** Can view assignment tasks and update locations for orders where `phlebotomist_user_id = auth.uid()`.
* **Platform Admin:** Granted full system-wide read/write bypass access via administrative context.
