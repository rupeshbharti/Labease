# CHAPTER 1: INTRODUCTION

---

## 1.1 Project Overview & Vision
**LabEase** is a location-aware, multi-sided marketplace platform for diagnostic healthcare services. Styled conceptually as the *"Zomato for Diagnostic Tests"*, LabEase is designed to streamline, digitize, and standardize the process of booking pathology/radiology tests, scheduling home sample collection, tracking field phlebotomists in real-time, and delivering certified medical test reports electronically.

In the contemporary healthcare ecosystem, diagnostic testing forms the baseline for over 70% of medical decisions. However, the operational model for patient-lab interactions remains fragmented, physically reliant, and largely opaque. Patients frequently struggle with comparing test prices across laboratories, locating NABL (National Accreditation Board for Testing and Calibration Laboratories) accredited facilities, scheduling reliable home sample pickups, and receiving timely diagnostic reports.

LabEase bridges these structural gaps by creating a unified, real-time digital ecosystem connecting four major stakeholders:
1. **Patients:** Individuals and families seeking transparent diagnostic test search, real-time location-based lab discovery, easy home sample collection booking, live GPS tracking of collection agents, and a secure health records vault.
2. **Diagnostic Labs:** NABL-accredited and verified laboratory partners seeking an automated digital storefront to manage test catalogs, process bookings, assign phlebotomists, upload digital report PDFs, and track daily revenue.
3. **Phlebotomists:** Qualified sample collection agents equipped with an on-duty workflow interface to receive duty assignments, navigate turn-by-turn to patient locations, perform secure OTP-verified sample collections, and log sample handovers at processing labs.
4. **Platform Admin:** Platform administrators responsible for auditing lab applications, monitoring live platform order fulfillment, settling partner payouts, and resolving customer disputes.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LABEASE PLATFORM ECOSYSTEM                        │
│                                                                             │
│   ┌──────────────────┐    ┌──────────────────┐    ┌─────────────────────┐   │
│   │   PATIENT APP    │    │  LAB PARTNER APP │    │  PHLEBOTOMIST APP   │   │
│   │ • Lab Discovery  │    │ • Test Catalog   │    │ • Duty Queue        │   │
│   │ • Cart & Booking │    │ • Order Mgmt     │    │ • GPS Live Stream   │   │
│   │ • Live GPS Tracker│   │ • Phlebo Assign  │    │ • OTP Verification  │   │
│   │ • Health Vault   │    │ • PDF Uploads    │    │ • Lab Handover      │   │
│   └─────────┬────────┘    └─────────┬────────┘    └──────────┬──────────┘   │
│             │                       │                        │              │
│             └───────────────────────┼────────────────────────┘              │
│                                     │                                       │
│                       ┌─────────────▼──────────────┐                        │
│                       │    PLATFORM ADMIN PANEL    │                        │
│                       │ • Lab Audit & Approvals    │                        │
│                       │ • Global Order Monitoring  │                        │
│                       │ • Financial Commission     │                        │
│                       └─────────────┬──────────────┘                        │
└─────────────────────────────────────┼───────────────────────────────────────┘
                                      │
       ┌──────────────────────────────▼───────────────────────────────┐
       │                 BACKEND CORE REST & WEBSOCKETS               │
       │     (Node.js / Express v5 API + Socket.IO GPS Server)        │
       └──────────────────────────────┬───────────────────────────────┘
                                      │
       ┌──────────────────────────────▼───────────────────────────────┐
       │                SUPABASE CLOUD POSTGRES DB & STORAGE          │
       │   • Relational Schemas  • RLS Policies  • Cloud PDF Buckets  │
       └──────────────────────────────────────────────────────────────┘
