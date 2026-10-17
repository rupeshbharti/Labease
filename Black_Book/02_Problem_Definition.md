# CHAPTER 2: PROBLEM DEFINITION

---

## 2.1 Problem Statement
The diagnostic healthcare service delivery model in urban and semi-urban environments suffers from extreme fragmentation, informational asymmetry, and inefficient operational logistics. Patients requiring routine or specialized diagnostic tests (blood panels, pathology, urine analysis, lipid profiles) currently encounter significant hurdles:

1. **Opaque Pricing & Hidden Costs:** Diagnostic laboratories operate independently without centralized price publishing. Patients are unable to compare test costs across nearby labs, frequently paying premium rates for standard tests.
2. **Uncertainty in Home Sample Pickups:** Traditional home collection booking is handled manually over phone calls or WhatsApp messages. Patients receive wide, vague arrival windows (e.g., "between 8 AM and 12 PM") without real-time tracking, causing missed appointments, extended fasting discomfort, and patient frustration.
3. **Lack of Sample Traceability:** Once a sample is collected, patients have zero visibility into whether the sample reached the testing facility, spent excess time in transit, or underwent improper storage during transport.
4. **Physical & Delayed Report Delivery:** Diagnostic results are still delivered largely via physical paper collection, email attachments, or siloed lab portals. Patients lack a consolidated personal health repository to track historical test trends over time or securely share reports with consulting physicians.
5. **Operational Bottlenecks for Independent Labs:** Small-to-medium NABL-certified independent diagnostic centers lack the capital and technical infrastructure to build native web or mobile apps, leaving them dependent on third-party aggregators that charge exorbitant fees or restrict partner branding.

---

## 2.2 Analysis of the Existing System
The existing diagnostic service landscape can be divided into two primary models:

### Model 1: Traditional Offline / Phone-Based Booking
* **Workflow:** Patient calls a nearby lab or visits in person → Schedules home collection verbally → Lab manually logs booking on paper/Excel → Assigns phlebotomist via phone call → Phlebotomist collects sample → Sample delivered to lab → Report printed or emailed manually.
* **Limitations:** High human error rate, double booking, lost address details, lack of digital identity verification, no live location tracking, manual cash collection risks.

### Model 2: Legacy Centralized Aggregator Platforms
* **Workflow:** Patient books via mega-aggregators (e.g., generic medical search directories) → Request dispatched to partner chains → Processing handled off-platform.
* **Limitations:** Heavy bias toward large corporate lab chains, high platform commission fees (25–40%), lack of direct lab-to-patient communication, absence of real-time phlebotomist tracking, and poor local neighborhood lab representation.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       TRADITIONAL DIAGNOSTIC WORKFLOW                       │
│                                                                             │
│  Patient Call ──► Manual Entry ──► Phone Assignment ──► Vague Pick-up Window │
│      (Opaque)      (Paper Log)     (No Trackability)     (High Delay)       │
│                                                                             │
│  Sample Picked ──► Manual Transit ──► Paper Printing ──► Physical Pickup     │
│  (No Verification) (Risk of Spoilage)  (Delayed Delivery) (Lost Records)     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2.3 Disadvantages of the Existing System
* **No Radial Distance Discovery:** Patients cannot filter labs within specific physical radii (e.g., 3km, 5km, 10km) centered on their GPS location.
* **Fasting Window Inconvenience:** Many blood tests require strict 8–12 hour fasting. Unpredictable collector arrival times lead to prolonged fasting, causing hypoglycemia or patient distress.
* **Absence of Proof of Service:** No secure OTP verification exists to ensure that sample collection was executed by an authorized agent at the correct patient location.
* **Isolated Data Silos:** Patients who use multiple labs have test reports scattered across paper files, SMS links, and email threads with no single digital vault.
* **Lack of Automated Revenue Settlement:** Independent labs wait weeks or months for platform payout settlements due to manual reconciliation processes.

---

## 2.4 Proposed System — LabEase
**LabEase** introduces an integrated, location-aware three-sided marketplace platform designed specifically to resolve diagnostic healthcare friction points. By combining React 19 web interfaces, Node.js Express REST APIs, Socket.IO WebSockets, and Supabase PostgreSQL with Row-Level Security, LabEase delivers a modern, transparent, and scalable service delivery network.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PROPOSED LABEASE WORKFLOW                          │
│                                                                             │
│  Location Search ──► Cart & Slot Booking ──► Real-Time GPS Tracking         │
│  (Radial & Transparent) (Instant Confirmation)  (Socket.IO WebSockets)       │
│                                                                             │
│  OTP Sample Collection ──► Lab Handover Verification ──► PDF Upload Vault   │
│   (4-Digit Secure OTP)      (Chain of Custody)       (Instant Shareable URL)│
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Advantages of LabEase:
1. **Interactive Map & Distance Sorting:** Instant identification of nearby NABL-accredited laboratories using dynamic radial search, complete with price comparison and turnaround time (TAT) displays.
2. **Real-Time GPS Tracking of Phlebotomists:** Live streaming of phlebotomist coordinates via Socket.IO, displaying current location, ETA, and status milestones (Booked → Assigned → En Route → Arrived → Sample Collected → Report Uploaded).
3. **4-Digit OTP Sample Collection Verification:** Security mechanism where sample collection is confirmed only when the phlebotomist inputs the patient's unique 4-digit system OTP, ensuring patient presence and audit integrity.
4. **Self-Serve Lab Partner Workspace:** Empirical control panel allowing labs to manage individual tests, package bundles, phlebotomist rosters, order acceptance, and PDF report uploads.
5. **Secure Health Records Vault:** Patient repository for storing historical diagnostic reports with time-limited shareable public links for consulting physicians.
6. **Automated Platform Commission & Payout Pipeline:** Dynamic commission calculation per booking with real-time financial tracking for platform admin and lab partners.

---

## 2.5 Feature Comparison: Existing vs. Proposed System

| Parameter / Feature | Traditional / Legacy Systems | LabEase Proposed Platform |
|---|---|---|
| **Lab Discovery** | Physical visit or phone inquiry | Real-time GPS radial search (distance & price sorted) |
| **Price Transparency** | Opaque, quoted upon inquiry | Instant full breakdown of test prices and package discounts |
| **Accreditation Audit** | Unverified / physical display only | Admin audited NABL certificate verification badge |
| **Phlebotomist Tracking** | Phone calls ("Agent is on the way") | Live map tracking with real-time ETA via Socket.IO |
| **Sample Security** | Verbal confirmation | 4-Digit OTP confirmation code entered on phlebotomist app |
| **Report Distribution** | Paper delivery, SMS link, or physical pickup | Instant cloud PDF upload with secure public link sharing |
| **Family Profiles** | Single profile or multiple manual registrations | Centralized patient account with family sub-profiles |
| **Lab Catalog Control** | Fixed static lists managed by middleman | Self-serve real-time CRUD test & package catalog manager |
| **Financial Settlement** | Delayed manual monthly accounting | Automated booking commission split & payout tracker |
