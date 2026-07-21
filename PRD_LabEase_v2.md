# Product Requirements Document (PRD)
## LabEase — Diagnostic Lab Platform
### *"The Zomato for Diagnostic Tests"*

**Version:** 2.0
**Status:** Draft
**Date:** March 26, 2026
**Owner:** Product Team
**Stakeholders:** Engineering, Design, Operations, Lab Partners, Finance

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Philosophy — The Zomato Model](#2-product-philosophy--the-zomato-model)
3. [Problem Statement](#3-problem-statement)
4. [Goals & Success Metrics](#4-goals--success-metrics)
5. [User Personas](#5-user-personas)
6. [Ecosystem Overview](#6-ecosystem-overview)
7. [App 1 — Patient App (Zomato Main App)](#7-app-1--patient-app)
8. [App 2 — Lab Partner App (Restaurant App)](#8-app-2--lab-partner-app)
9. [App 3 — Phlebotomist App (Delivery Boy App)](#9-app-3--phlebotomist-app)
10. [Platform Admin Panel](#10-platform-admin-panel)
11. [Non-Functional Requirements](#11-non-functional-requirements)
12. [User Stories & Acceptance Criteria](#12-user-stories--acceptance-criteria)
13. [User Flows & Information Architecture](#13-user-flows--information-architecture)
14. [Technical Architecture](#14-technical-architecture)
15. [Data Models](#15-data-models)
16. [Real-Time & Live Tracking Architecture](#16-real-time--live-tracking-architecture)
17. [Security & Compliance](#17-security--compliance)
18. [Integrations](#18-integrations)
19. [Release Milestones](#19-release-milestones)
20. [Risks & Mitigations](#20-risks--mitigations)
21. [Open Questions](#21-open-questions)
22. [Appendix](#22-appendix)

---

## 1. Executive Summary

**LabEase** is a three-sided marketplace platform for diagnostic healthcare, modeled structurally on Zomato's ecosystem. It connects **Patients** who need diagnostic tests, **Diagnostic Labs** that fulfill those tests, and **Phlebotomists** who perform home sample collections — all within a single, real-time, location-aware platform.

Just as Zomato abstracts away the complexity of food ordering for customers, restaurant management for eateries, and delivery logistics for riders — LabEase does the same for the diagnostics industry. The platform is designed to be **lab-agnostic**: any NABL-certified diagnostic center can onboard, list their tests, set their pricing, and start receiving orders — the same way a restaurant joins Zomato.

---

## 2. Product Philosophy — The Zomato Model

Understanding the structural analogy is key to every product decision:

| Zomato Component | LabEase Equivalent | Core Job |
|---|---|---|
| **Zomato Main App** | **Patient App** | Discover labs nearby, browse/search tests, book, track, receive reports |
| **Restaurant Partner App** | **Lab Partner App** | Manage test catalog, accept/reject orders, upload reports, track revenue |
| **Delivery Partner App** | **Phlebotomist App** | Accept collection assignments, navigate to patient, collect sample, confirm |
| **Zomato Operations Dashboard** | **Platform Admin Panel** | Onboard labs, manage disputes, platform-wide analytics, payouts |

### Key Principles Borrowed from Zomato
1. **Discovery is location-first.** Patients see labs near them, sorted by distance, rating, and availability — just like seeing nearby restaurants.
2. **Labs are autonomous partners.** Each lab manages their own catalog, pricing, and availability — the platform is the marketplace, not the operator.
3. **Phlebotomists are the delivery fleet.** They can be lab-employed staff or independent contractors. The app is their tool, not just a notification.
4. **Real-time is non-negotiable.** Order status, phlebotomist location, and report availability must update live.
5. **Ratings & reviews build trust.** Patients rate labs and phlebotomists; this drives quality.

---

## 3. Problem Statement

### For Patients
- No single platform to discover, compare, and book from multiple diagnostic labs.
- Pricing is opaque — patients don't know costs until they call.
- Home collection booking requires phone calls with uncertain scheduling.
- Reports arrive on WhatsApp or paper — no secure, organized health record.
- No visibility into when the phlebotomist will arrive.

### For Diagnostic Labs
- Customer acquisition is entirely offline or through word-of-mouth.
- No digital storefront to list tests, manage pricing, and receive orders.
- Manual dispatch of phlebotomists causes coordination failures.
- Report delivery is disorganized — staff manually message patients.
- No consolidated view of orders, revenue, or operational bottlenecks.

### For Phlebotomists
- Assignments come through informal channels (WhatsApp, phone calls).
- No structured workflow — collection steps, documentation, and proof-of-service are ad hoc.
- No navigation support; addresses are ambiguous.
- No digital record of collections completed for dispute resolution or payout tracking.

---

## 4. Goals & Success Metrics

### Platform-Level Goals

| Goal | KPI | Target (6 months post-launch) |
|------|-----|-------------------------------|
| Build supply side | Onboarded lab partners | 50 labs in launch city |
| Build demand side | Monthly Active Patients | 15,000 MAU |
| Marketplace liquidity | Bookings per day | 500+ |
| Fulfillment reliability | Orders fulfilled on time | ≥ 92% |
| Quality | Avg. platform rating | ≥ 4.2 / 5.0 |
| Revenue | GMV (Gross Merchandise Value) | ₹25L/month by month 6 |

### Product Quality Goals
- App crash rate < 0.1% per session
- API response time < 300ms (P95)
- Live tracking location refresh < 5 seconds
- Report delivery notification < 5 minutes post-upload
- Uptime SLA: 99.9%

---

## 5. User Personas

### 5.1 Riya — The Urban Patient
- **Age:** 28 | **Location:** Pune | **Tech Literacy:** High
- Books tests for herself and her parents; values speed, price transparency, and digital records.
- Expects the same convenience as ordering food — see options nearby, pick one, track it live.

### 5.2 Pathcare Labs — The Lab Partner
- **Type:** Mid-size diagnostic chain with 3 branches.
- Wants to expand digital reach without building their own app.
- Needs a simple partner dashboard: accept orders, upload reports, see earnings.

### 5.3 Karan — The Phlebotomist
- **Age:** 26 | **Employment:** On-roll at a lab partner
- Does 15–20 home collection visits per day.
- Needs clear task assignments, navigation, and a fast collection checklist.

### 5.4 Platform Admin — LabEase Operations Team
- Manages lab onboarding, resolves disputes, monitors platform health, and approves payouts.

---

## 6. Ecosystem Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                        LABEASE PLATFORM                            │
│                                                                    │
│  ┌─────────────────┐    ┌──────────────────┐   ┌───────────────┐  │
│  │   PATIENT APP   │    │  LAB PARTNER APP │   │ PHLEBOTOMIST  │  │
│  │  (Zomato App)   │    │ (Restaurant App) │   │  APP          │  │
│  │                 │    │                  │   │ (Delivery App)│  │
│  │ • Discover Labs │    │ • Manage Catalog │   │ • Task List   │  │
│  │ • Book Tests    │◄──►│ • Accept Orders  │◄──►│ • Navigate    │  │
│  │ • Track Live    │    │ • Upload Reports │   │ • Collect     │  │
│  │ • View Reports  │    │ • View Revenue   │   │ • Confirm     │  │
│  └─────────────────┘    └──────────────────┘   └───────────────┘  │
│            ▲                     ▲                     ▲           │
│            └─────────────────────┴─────────────────────┘           │
│                                  │                                  │
│                    ┌─────────────▼──────────────┐                  │
│                    │   PLATFORM ADMIN PANEL      │                  │
│                    │ • Lab Onboarding            │                  │
│                    │ • Dispute Resolution        │                  │
│                    │ • Platform Analytics        │                  │
│                    │ • Commission & Payouts      │                  │
│                    └─────────────────────────────┘                  │
└────────────────────────────────────────────────────────────────────┘
```

---

## 7. App 1 — Patient App
*(Equivalent: Zomato Main App)*

### 7.1 Authentication & Onboarding

- **FR-PA-01:** Users shall register/login via Google OAuth or email+password (Clerk).
- **FR-PA-02:** Phone number verification via OTP is mandatory during onboarding.
- **FR-PA-03:** On first login, users complete a profile: name, DOB, gender, phone, and default address.
- **FR-PA-04:** Users can add and manage **family member profiles** (sub-accounts) — book tests on behalf of parents, children, etc.
- **FR-PA-05:** Users can save multiple addresses (Home, Work, Other) with map pin support.

---

### 7.2 Discovery — Location-Based Lab Feed
*(Equivalent: Zomato Home Feed)*

- **FR-PA-06:** The home screen shall show a **list/map view of diagnostic labs near the user's current location**, sorted by distance by default.
- **FR-PA-07:** Each lab card in the feed shall display: lab name, logo, distance, ratings & review count, top tests offered, earliest available slot, and a "Home Collection Available" badge.
- **FR-PA-08:** Users shall be able to filter labs by:
  - Collection mode (Home Collection / Walk-In)
  - Rating (4★ and above)
  - Distance radius (1km, 3km, 5km, 10km)
  - Certification (NABL Accredited)
  - Availability (Open Now)
- **FR-PA-09:** Users shall be able to sort labs by: Nearest, Top Rated, Fastest TAT, Lowest Price.
- **FR-PA-10:** A **global search bar** at the top shall allow searching by test name, health concern (e.g., "thyroid", "diabetes"), or lab name — returning both matching labs and tests across all listed partners.
- **FR-PA-11:** A curated **"Popular Tests"** horizontal strip (e.g., CBC, Lipid Profile, HbA1c, Vitamin D) shall be displayed for quick access.
- **FR-PA-12:** Seasonal/promotional banners (managed by Platform Admin) shall appear on the home screen.

---

### 7.3 Lab Profile Page
*(Equivalent: Restaurant Page on Zomato)*

- **FR-PA-13:** Each lab shall have a dedicated profile page showing: name, photos, address, working hours, certifications (NABL badge), ratings breakdown, and reviews.
- **FR-PA-14:** The lab profile shall list all available tests and packages with price, TAT, sample type, and preparation instructions.
- **FR-PA-15:** Users can search within a lab's test catalog.
- **FR-PA-16:** Users can see **"Other patients also booked"** test suggestions on the lab page.

---

### 7.4 Cart & Booking Flow

- **FR-PA-17:** Users can add multiple tests (from the same lab) to a cart.
- **FR-PA-18:** The cart shall display a consolidated list with individual test prices and total.
- **FR-PA-19:** At checkout, users shall:
  1. Select patient (Self or a family member)
  2. Select collection mode: **Home Collection** or **Walk-In at Lab**
  3. For Home Collection: confirm/add address with map pin
  4. Select available date and time slot
  5. Apply promo/referral code (optional)
  6. Review order summary
  7. Complete payment
- **FR-PA-20:** Available time slots shall reflect real-time availability set by the lab partner.
- **FR-PA-21:** Booking confirmation (in-app + SMS + email) shall be sent within 60 seconds.

---

### 7.5 Payment

- **FR-PA-22:** Supported payment methods: UPI, credit/debit card, net banking via Razorpay.
- **FR-PA-23:** **Cash on Collection** shall be available as an option for home collection orders.
- **FR-PA-24:** Promo codes and referral credits shall be applicable at checkout.
- **FR-PA-25:** A digital receipt is generated and stored for every transaction.

---

### 7.6 Live Order Tracking
*(Equivalent: Zomato Live Order Tracking Screen)*

- **FR-PA-26:** After booking, users shall see a **live order tracking screen** with a status pipeline:

  ```
  ✅ Booking Confirmed
       ↓
  ✅ Lab Accepted Your Order
       ↓
  🔄 Phlebotomist Assigned
       ↓
  🔄 Phlebotomist En Route  ← LIVE MAP HERE
       ↓
  🔄 Phlebotomist Arrived
       ↓
  ✅ Sample Collected
       ↓
  🔄 Sample Being Processed
       ↓
  ✅ Report Ready
  ```

- **FR-PA-27:** When the phlebotomist is En Route, the tracking screen shall show a **live map with the phlebotomist's real-time location**, patient's address pin, and estimated time of arrival (ETA) — exactly like Zomato's delivery tracking.
- **FR-PA-28:** Users shall receive push notifications at each major status transition.
- **FR-PA-29:** Users shall be able to call the phlebotomist directly from the tracking screen (masked number for privacy).

---

### 7.7 Reports & Health History

- **FR-PA-30:** Users shall receive a notification when their report is ready, with a direct deep-link to the report.
- **FR-PA-31:** Reports shall be viewable in-app as a PDF viewer and downloadable.
- **FR-PA-32:** Users can share a report via an encrypted, time-limited link (7-day expiry).
- **FR-PA-33:** A **Health History** section shall archive all reports, organized by date and test category (Blood, Imaging, etc.).
- **FR-PA-34:** Users can view health trends over time for recurring tests (e.g., HbA1c trend across 3 bookings).

---

### 7.8 Ratings & Reviews

- **FR-PA-35:** After report delivery, users shall be prompted to rate: (a) the lab (1–5 stars + text review) and (b) the phlebotomist (1–5 stars + optional note).
- **FR-PA-36:** Reviews shall be visible on the lab's profile page.
- **FR-PA-37:** Labs shall be able to respond to reviews (from the Lab Partner App).

---

### 7.9 Offers & Loyalty

- **FR-PA-38:** A dedicated **Offers** section shall show active promo codes and lab-specific discounts.
- **FR-PA-39:** A **referral program**: users get a referral code; both referrer and new user get a discount on their next booking.

---

## 8. App 2 — Lab Partner App
*(Equivalent: Zomato Restaurant Partner App)*

This is the self-service portal for diagnostic lab owners and managers. Each lab operates as an independent partner on the LabEase marketplace.

---

### 8.1 Lab Onboarding & Profile Setup
*(Equivalent: Restaurant onboarding on Zomato)*

- **FR-LA-01:** Lab owners shall register via an onboarding flow: business name, address(es), registration number, NABL certificate upload, bank account details, and owner contact.
- **FR-LA-02:** Each lab submission shall go through a **Platform Admin verification step** before going live on the marketplace. Status: Pending Review → Verified → Live.
- **FR-LA-03:** Labs shall be able to manage their public profile: name, logo, cover photos, description, certifications, and working hours.
- **FR-LA-04:** Labs with multiple branches shall manage each branch as a separate location entity under one account.
- **FR-LA-05:** Labs shall set their **home collection service area** on a map (draw a radius or polygon).
- **FR-LA-06:** Labs shall configure **available time slots** per day of week (e.g., Mon–Sat, 7 AM–10 AM for home collection).

---

### 8.2 Test Catalog & Pricing Management
*(Equivalent: Restaurant Menu Management)*

- **FR-LA-07:** Labs shall be able to add, edit, and archive tests and packages from their own catalog.
- **FR-LA-08:** Each test entry shall include: name, code, description, sample type, preparation instructions, turnaround time (TAT), price, and active/inactive toggle.
- **FR-LA-09:** Labs shall be able to create bundled packages (e.g., "Diabetes Care Panel") with a custom package price.
- **FR-LA-10:** Labs shall be able to run **lab-specific discounts**: percentage or flat discount on selected tests, with start/end dates.
- **FR-LA-11:** Bulk test import shall be supported via CSV upload.
- **FR-LA-12:** Test catalog changes shall take effect immediately on the patient-facing app.

---

### 8.3 Order Management — Accept / Reject Flow
*(Equivalent: Restaurant order notification and acceptance)*

- **FR-LA-13:** When a patient places a booking, the lab shall receive a **real-time order notification** (push notification + in-app alert) with a timer (e.g., 5 minutes to accept or auto-reject).
- **FR-LA-14:** Lab staff shall be able to **Accept** or **Reject** an incoming order.
  - On **Accept**: Order moves to "Confirmed"; phlebotomist assignment flow begins.
  - On **Reject**: Patient is notified and prompted to rebook with another lab. Rejection reason must be selected (e.g., slot unavailable, patient address out of zone).
- **FR-LA-15:** The lab's **Order Queue** shall display all active orders with status, patient name, tests ordered, slot time, collection mode, and assigned phlebotomist.
- **FR-LA-16:** Labs shall be able to **assign or reassign a phlebotomist** to any home collection order from the order detail screen.
- **FR-LA-17:** Labs shall be able to manually update order status (e.g., mark "Sample Received at Lab" when a walk-in patient arrives).
- **FR-LA-18:** Labs shall be able to flag an order (e.g., "Patient Unreachable", "Sample Rejected") with a reason.

---

### 8.4 Report Upload & Delivery

- **FR-LA-19:** Lab experts/technicians shall upload finalized PDF reports against a specific booking ID.
- **FR-LA-20:** Upon upload, the patient shall automatically receive a push notification and SMS within 5 minutes.
- **FR-LA-21:** Reports shall support **version history** — a re-upload creates a new version; the patient always sees the latest, but all versions are stored.
- **FR-LA-22:** The system shall prevent report upload until the order status is "Sample Received at Lab."
- **FR-LA-23:** Uploaded reports shall be auditable: timestamp, uploaded-by user, and version number.

---

### 8.5 Revenue & Payout Dashboard
*(Equivalent: Restaurant Earnings Dashboard on Zomato)*

- **FR-LA-24:** The revenue dashboard shall display:
  - Today's earnings, this week, this month
  - Total orders vs. fulfilled orders vs. cancelled
  - Per-test revenue breakdown
  - Platform commission deducted
  - Net payout amount
- **FR-LA-25:** Labs shall see a **payout schedule** (e.g., weekly payouts every Monday) with payout history and downloadable invoices.
- **FR-LA-26:** Payouts shall be automatically transferred to the lab's registered bank account via Razorpay Payouts or a similar service.
- **FR-LA-27:** Labs shall be able to view a **ratings summary**: average star rating, recent reviews, and response tools.
- **FR-LA-28:** Labs shall receive a weekly performance report (email): orders fulfilled, avg. TAT, ratings trend, revenue.

---

## 9. App 3 — Phlebotomist App
*(Equivalent: Zomato Delivery Partner App)*

This is the mobile-first tool for phlebotomists — both lab-employed staff and independent contractors. It is intentionally simple, fast, and offline-capable.

---

### 9.1 Authentication & Availability

- **FR-PH-01:** Phlebotomists log in via email/password (credentials issued by the lab partner or platform).
- **FR-PH-02:** Upon login, phlebotomists toggle their **availability status**: Online / Offline — exactly like a Zomato delivery partner going online.
- **FR-PH-03:** When Online, the phlebotomist's live location is shared with the platform for assignment matching.

---

### 9.2 Assignment & Acceptance

- **FR-PH-04:** When a lab assigns an order, the phlebotomist receives a **real-time assignment notification** with: patient name, address, tests required, slot time, and collection notes.
- **FR-PH-05:** Phlebotomists shall be able to **Accept** or **Decline** an assignment. On Decline, the lab is notified to reassign.
- **FR-PH-06:** The daily **task list** shall show all accepted assignments sorted by scheduled time, with a clear status indicator per task.

---

### 9.3 Live Navigation & En Route
*(Equivalent: Delivery partner navigating to restaurant/customer)*

- **FR-PH-07:** Each task shall have a **"Start Task"** button that marks status as "En Route" and notifies the patient automatically.
- **FR-PH-08:** The app shall provide an in-app map view showing the patient's location and a **"Navigate"** button that opens Google Maps (or device default) with the address pre-loaded.
- **FR-PH-09:** While En Route, the phlebotomist's **live GPS coordinates shall be shared to the platform every 5 seconds**, powering the patient-side live tracking map.
- **FR-PH-10:** If the phlebotomist is delayed, they shall be able to send a standard delay notification to the patient from the app.

---

### 9.4 Sample Collection Workflow

- **FR-PH-11:** On arrival, the phlebotomist taps **"I've Arrived"**, updating order status in real-time.
- **FR-PH-12:** The app shall present a **digital collection checklist** specific to the booked tests (e.g., tube type, number of vials, fasting confirmation, patient ID verification).
- **FR-PH-13:** Phlebotomists shall capture a **photo of the labeled sample tube(s)** as proof of collection before marking complete.
- **FR-PH-14:** Patient confirmation shall be collected via **4-digit OTP** (sent to patient's phone) entered by the phlebotomist — proof of service, like a delivery OTP.
- **FR-PH-15:** On successful OTP entry and checklist completion, the phlebotomist taps **"Collection Complete"**, updating order status to "Sample Collected" platform-wide.
- **FR-PH-16:** If the patient is unreachable or refuses, the phlebotomist can mark **"Collection Failed"** with a mandatory reason — this notifies the lab and the patient.

---

### 9.5 Earnings & History

- **FR-PH-17:** Phlebotomists shall see a **daily earnings summary**: tasks completed, per-task payout, and total earned today.
- **FR-PH-18:** A **history tab** shall show past assignments with status, collection photo, and patient confirmation.
- **FR-PH-19:** Lab-employed phlebotomists' earnings data is visible to their lab admin.

---

### 9.6 Offline Support

- **FR-PH-20:** Task details (patient name, address, tests, checklist) shall be cached locally for offline access.
- **FR-PH-21:** Checklist completion and photo capture shall work offline; all data syncs automatically when connectivity is restored.
- **FR-PH-22:** The app shall show a clear offline indicator and queue pending sync actions.

---

## 10. Platform Admin Panel

This is the internal LabEase operations tool — not a partner-facing product.

- **FR-ADM-01:** Admins shall be able to review and approve/reject lab onboarding applications with comments.
- **FR-ADM-02:** Admins shall have a platform-wide order monitoring dashboard: total orders today, in-progress, failed, cancelled — across all labs.
- **FR-ADM-03:** Admins shall manage the commission structure per lab or globally (e.g., 15% of order value).
- **FR-ADM-04:** Admins shall manage promotional banners, featured labs, and homepage curations on the Patient App.
- **FR-ADM-05:** Admins shall have a dispute resolution tool: view disputed orders, communicate with patient and lab, issue refunds.
- **FR-ADM-06:** Admins shall manage global promo codes and referral program settings.
- **FR-ADM-07:** Admins shall view platform-wide analytics: GMV, MAU, order funnel, top labs, top tests, churn rate.
- **FR-ADM-08:** Admins shall trigger and monitor payouts to lab partners.

---

## 11. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | API response time < 300ms (P95); live location updates ≤ 5s latency |
| **Scalability** | Support 10,000 concurrent users; horizontally scalable backend |
| **Availability** | 99.9% uptime SLA; maintenance windows 2–4 AM IST only |
| **Security** | AES-256 at rest; TLS 1.3 in transit; all reports in private buckets |
| **Compliance** | DPDPA 2023 (India); 7-year health record retention |
| **Accessibility** | WCAG 2.1 AA on Patient App |
| **Mobile** | PWA installable on Android + iOS; optimized for 375px+ |
| **Offline** | Phlebotomist app must function for task view + collection offline |
| **Localization** | English v1.0; Hindi + Marathi in v1.1 |
| **Audit Logging** | All partner and admin actions logged with user ID + timestamp |

---

## 12. User Stories & Acceptance Criteria

### Epic: Lab Discovery & Booking (Patient)

**US-001: Discover Labs Near Me**
> *As a patient, I want to see diagnostic labs near my location so I can compare and choose the best one.*

**Acceptance Criteria:**
- [ ] Home screen shows a list of labs within 10km of my detected location.
- [ ] Each lab card shows name, rating, distance, and home collection availability.
- [ ] I can filter by "Home Collection Available" and sort by "Nearest."
- [ ] Map view shows lab pins on a map.

---

**US-002: Book a Home Collection**
> *As a patient, I want to book a CBC test with home collection from a nearby lab.*

**Acceptance Criteria:**
- [ ] I can add CBC to cart from the lab's test catalog.
- [ ] I can select a slot, enter address, and pay via UPI.
- [ ] I receive a booking confirmation SMS + in-app notification within 60 seconds.
- [ ] The order appears in My Bookings with status "Booking Confirmed."

---

**US-003: Track Phlebotomist Live**
> *As a patient, I want to see the phlebotomist's live location on a map so I know when they'll arrive.*

**Acceptance Criteria:**
- [ ] When phlebotomist marks "En Route," the tracking screen shows a live map.
- [ ] The phlebotomist's location pin moves in real-time (updates ≤ 5 seconds).
- [ ] ETA is displayed on the tracking screen.
- [ ] I can call the phlebotomist from the tracking screen.

---

### Epic: Order Operations (Lab Partner)

**US-004: Accept an Incoming Order**
> *As a lab manager, I want to be notified of new bookings and accept them quickly.*

**Acceptance Criteria:**
- [ ] I receive a push notification within 30 seconds of a patient booking.
- [ ] I see a timer counting down (5 minutes to accept).
- [ ] I can tap Accept; the order moves to my active order queue.
- [ ] If I reject, I must select a reason, and the patient is notified.

---

**US-005: Upload a Patient Report**
> *As a lab technician, I want to upload a finalized PDF report so the patient is notified automatically.*

**Acceptance Criteria:**
- [ ] I can search for an order by booking ID or patient name.
- [ ] I can upload a PDF (max 10MB) only after order status is "Sample Received."
- [ ] Patient receives a notification within 5 minutes of upload.
- [ ] The report is versioned if I re-upload.

---

### Epic: Collection Workflow (Phlebotomist)

**US-006: Complete a Home Collection**
> *As a phlebotomist, I want a guided workflow so I complete every collection correctly and efficiently.*

**Acceptance Criteria:**
- [ ] I see my task list sorted by time on app open.
- [ ] I tap "Start Task" → status updates to "En Route" → patient is notified.
- [ ] My live location is visible on the patient's tracking screen.
- [ ] On arrival, I complete a checklist, upload tube photo, and enter patient OTP.
- [ ] After OTP confirmation, status updates to "Sample Collected" platform-wide instantly.

---

## 13. User Flows & Information Architecture

### Patient App — Core Flow

```
[App Open]
    │
    ▼
[Location Permission]
    │
    ▼
[Home Feed — Labs Near Me]
    ├── Filter / Sort
    ├── Search Bar (test name / lab name / health concern)
    └── [Lab Profile Page]
              │
              ▼
         [Test Catalog]
              │
              ▼
         [Add to Cart]
              │
              ▼
         [Checkout Flow]
              ├── Select Patient (Self / Family)
              ├── Home Collection / Walk-In
              ├── Address + Slot Selection
              ├── Promo Code
              ├── Payment
              └── Booking Confirmation
                        │
                        ▼
              [Live Tracking Screen]
                        │
                        ▼
              [Report Ready → View / Download PDF]
```

---

### Lab Partner App — Order Lifecycle

```
[New Booking Notification — 5 min timer]
    │
    ├── REJECT → Reason → Patient notified to rebook
    │
    └── ACCEPT
              │
              ▼
    [Assign Phlebotomist]
              │
              ▼
    [Order Queue — Monitor Status in Real-Time]
    Phlebotomist: En Route → Arrived → Sample Collected
              │
              ▼
    [Mark: Sample Received at Lab]
              │
              ▼
    [Lab Expert: Upload Report PDF]
              │
              ▼
    [Patient Auto-Notified — Order Complete]
              │
              ▼
    [Revenue Recorded in Earnings Dashboard]
```

---

### Phlebotomist App — Task Execution Flow

```
[Go Online — Location Shared]
    │
    ▼
[Assignment Notification]
    ├── Decline → Lab reassigns
    └── Accept
              │
              ▼
    [Task Detail — Patient, Address, Tests]
              │
              ▼
    [Start Task → "En Route" → Patient Notified]
    [Live GPS Begins Broadcasting]
              │
              ▼
    [Navigate → Google Maps]
              │
              ▼
    [Arrive → "I've Arrived" → Patient Notified]
              │
              ▼
    [Digital Checklist]
    [Upload Tube Photo]
    [Enter Patient OTP]
              │
              ▼
    [Collection Complete → Status Updated → Go to Next Task]
```

---

## 14. Technical Architecture

### System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                │
│  Patient App (PWA)  │  Lab Partner App  │  Phlebotomist App (PWA)│
│     Next.js 14      │    Next.js 14     │      Next.js 14        │
└─────────────────────┴───────────────────┴────────────────────────┘
                                │
                         REST + WebSocket
                                │
┌──────────────────────────────────────────────────────────────────┐
│                        API LAYER (Railway)                       │
│               Express.js (Node.js) — Monorepo API                │
│                                                                  │
│  Auth Middleware  │  REST Routes  │  WebSocket Server (Socket.io)│
│  (Clerk JWT)      │               │  Live Location + Status      │
└───────────────────┴───────────────┴──────────────────────────────┘
                │                        │
    ┌───────────┴───────────┐    ┌───────┴──────────┐
    │    PostgreSQL          │    │  Supabase Realtime│
    │   (via Supabase)       │    │  (Order Status   │
    │  Structured Health DB  │    │   Pub/Sub)        │
    └───────────────────────┘    └──────────────────┘
                │
    ┌───────────┴───────────┐
    │   Supabase Storage    │
    │  (Private PDF Bucket) │
    │  Signed URL Access    │
    └───────────────────────┘
                │
┌───────────────┴──────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│  Razorpay (Payments + Payouts) │ MSG91 (SMS/OTP)                 │
│  Firebase FCM (Push)           │ Resend (Email)                  │
│  Google Maps API (Nav + Maps)  │ Sentry (Error Tracking)         │
│  PostHog (Analytics)           │ Cloudflare (CDN + DDoS)         │
└──────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Frontend (All 3 Apps) | Next.js 14 (App Router) | Single codebase; SSR for Patient App SEO; PWA support |
| Backend API | Express.js on Node.js | Flexible, fast REST API; Socket.io-compatible |
| Database | PostgreSQL via Supabase | ACID-compliant for health data; managed infra |
| Realtime / Live Tracking | Socket.io + Supabase Realtime | Low-latency bidirectional events for location + status |
| File Storage | Supabase Storage | Private bucket; signed URL access for reports |
| Auth | Clerk | Multi-role auth; OTP; social login; JWT middleware |
| Payments | Razorpay | Best UPI/card coverage in India; supports payouts to partners |
| SMS & OTP | MSG91 | Reliable delivery in India; DLT-registered |
| Email | Resend | Transactional email with templates |
| Push Notifications | Firebase Cloud Messaging | PWA push support on Android + iOS |
| Maps | Google Maps Platform | Navigation, Geocoding, Distance Matrix APIs |
| Backend Hosting | Railway | Auto-deploy, managed Postgres add-on |
| Frontend Hosting | Vercel | Next.js-native; global CDN |
| Error Monitoring | Sentry | Real-time crash and error tracking |
| Analytics | PostHog | Self-hostable product analytics |

---

## 15. Data Models

### Core Entities

```
LabPartners
├── id (UUID), name, slug
├── owner_user_id (FK → Users)
├── status: ENUM(pending_review, verified, live, suspended)
├── address, lat, lng, service_radius_km
├── nabl_certificate_url, bank_account_id
├── commission_rate (%), rating_avg, rating_count
└── created_at

Users
├── id (UUID), clerk_id
├── role: ENUM(patient, lab_staff, phlebotomist, platform_admin)
├── name, email, phone, phone_verified
└── created_at

FamilyMembers
├── id, patient_user_id (FK → Users)
├── name, dob, gender, relation
└── created_at

Addresses
├── id, user_id (FK → Users)
├── label (Home/Work/Other), full_address
├── lat, lng
└── is_default

Tests
├── id, lab_id (FK → LabPartners), code, name
├── description, sample_type, preparation_instructions
├── turnaround_hours, price, category
├── is_active
└── created_at

Packages
├── id, lab_id (FK → LabPartners), name, description
├── price, is_active
└── test_ids[] (many-to-many via PackageTests)

Bookings
├── id (UUID), booking_number (human-readable: LBE-YYYYMMDD-XXXX)
├── patient_user_id, family_member_id (nullable)
├── lab_id (FK → LabPartners)
├── collection_mode: ENUM(home_collection, walk_in)
├── address_id (FK → Addresses)
├── slot_datetime
├── status: ENUM(pending_lab_acceptance, confirmed, phlebotomist_assigned,
│           en_route, arrived, sample_collected, sample_received_at_lab,
│           processing, report_ready, cancelled, failed)
├── payment_status: ENUM(pending, paid, cash_on_collection, refunded)
├── total_amount, platform_commission, lab_payout_amount
├── promo_code_id (nullable)
└── created_at

BookingItems
├── id, booking_id, test_id or package_id
└── price_at_booking

PhlebotomistAssignments
├── id, booking_id (FK → Bookings)
├── phlebotomist_user_id (FK → Users)
├── status: ENUM(assigned, accepted, declined, en_route, arrived, collected, failed)
├── collection_photo_url, patient_otp_confirmed (boolean)
├── failure_reason (nullable)
└── assigned_at, accepted_at, collected_at

PhlebotomistLocations
├── id, phlebotomist_user_id (FK → Users)
├── lat, lng
├── is_online (boolean)
└── recorded_at (indexed; time-series; retained 24 hours)

Reports
├── id, booking_id (FK → Bookings)
├── uploaded_by_user_id (FK → Users)
├── file_url (Supabase Storage path)
├── version (integer, increments on re-upload)
├── is_active (latest version = true)
└── uploaded_at

Reviews
├── id, booking_id (FK → Bookings), patient_user_id
├── lab_rating (1–5), lab_review_text
├── phlebotomist_rating (1–5), phlebotomist_note
└── created_at

Payouts
├── id, lab_id (FK → LabPartners)
├── period_start, period_end
├── gross_amount, commission_deducted, net_payout
├── status: ENUM(scheduled, processing, paid, failed)
└── paid_at
```

---

## 16. Real-Time & Live Tracking Architecture

Live tracking is a first-class feature, equivalent to Zomato's delivery tracking. Here's how it works end-to-end:

```
PHLEBOTOMIST APP                    BACKEND                    PATIENT APP
      │                                │                              │
      │  GPS coords every 5s           │                              │
      │──── Socket.io emit ───────────►│                              │
      │     { lat, lng, booking_id }   │                              │
      │                                │── Broadcast to room ────────►│
      │                                │   booking:{booking_id}       │
      │                                │                              │
      │                                │── Write to                   │
      │                                │   PhlebotomistLocations      │
      │                                │   (time-series, 24h TTL)     │
```

- Each active booking forms a **Socket.io room** (`booking:{booking_id}`).
- Patient app joins the room after order is confirmed.
- Phlebotomist app emits location to the room while En Route.
- ETA is computed using Google Maps Distance Matrix API on each location update.
- Location data is stored short-term (24 hours) for dispute resolution.
- When status changes to "Arrived" or "Collected," location sharing stops.

### Status Update Flow (Supabase Realtime)

All order status transitions are written to the `bookings` table and broadcast via **Supabase Realtime** to all subscribed clients (Patient App, Lab Partner App, Platform Admin Panel) — no polling required.

---

## 17. Security & Compliance

### Role-Based Access Control (RBAC)

| Role | Access Scope |
|------|-------------|
| `patient` | Own bookings, own reports, own family members only |
| `lab_staff` | Own lab's orders, catalog, reports; no cross-lab access |
| `phlebotomist` | Own assigned tasks only; no patient PII beyond name + address |
| `platform_admin` | Full platform access; all actions audit-logged |

### Data Security
- All PDF reports in **private Supabase Storage buckets** — no public URLs.
- Reports accessed via **signed URLs** with 1-hour expiry (re-generated on each view).
- Patient shareable report links: time-limited (7 days), one-time token, no auth required.
- Patient PII (name, phone, address) encrypted at rest using column-level encryption.
- Phlebotomist location data stored for 24 hours only, then purged.
- All API routes protected by Clerk JWT middleware.
- HTTPS/TLS 1.3 enforced platform-wide.

### Compliance
- **DPDPA 2023**: Explicit patient consent at onboarding; data minimization; deletion requests fulfilled within 72 hours.
- **Health Data Retention**: Reports and booking records retained for 7 years (legal minimum for medical records in India).
- **Audit Log**: All destructive or sensitive actions (report upload, order cancellation, payout trigger, admin override) logged in `audit_logs` with user ID, action, entity, old/new values, and timestamp.

---

## 18. Integrations

| Integration | App | Purpose |
|-------------|-----|---------|
| **Clerk** | All | Auth, OTP, social login, JWT |
| **Razorpay Payments** | Patient App | UPI, card, net banking checkout |
| **Razorpay Payouts** | Platform Admin | Automated lab partner payouts |
| **MSG91** | Backend | SMS (OTP, booking, report alerts) |
| **Resend** | Backend | Transactional email (confirmations, reports) |
| **Firebase FCM** | Patient + Phlebotomist | Push notifications |
| **Google Maps Platform** | Patient + Phlebotomist | Live map, navigation, geocoding, ETA |
| **Supabase Storage** | Lab Partner + Patient | PDF report storage + signed access |
| **Supabase Realtime** | All | Order status pub/sub |
| **Socket.io** | Phlebotomist + Patient | Live GPS tracking |
| **Sentry** | All | Error and crash monitoring |
| **PostHog** | Patient App | Product analytics, funnel analysis |

---

## 19. Release Milestones

### Phase 1 — Platform Foundation (Weeks 1–5)
- [ ] Monorepo setup: Next.js (3 apps) + Express backend + Supabase
- [ ] Clerk authentication for all 4 roles
- [ ] Platform Admin: Lab onboarding + approval workflow
- [ ] Lab Partner: Profile setup, branch management, service area configuration

### Phase 2 — Marketplace Core (Weeks 6–11)
- [ ] Patient App: Location-based lab feed, filters, search
- [ ] Lab Profile Page with test catalog
- [ ] Lab Partner: Test & package CRUD, slot configuration
- [ ] Patient: Cart, checkout flow, Razorpay payment
- [ ] Lab Partner: Order accept/reject with 5-min timer
- [ ] Booking confirmation notifications (SMS + email + in-app)

### Phase 3 — Field Operations & Live Tracking (Weeks 12–17)
- [ ] Phlebotomist App: Availability toggle, task list, assignment accept/decline
- [ ] Lab Partner: Phlebotomist assignment from order detail
- [ ] Live GPS tracking: Socket.io location broadcast
- [ ] Patient App: Live tracking screen with map + ETA
- [ ] Collection checklist, tube photo upload, patient OTP confirmation
- [ ] Real-time order status updates (Supabase Realtime)

### Phase 4 — Reports, Ratings & Revenue (Weeks 18–23)
- [ ] Lab Partner: Report upload workflow + versioning
- [ ] Patient: Report viewer, PDF download, shareable link
- [ ] Patient: Health history & trends
- [ ] Ratings & reviews (patient → lab + phlebotomist; lab response)
- [ ] Lab Partner: Revenue & payout dashboard
- [ ] Platform Admin: Commission management, dispute resolution, payout triggers
- [ ] Razorpay Payouts integration for lab disbursements
- [ ] Referral program + promo codes

### Phase 5 — Hardening & Launch (Weeks 24–26)
- [ ] WCAG 2.1 AA accessibility audit
- [ ] Security penetration testing
- [ ] Load testing: 10,000 concurrent users
- [ ] Beta program with 5 lab partners
- [ ] Production launch (single city)

### v1.1 Roadmap (Post-Launch)
- Hindi + Marathi localization
- AI report summary (plain-language interpretation of results)
- Repeat booking ("Book Same Tests Again")
- Doctor-share integration (share report directly to a doctor's portal)
- Multi-city expansion toolkit

---

## 20. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Labs slow to onboard or reluctant to manage app | High | Critical | Assign dedicated lab success managers; provide onboarding training + demo |
| Phlebotomist GPS accuracy in dense urban areas | High | Medium | Manual "I've Arrived" tap as fallback; address pin confirmation on checklist |
| Lab rejects too many orders → poor patient experience | Medium | High | Track rejection rate per lab; penalize excessive rejections; auto-suspend |
| Socket.io scaling under load (1000+ concurrent trackers) | Medium | High | Horizontal scaling with Redis adapter for Socket.io |
| Razorpay payout failures | Low | High | Retry logic + admin alert; manual payout fallback |
| Report data breach / unauthorized access | Low | Critical | Private buckets, signed URLs, column encryption, pen testing |
| DPDPA non-compliance | Low | Critical | Legal review at each phase; DPO appointment; consent management |
| Cold-start problem (no labs = no patients, no patients = no labs) | High | Critical | Launch in one city; acquire 10 labs before patient launch; offer 0% commission for first 3 months |

---

## 21. Open Questions

| # | Question | Owner | Due |
|---|----------|-------|-----|
| 1 | Are phlebotomists lab-employed staff or gig contractors on the platform? This affects payout model and app features. | Business | Phase 1 |
| 2 | What is the platform commission rate? (Suggested: 12–18% of booking value) | Business + Finance | Phase 1 |
| 3 | Will labs be allowed to offer cash-on-collection, or is prepayment mandatory? | Product + Legal | Phase 2 |
| 4 | Are there regulatory requirements for digital lab reports to have a doctor's digital signature (NABL/CDSCO compliance)? | Legal | Phase 4 |
| 5 | Should patients be able to book from multiple labs in a single cart (cross-lab cart), or is it single-lab per booking? | Product | Phase 2 |
| 6 | Launch city decision — affects slot configuration, service zones, SMS provider DLT registration. | Business | Phase 1 |
| 7 | What is the patient refund policy for cancelled or failed collections? | Business | Phase 2 |

---

## 22. Appendix

### A. Zomato Model Mapping — Quick Reference

| Zomato Feature | LabEase Equivalent |
|---|---|
| Restaurant discovery feed | Lab discovery feed (location-based) |
| Restaurant profile + menu | Lab profile + test catalog |
| Add to cart + checkout | Add tests to cart + booking checkout |
| Order placed → restaurant notified | Booking placed → lab notified (5-min accept window) |
| Delivery partner assigned | Phlebotomist assigned |
| Live delivery tracking map | Live phlebotomist tracking map |
| "Delivered" confirmation | "Sample Collected" OTP confirmation |
| Order history | Booking history + reports |
| Restaurant earnings dashboard | Lab revenue + payout dashboard |
| Delivery partner app | Phlebotomist app |
| Zomato Gold / offers | Promo codes + referral program |
| Platform admin operations | LabEase Admin Panel |

---

### B. Glossary

| Term | Definition |
|------|-----------|
| **PHI** | Protected Health Information |
| **TAT** | Turnaround Time — sample collection to report delivery |
| **NABL** | National Accreditation Board for Testing and Calibration Laboratories |
| **DPDPA** | Digital Personal Data Protection Act, India 2023 |
| **PWA** | Progressive Web App — installable web app |
| **GMV** | Gross Merchandise Value — total booking value processed |
| **DLT** | Distributed Ledger Technology — TRAI's SMS regulation platform |
| **RBAC** | Role-Based Access Control |
| **OTP** | One-Time Password — used for phone verification + collection proof |

---

### C. Design Principles

1. **Location-first** — Every experience starts from where the user is.
2. **Lab as the storefront** — Labs own their identity, catalog, and pricing. The platform is the marketplace.
3. **Real-time or nothing** — Every status change is immediate. No manual refresh, no polling UIs.
4. **Phlebotomist UX = Delivery Partner UX** — Simple, fast, offline-capable, one tap per action.
5. **Trust through transparency** — Live tracking, OTP proof, ratings, and verified badges reduce anxiety at every step.
6. **Mobile-first throughout** — All three apps designed for a 375px screen first.

---

*This document is version-controlled. All changes must be reviewed by the Product Owner and communicated to stakeholders before implementation.*

---

**Document Control**

| Version | Date | Author | Summary of Changes |
|---------|------|--------|--------------------|
| 1.0 | March 25, 2026 | Product Team | Initial PRD from project overview |
| 2.0 | March 26, 2026 | Product Team | Full rewrite — Zomato-model structure; location-based discovery; live GPS tracking; lab partner app with onboarding, order accept/reject, revenue dashboard; phlebotomist OTP collection flow |