```

---

## 1.2 Motivation and Background
The diagnostic sector in developing healthcare markets is valued at billions of dollars but suffers from severe operational inefficiencies:
* **Lack of Price Standardization:** Patients are often charged vastly different amounts for standard blood panels (e.g., Complete Blood Count, Lipid Profile, HbA1c) depending on the lab, with no centralized directory to compare prices.
* **Unpredictable Home Pickups:** Home collection services often rely on uncoordinated phone calls, leading to missed time windows, long wait times for fasting patients, and poor sample tracking.
* **Paper-Heavy & Disjointed Reports:** Diagnostic reports are distributed via paper copies or physical pickup, increasing the risk of lost records and delayed physician consultations.
* **Independent Lab Isolation:** Smaller, high-quality NABL-certified neighborhood labs lack the software engineering capital to build custom mobile or web applications to compete with mega-diagnostic chains.

LabEase addresses these challenges by introducing an enterprise-grade, multi-tenant digital platform built on modern open web technologies.

---

## 1.3 Objectives of the System
The primary goal of LabEase is to deliver a seamless, location-aware diagnostic booking experience while powering back-office operations for labs and field phlebotomists.

### Key Objectives:
1. **Location-Based Discovery & Price Transparency:** Provide patients with a map-enabled discovery engine to find labs within a customizable radial distance (e.g., 5km - 25km), sorted by price, distance, turnaround time (TAT), and verified patient reviews.
2. **Automated Home Collection Logistics & Live GPS Tracking:** Implement WebSockets (Socket.IO) for bi-directional live GPS updates, giving patients complete visibility of the phlebotomist’s arrival.
3. **Multi-Tenant Partner Operations:** Provide diagnostic labs with a dedicated management portal to maintain test catalogs, set package pricing, control slot capacity, assign phlebotomists, and dispatch PDF reports.
4. **End-to-End Sample Security & Verification:** Require a 4-digit OTP verification upon sample collection to validate patient identity and ensure chain-of-custody compliance.
5. **Centralized Health Records Vault:** Securely archive patient diagnostic history with cloud storage integration (Supabase Storage) and generate shareable public links with expiration timers for medical consultation.
6. **Platform Governance & Financial Automation:** Provide platform administrators with revenue split management (platform commission vs. lab payout), real-time order auditing, and partner verification pipelines.

---

## 1.4 Key Stakeholders and User Roles

| Stakeholder Role | Primary Functions & Responsibilities |
|---|---|
| **Patient** | Searches lab catalog, compares prices, manages patient addresses and family sub-profiles, books home sample collection or walk-in appointments, tracks phlebotomist location in real-time, views/downloads digital test reports, and submits lab reviews. |
| **Lab Partner / Staff** | Manages laboratory storefront profile, submits NABL accreditation documents, manages test and bundle package catalogs, accepts/rejects bookings, assigns on-duty phlebotomists, uploads PDF reports, and reviews earnings/payout analytics. |
| **Phlebotomist** | Toggles online/offline duty status, views daily assigned collection tasks, navigates turn-by-turn to patient location, validates patient identity via 4-digit OTP, collects biological samples, and completes lab drop-off handover. |
| **Platform Admin** | Audits and verifies new lab registrations, monitors platform-wide booking statuses, configures commission rates, authorizes financial payouts, and handles dispute resolution. |

---

## 1.5 Technological Stack Overview
* **Frontend:** React 19, React Router v7, Lucide React Icons, React Hot Toast, Vanilla CSS (Modern CSS Custom Properties & Glassmorphism Design System).
* **Build System:** Vite 6.
* **Backend Runtime:** Node.js (ES Modules), Express v5 Framework.
* **Real-Time Communication:** Socket.IO v4 (WebSockets for GPS streaming & status sync).
* **Database & Cloud:** Supabase PostgreSQL with Row-Level Security (RLS) policies, Custom SQL Migrations, and Supabase Storage Buckets.
* **Authentication:** Supabase Auth with custom React Auth Context.

---

## 1.6 Organization of the Report
This report is structured into eight detailed chapters:
* **Chapter 1: Introduction** — Introduces project vision, motivation, objectives, stakeholder roles, and technical stack.
* **Chapter 2: Problem Definition** — Details shortcomings of traditional diagnostic systems and presents the proposed LabEase solution.
* **Chapter 3: Scope of the System** — Maps functional/non-functional boundaries, user matrices, and out-of-scope future elements.
* **Chapter 4: System Analysis** — Details feasibility studies, workflow flowcharts, Data Flow Diagrams (DFDs), and UML diagrams.
* **Chapter 5: Requirement Analysis** — Provides full software/hardware requirements and functional requirements by module.
* **Chapter 6: Database Design** — Documents ER diagrams, table schemas, data dictionaries, indexes, and RLS policies.
* **Chapter 7: Future Scope** — Outlines future extensions like AI prescription OCR, LIS HL7 integration, and smart route optimization.
* **Chapter 8: Conclusion** — Summarizes system outcomes, technical achievements, and project concluding remarks.
