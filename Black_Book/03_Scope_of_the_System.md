# CHAPTER 3: SCOPE OF THE SYSTEM

---

## 3.1 Functional Scope (In-Scope Modules)
The functional scope of LabEase encompasses five interconnected modules designed to handle the complete diagnostic service lifecycle:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LABEASE FUNCTIONAL SCOPE                          │
│                                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌───────────────────┐  │
│  │   PATIENT MODULE     │  │   LAB PARTNER MODULE │  │ PHLEBOTOMIST APP  │  │
│  │ • Distance Search    │  │ • Storefront Profile │  │ • Duty Toggle     │  │
│  │ • Cart & Checkout    │  │ • Test & Bundle CRUD │  │ • Task Queue      │  │
│  │ • Slot Scheduling    │  │ • Phlebo Assignment  │  │ • GPS Streaming   │  │
│  │ • Family Profiles    │  │ • Order Lifecycle    │  │ • OTP Input       │  │
│  │ • Live GPS Tracking  │  │ • Report Upload PDF  │  │ • Lab Handover    │  │
│  │ • Health Vault       │  │ • Revenue Analytics  │  │ • Task Summary    │  │
│  └──────────────────────┘  └──────────────────────┘  └───────────────────┘  │
│             │                         │                        │            │
│             └─────────────────────────┼────────────────────────┘            │
│                                       │                                     │
│                         ┌─────────────▼─────────────┐                       │
│                         │    ADMIN & BACKEND MODULE │                       │
│                         │ • Lab Verification Audit  │                       │
│                         │ • Commission Management   │                       │
│                         │ • Express REST Controllers│                       │
│                         │ • Socket.IO GPS Engine    │                       │
│                         │ • Supabase Storage & RLS  │                       │
│                         └───────────────────────────┘                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Module 1: Patient Portal (`src/patient/`)
* **Location-Based Discovery & Search:**
  * Geolocation auto-detection or manual location picker.
  * Radial distance filtering (e.g., 5km, 10km, 25km).
  * Category filtering (Blood Tests, Diabetes, Cardiac, Thyroid, Radiology).
  * Multi-attribute sorting (Distance, Price, Turnaround Time, Ratings).
  * Accreditation badge verification filter (NABL certified).
* **Cart & Booking Engine:**
  * Dynamic cart managing individual tests and package bundles.
  * Selection of home sample collection vs. walk-in appointment.
  * Date picker and dynamic time-slot selector.
  * Address management (Home, Work, Other) with GPS latitude/longitude.
  * Sub-profile selection for family members (Name, Age, Gender, Relation).
  * Promo code discount engine.
* **Real-Time GPS Tracking Dashboard:**
  * Interactive map powered by real-time Socket.IO location updates.
  * Visual progress tracker bar: `Booked` → `Confirmed` → `Assigned` → `En Route` → `Arrived` → `Sample Collected` → `Processing` → `Report Uploaded`.
  * Display of assigned phlebotomist details (Photo, Name, Phone).
  * Display of unique 4-digit security OTP.
* **Health Records Vault:**
  * Digital archive of all completed test bookings.
  * Instant PDF report viewer and local device download.
  * Shareable public URL generation with configurable expiry timer.

### Module 2: Lab Partner Portal (`src/lab/`)
* **Storefront & Accreditation Setup:**
  * Lab profile management (Name, Logo, Gallery, Description, Working Hours).
  * Upload of NABL certification documents for admin approval.
  * Service radius setting (in kilometers) and primary address configuration.
* **Test & Package Catalog Management:**
  * Full CRUD interface for individual diagnostic tests (Code, Name, Category, Sample Type, Fasting Instructions, Turnaround Time, Price).
  * Package bundling tool (combine multiple tests into discounted health packages).
  * Active/Inactive visibility toggle per test item.
* **Order Fulfillment & Dispatch:**
  * Real-time incoming order dashboard with Accept / Reject capability.
  * Phlebotomist roster management and assignment modal.
  * Live status transitions from order confirmation to lab sample processing.
* **Report Dispatch Center:**
  * Multi-file PDF report upload direct to cloud storage (`test-reports` bucket).
  * Automated notification trigger updating patient booking status to `Report Ready`.
* **Revenue & Payout Analytics:**
  * Daily, weekly, and monthly Gross Merchandise Value (GMV) tracking.
  * Platform commission breakdown vs. net lab earnings.
  * Historical payout settlement log.

### Module 3: Phlebotomist Portal (`src/phlebotomist/`)
* **Duty Status & Task Queue:**
  * Online / Offline duty toggle button.
  * Real-time list of assigned sample collection orders sorted by time-slot.
  * Customer details, address, sample requirements, and fasting status preview.
