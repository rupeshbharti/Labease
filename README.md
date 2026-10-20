# Project Synopsis: LabEase

---

## a) Project Title
**LabEase — A Location-Aware Three-Sided Marketplace Platform for Diagnostic Healthcare Services**  
*(Sub-title / Vision: "The Zomato for Diagnostic Tests")*

---

## b) Introduction of Project
**LabEase** is a comprehensive, location-aware healthcare platform engineered to digitize, simplify, and standardize diagnostic lab bookings and home sample collection logistics. Structured on an on-demand marketplace model (analogous to Zomato's ecosystem), LabEase seamlessly integrates three core stakeholders within the diagnostic healthcare value chain:

1. **Patients:** Individuals who require blood, pathology, or radiology tests and desire transparent pricing, local lab discovery, convenient home sample collection, live tracking of collection agents, and digital health report storage.
2. **Diagnostic Labs:** NABL-certified laboratories seeking a digital storefront to expand their customer reach, publish test packages, manage orders, assign phlebotomists, and dispatch digital reports.
3. **Phlebotomists:** Qualified sample collection agents who receive optimized daily route assignments, navigate to patient addresses, collect samples with OTP verification, and deposit samples at partner labs.

The ecosystem is centrally governed by a **Platform Admin Panel** responsible for onboarding lab partners, auditing quality certifications, managing dispute resolution, and processing commission-based payouts.

---

## c) Objective
The primary objective of LabEase is to eliminate the opacity, fragmentation, and operational bottlenecks inherent in conventional diagnostic healthcare delivery. 

### Key Specific Objectives:
* **Location-Based Discovery & Price Transparency:** Provide patients with a real-time, map-enabled discovery engine to compare nearby NABL-certified labs by distance, price, turnaround time (TAT), and verified user ratings.
* **Automated Home Collection Logistics:** Streamline phlebotomist dispatch and live tracking using WebSockets, reducing missed appointments and arrival uncertainty.
* **Digital Operations for Partner Labs:** Offer an autonomous, self-serve partner portal for labs to manage catalogs, track daily revenue, assign field agents, and digitize report delivery without requiring custom software development.
* **Secure Digital Health Vault:** Supply patients with an organized repository for current and historical test reports, including secure public URL generation for doctor sharing.
* **Scalable Marketplace Governance:** Provide platform administrators with real-time audit tools to monitor system health, resolve user disputes, configure commission structures, and handle financial payouts.

---

## d) System Architecture and Modules

### 1. Architecture Overview
LabEase utilizes a modern web architecture comprising a **React SPA frontend** (Vite + React Router v7), a **Node.js/Express REST backend server** with **Socket.IO WebSockets** for real-time location streaming, and a **Supabase (PostgreSQL)** database backend enforcing Row-Level Security (RLS) and storage management.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           LABEASE PLATFORM                              │
│                                                                         │
│   ┌─────────────────┐    ┌──────────────────┐   ┌───────────────────┐   │
│   │   PATIENT APP   │    │  LAB PARTNER APP │   │ PHLEBOTOMIST APP  │   │
│   │ • Discovery     │    │ • Test Catalog   │   │ • Task Queue      │   │
│   │ • Booking/Cart  │    │ • Order Mgmt     │   │ • GPS Navigation  │   │
│   │ • Live Tracking │◄──►│ • Phlebo Assign  │◄──► • OTP Verification│   │
│   │ • Health Vault  │    │ • Report Upload  │   │ • Lab Handover    │   │
│   └─────────────────┘    └──────────────────┘   └───────────────────┘   │
│            ▲                      ▲                       ▲             │
│            └──────────────────────┼───────────────────────┘             │
│                                   │                                     │
│                     ┌─────────────▼──────────────┐                      │
│                     │    PLATFORM ADMIN PANEL    │                      │
│                     │ • Lab Onboarding & Audit   │                      │
│                     │ • Global Order Monitor     │                      │
│                     │ • Financial Payouts        │                      │
│                     └─────────────┬──────────────┘                      │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │
    ┌───────────────────────────────▼────────────────────────────────┐
    │                       BACKEND CORE SERVICES                    │
    │  ┌────────────────────────┐         ┌───────────────────────┐  │
    │  │ Express REST API Engine│         │ Socket.IO Tracking    │  │
    │  └───────────┬────────────┘         └───────────┬───────────┘  │
    └──────────────┼──────────────────────────────────┼──────────────┘
                   │                                  │
    ┌──────────────▼──────────────────────────────────▼──────────────┐
    │                      SUPABASE / POSTGRESQL                     │
    │ • Relational DB  • Row-Level Security  • Storage Buckets (PDF) │
    └────────────────────────────────────────────────────────────────┘
```

### 2. Module Breakdown

#### Module 1: Patient Portal (`src/patient/`)
* **Discovery & Search Engine:** Location-aware lab feed featuring distance-based sorting, distance radius filtering, rating/certification filters, and global search across tests, packages, and labs.
* **Cart & Booking Workflow:** Multi-item cart (`CartContext`), dynamic slot selection, patient address management, family member sub-profile selection, and promo code redemptions.
* **Live GPS Tracking Dashboard:** Real-time tracking of assigned phlebotomists via Socket.IO, displaying current location, ETA, and a step-by-step progress tracker (Booked → Assigned → On The Way → Arrived → Sample Collected → Processing → Report Uploaded).
* **Health Records Vault:** Centralized view of test history, report PDF downloads, and shareable public link generation.

#### Module 2: Lab Partner Portal (`src/lab/`)
* **Catalog & Package Management:** Self-serve CRUD interface to add individual tests, set custom prices, bundle tests into health packages, and manage home collection availability.
* **Fulfillment & Order Processing:** Real-time order queue with status controls (Accept/Reject), phlebotomist assignment modal with duty-status filters, and sample collection tracking.
* **Report Dispatch Center:** Upload diagnostic report PDFs directly to cloud storage (`ReportUploadPage`) and automatically notify patients.
* **Revenue & Analytics:** Consolidated dashboard tracking Gross Merchandise Value (GMV), platform commissions, net revenue, and payout statuses (`RevenuePage`).

#### Module 3: Phlebotomist Portal (`src/phlebotomist/`)
* **Duty Status & Task Queue:** Online/offline duty status toggle, push-style assignment notifications, and daily visit scheduling.
* **Sample Collection Workflow:** Turn-by-turn navigation instructions, patient contact actions, arrival confirmation, and secure OTP verification code entry during collection.
* **Lab Handover Verification:** Step-by-step confirmation of sample transport and drop-off at designated lab facilities.

#### Module 4: Platform Admin Panel (`src/admin/`)
* **Partner Onboarding Pipeline:** Audit lab applications, review NABL accreditation documents, and approve or reject lab storefronts (`LabReviewPage`).
* **System Monitor & Dispute Resolution:** Platform-wide oversight of active bookings, delivery bottlenecks, and customer support interventions.
* **Financial Management:** Commission rate setting, revenue split tracking, and payout clearance (`PayoutsManagerPage`).

#### Module 5: Express REST API & WebSockets Backend (`server/`)
* **API Controllers & Routes:** Modular routes (`booking.routes.js`, `catalog.routes.js`, `discovery.routes.js`, `phlebo.routes.js`, `revenue.routes.js`, `user.routes.js`, `admin.routes.js`).
* **Real-Time Streaming Engine:** Socket.IO WebSocket server (`server/index.js`) managing bi-directional location broadcasts from phlebotomist devices to patient tracking dashboards.

---

## e) Technical

### 1. Technology Stack
* **Frontend Framework:** React 19 with Vite 6 build system
* **Client-Side Routing:** React Router v7
* **Icons & Styling:** Lucide React, Vanilla CSS with modern custom design system (CSS variables, glassmorphism, responsive grid/flexbox)
* **UI Feedback:** React Hot Toast
* **Backend Runtime:** Node.js (ES Modules)
* **Web Server Framework:** Express.js (v5)
* **Real-Time Communication:** Socket.IO (Server v4) & Socket.IO Client
* **HTTP & Middleware:** Axios, Cors, Multer, Dotenv
* **Database & Cloud Backend:** Supabase (PostgreSQL)
  * Custom SQL migrations (`001_initial_schema.sql` to `007_phase4_additions.sql`)
  * Row-Level Security (RLS) policies for strict tenant data isolation
  * Supabase Storage Buckets (`lab-documents`, `test-reports`, `avatars`)
* **Authentication:** Supabase Auth with custom `AuthProvider` context

### 2. File & Directory Structure Overview
```
LabEase/
├── server/                   # Express Backend & WebSockets
│   ├── index.js              # Server entry point & Socket.IO setup
│   ├── middleware/           # Auth & validation middleware
│   ├── routes/               # REST API endpoints (12 route modules)
│   └── services/             # Business logic & external integrations
├── src/                      # React Frontend Application
│   ├── admin/                # Platform Admin Panel views
│   ├── auth/                 # Login, Signup, Auth Context & Guards
│   ├── config/               # Supabase & API configurations
│   ├── hooks/                # Custom React Hooks
│   ├── lab/                  # Lab Partner Dashboard & Catalog Manager
│   ├── patient/              # Patient Web App & Booking Flow
│   ├── phlebotomist/         # Phlebotomist App & Duty Manager
│   ├── shared/               # Reusable UI Components
│   └── utils/                # Helper utilities & formatters
├── supabase/                 # Database Schema & Security
│   └── migrations/           # SQL schema definitions, indexes & RLS policies
├── package.json              # Dependencies & run scripts
└── vite.config.js            # Vite bundler configuration
```

---

## f) Methodology

LabEase followed an **Agile, Domain-Driven Iterative Development Methodology** structured into five key phases:

1. **Phase 1 — Requirements & Domain Modeling:**  
   Formulated the product strategy inspired by multi-sided marketplace logistics. Drafted detailed Product Requirement Documents (PRDs) defining user personas (Patient, Lab Owner, Phlebotomist, Admin) and entity relationships.
2. **Phase 2 — Database Schema & Data Isolation:**  
   Designed the relational PostgreSQL schema in Supabase. Configured primary and foreign keys across 12+ tables (Users, Labs, Tests, Packages, Bookings, Phlebotomists, Addresses, Family Profiles, Reports, Payouts) and enforced tenant isolation using Supabase Row-Level Security (RLS).
3. **Phase 3 — Core Backend REST Services Development:**  
   Implemented modular Express route handlers to power lab discovery, cart management, order lifecycle transitions, catalog management, and administrative actions.
4. **Phase 4 — Role-Based Web Portals & UI/UX Construction:**  
   Engineered distinct, role-tailored frontend interfaces using React 19. Designed custom CSS styling without heavy third-party framework overhead to maintain optimal performance and complete visual control.
5. **Phase 5 — Real-Time WebSockets Integration & Verification:**  
   Built Socket.IO WebSocket streams to enable real-time GPS location updates from field phlebotomists to patient devices. Implemented multi-stage verification (OTP sample collection codes) to ensure service delivery integrity.

---

## g) Expected Outcomes and Features Scope

### 1. Expected Outcomes
* **Unified Diagnostic Marketplace:** A functional web platform linking healthcare consumers with NABL-accredited diagnostic labs.
* **Enhanced Patient Convenience:** Reduced diagnostic booking time, elimination of opaque phone-based pricing, and real-time visibility into home collection agent arrival.
* **Operational Efficiency for Labs:** Turnkey digital presence for independent labs, eliminating manual dispatching and paper-based report distribution.
* **Traceable & Secure Sample Handling:** Standardized collection workflows with digital proof of service and end-to-end sample lifecycle tracking.

### 2. Feature Scope Matrix

| Feature Module | In-Scope (Current Version) | Out-of-Scope (Future Enhancements) |
|---|---|---|
| **Patient Features** | • Location-based lab discovery & distance sorting<br>• Search by test, package, disease, or lab<br>• Multi-item cart & dynamic slot booking<br>• Family member sub-profile management<br>• Multiple address management<br>• Real-time phlebotomist live GPS tracking<br>• Digital report viewing & public link sharing | • AI-based prescription OCR reader<br>• Smart automated health report summarizer<br>• Native iOS / Android apps (React Native)<br>• Integrated online doctor video consultation |
| **Lab Partner Features** | • Storefront setup & NABL document submission<br>• Individual test & bundle package catalog CRUD<br>• Order acceptance/rejection workflow<br>• Duty-based phlebotomist assignment<br>• PDF report upload & automated dispatch<br>• Revenue, commission & payout analytics | • Direct LIS (Lab Information System) HL7 integration<br>• Automated automated reagent inventory tracking |
| **Phlebotomist Features** | • Online/offline duty status toggle<br>• Daily assigned task queue<br>• In-app turn-by-turn navigation link<br>• Patient arrival & OTP collection confirmation<br>• Lab sample deposit confirmation | • Integrated route optimization algorithm for multi-stop batches<br>• IoT temperature-monitored sample box telemetry |
| **Admin Features** | • Lab onboarding audit & approval dashboard<br>• Platform-wide live order monitor<br>• Financial commission setting & payout clearance<br>• Dispute management workflow | • Automated AI-driven fraud detection on test reports<br>• Dynamic regional commission algorithms |