* **Live GPS Navigation & Sample Collection Workflow:**
  * Real-time device GPS streaming to backend server via Socket.IO.
  * One-click navigation link (Google Maps integration).
  * Status updater: `Start Journey` (En Route) → `Mark Arrived`.
  * Mandatory 4-digit patient OTP verification dialog.
  * Sample collection confirmation and photo attachment upload.
* **Lab Handover Verification:**
  * Verification protocol for sample transport to laboratory facility.
  * Final status update transferring sample custody to lab processing staff.

### Module 4: Platform Admin Panel (`src/admin/`)
* **Partner Onboarding Pipeline:**
  * Verification workflow to review pending lab applications and NABL documents.
  * Approval or rejection with audit feedback comments.
* **Global Order & System Monitor:**
  * Overview of active platform bookings, phlebotomist assignments, and stuck orders.
  * Override capabilities for dispute resolution and order cancellation.
* **Financial Management:**
  * Commission rate configuration (default 15.00% or lab-specific custom rate).
  * Periodic payout calculation and settlement confirmation.

### Module 5: Backend API & WebSocket Engine (`server/`)
* **REST API Endpoints:** 12 modular route controllers managing Auth, Users, Labs, Catalog, Bookings, Phlebo, Admin, and Revenue.
* **Socket.IO Real-Time Gateway:** Manages WebSocket connections for phlebotomist GPS broadcasting (`location_update`) and patient subscriber rooms (`subscribe_booking`).
* **Supabase PostgreSQL & Cloud Infrastructure:** Database schema, index optimizations, RLS security policies, and PDF storage buckets.

---

## 3.2 Non-Functional Scope

| Requirement Category | Non-Functional Specification |
|---|---|
| **Performance** | API response latency < 200ms for REST endpoints. Real-time GPS location WebSocket latency < 1 second. Page load time < 1.5 seconds. |
| **Security & Privacy** | Supabase Row-Level Security (RLS) enforcing multi-tenant isolation. 4-digit OTP identity validation. TLS 1.3 encryption in transit and AES-256 for cloud PDF storage. |
| **Scalability** | Stateless Node.js Express backend server capable of horizontal scaling. Supabase PostgreSQL indexing optimized for radial geolocation queries. |
| **Reliability & Availability** | 99.9% uptime target. Fallback polling for location tracking in case of transient WebSocket disconnection. |
| **Usability & Responsiveness**| Touch-friendly, modern glassmorphic responsive UI tailored for mobile, tablet, and desktop viewports. Accessible color contrast ratios. |

---

## 3.3 Out-of-Scope Elements (Current Phase vs Future Roadmap)

### Out-of-Scope for Current Version:
1. **AI Prescription OCR Reader:** Automated optical character recognition to extract test names directly from handwritten doctor prescriptions.
2. **HL7 / FHIR Direct LIS Integration:** Deep bi-directional database synchronization with proprietary Lab Information Systems (LIS) like LabTracker or WinPath.
3. **Native iOS & Android Binary Builds:** Current application is delivered as a Progressive Responsive Web Application (SPA); native Swift/Kotlin app store packages are out-of-scope.
4. **Online Video Doctor Consultation:** Integrated Telehealth video room engine for post-report consultation.
5. **IoT Temperature Box Telemetry:** Hardware sensor integration inside phlebotomist sample carrier boxes to monitor real-time transport temperature.

---

## 3.4 User Personas & Responsibility Matrix

| User Persona | Key Goals | Platform Access Point | Responsibilities |
|---|---|---|---|
| **Ramesh (Patient)** | Find affordable thyroid test nearby; track phlebotomist arrival accurately. | Patient Web Portal (`/patient`) | Book test, select time slot, provide location, share OTP with agent, access digital report. |
| **Dr. Sunita (Lab Director)** | Increase lab sample volume, digitize report delivery, automate phlebotomist dispatch. | Lab Partner Portal (`/lab`) | Keep catalog updated, verify order requests, assign phlebotomists, upload PDF reports. |
| **Vikram (Phlebotomist)** | Clear route plan, simple sample confirmation, instant duty toggle. | Phlebotomist App (`/phlebotomist`)| Turn on duty, navigate to patient, collect sample, verify 4-digit OTP, deliver sample to lab. |
| **Anil (Platform Admin)** | Audit partner labs, monitor system transactions, process payouts seamlessly. | Admin Panel (`/admin`) | Review NABL certificates, approve labs, configure commission splits, resolve disputes. |
