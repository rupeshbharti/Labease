# LABEASE: A LOCATION-AWARE THREE-SIDED MARKETPLACE PLATFORM FOR DIAGNOSTIC HEALTHCARE SERVICES

## COLLEGE PROJECT BLACK BOOK REPORT

---

### TABLE OF CONTENTS
1. [CHAPTER 1: INTRODUCTION](#chapter-1-introduction)
2. [CHAPTER 2: PROBLEM DEFINITION](#chapter-2-problem-definition)
3. [CHAPTER 3: SCOPE OF THE SYSTEM](#chapter-3-scope-of-the-system)
4. [CHAPTER 4: SYSTEM ANALYSIS](#chapter-4-system-analysis)
5. [CHAPTER 5: REQUIREMENT ANALYSIS](#chapter-5-requirement-analysis)
6. [CHAPTER 6: DATABASE DESIGN](#chapter-6-database-design)
7. [CHAPTER 7: FUTURE SCOPE](#chapter-7-future-scope)
8. [CHAPTER 8: CONCLUSION](#chapter-8-conclusion)

---

# CHAPTER 1: INTRODUCTION

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

## 1.2 Motivation and Background
The diagnostic sector in developing healthcare markets is valued at billions of dollars but suffers from severe operational inefficiencies:
* **Lack of Price Standardization:** Patients are often charged vastly different amounts for standard blood panels (e.g., Complete Blood Count, Lipid Profile, HbA1c) depending on the lab, with no centralized directory to compare prices.
* **Unpredictable Home Pickups:** Home collection services often rely on uncoordinated phone calls, leading to missed time windows, long wait times for fasting patients, and poor sample tracking.
* **Paper-Heavy & Disjointed Reports:** Diagnostic reports are distributed via paper copies or physical pickup, increasing the risk of lost records and delayed physician consultations.
* **Independent Lab Isolation:** Smaller, high-quality NABL-certified neighborhood labs lack the software engineering capital to build custom mobile or web applications to compete with mega-diagnostic chains.

LabEase addresses these challenges by introducing an enterprise-grade, multi-tenant digital platform built on modern open web technologies.

## 1.3 Objectives of the System
1. **Location-Based Discovery & Price Transparency:** Provide patients with a map-enabled discovery engine to find labs within a customizable radial distance (e.g., 5km - 25km), sorted by price, distance, turnaround time (TAT), and verified patient reviews.
2. **Automated Home Collection Logistics & Live GPS Tracking:** Implement WebSockets (Socket.IO) for bi-directional live GPS updates, giving patients complete visibility of the phlebotomist’s arrival.
3. **Multi-Tenant Partner Operations:** Provide diagnostic labs with a dedicated management portal to maintain test catalogs, set package pricing, control slot capacity, assign phlebotomists, and dispatch PDF reports.
4. **End-to-End Sample Security & Verification:** Require a 4-digit OTP verification upon sample collection to validate patient identity and ensure chain-of-custody compliance.
5. **Centralized Health Records Vault:** Securely archive patient diagnostic history with cloud storage integration (Supabase Storage) and generate shareable public links with expiration timers for medical consultation.
6. **Platform Governance & Financial Automation:** Provide platform administrators with revenue split management (platform commission vs. lab payout), real-time order auditing, and partner verification pipelines.

## 1.4 Key Stakeholders and User Roles

| Stakeholder Role | Primary Functions & Responsibilities |
|---|---|
| **Patient** | Searches lab catalog, compares prices, manages patient addresses and family sub-profiles, books home sample collection or walk-in appointments, tracks phlebotomist location in real-time, views/downloads digital test reports, and submits lab reviews. |
| **Lab Partner / Staff** | Manages laboratory storefront profile, submits NABL accreditation documents, manages test and bundle package catalogs, accepts/rejects bookings, assigns on-duty phlebotomists, uploads PDF reports, and reviews earnings/payout analytics. |
| **Phlebotomist** | Toggles online/offline duty status, views daily assigned collection tasks, navigates turn-by-turn to patient location, validates patient identity via 4-digit OTP, collects biological samples, and completes lab drop-off handover. |
| **Platform Admin** | Audits and verifies new lab registrations, monitors platform-wide booking statuses, configures commission rates, authorizes financial payouts, and handles dispute resolution. |

---

# CHAPTER 2: PROBLEM DEFINITION

## 2.1 Problem Statement
The diagnostic healthcare service delivery model in urban and semi-urban environments suffers from extreme fragmentation, informational asymmetry, and inefficient operational logistics. Patients requiring routine or specialized diagnostic tests currently encounter significant hurdles:
1. **Opaque Pricing & Hidden Costs:** Diagnostic laboratories operate independently without centralized price publishing.
2. **Uncertainty in Home Sample Pickups:** Traditional home collection booking is handled manually over phone calls without real-time tracking.
3. **Lack of Sample Traceability:** Zero visibility into sample transit status.
4. **Physical & Delayed Report Delivery:** Diagnostic results are still delivered largely via physical paper collection or disjointed emails.
5. **Operational Bottlenecks for Independent Labs:** Small-to-medium NABL-certified labs lack software infrastructure to build native web platforms.

## 2.2 Proposed System — LabEase
LabEase introduces an integrated, location-aware three-sided marketplace platform. By combining React 19 web interfaces, Node.js Express REST APIs, Socket.IO WebSockets, and Supabase PostgreSQL with Row-Level Security, LabEase delivers a modern, transparent, and scalable service delivery network.

---

# CHAPTER 3: SCOPE OF THE SYSTEM

## 3.1 Functional Scope
* **Patient Module:** Location search, cart checkout, slot booking, family profiles, live GPS tracking, digital report vault.
* **Lab Partner Module:** Storefront setup, NABL audit submission, test/package CRUD, phlebotomist assignment, PDF report upload, revenue analytics.
* **Phlebotomist Module:** Online/offline duty toggle, task queue, live GPS navigation streaming, 4-digit OTP verification, lab sample handover.
* **Platform Admin Module:** Lab onboarding verification, global order monitor, commission configuration, payout processing.
* **Backend API & WebSockets Module:** Express v5 REST endpoints, Socket.IO real-time engine, Supabase PostgreSQL with RLS.

---

# CHAPTER 4: SYSTEM ANALYSIS

## 4.1 Feasibility Study
* **Technical Feasibility:** React 19 + Node.js Express v5 + Socket.IO + Supabase PostgreSQL spatial indexing is highly feasible.
* **Operational Feasibility:** Role-tailored responsive web apps require zero software installation and deliver seamless UX.
* **Economic Feasibility:** Serverless Supabase infrastructure minimizes CAPEX while commission monetization ensures sustainable OPEX.
* **Schedule & Legal Feasibility:** 5-phase agile delivery timeline with NABL audit compliance.

---

# CHAPTER 5: REQUIREMENT ANALYSIS

## 5.1 Software & Hardware Requirements
* **Software:** Node.js v18/v20, React 19, Vite 6, Express v5, Socket.IO v4, Supabase PostgreSQL, VS Code.
* **Hardware Developer Specs:** Quad-core CPU, 8GB/16GB RAM, 256GB SSD.
* **Hardware Client Specs:** Modern HTML5 browser with GPS Location capability.

---

# CHAPTER 6: DATABASE DESIGN

## 6.1 Database Schema & Tables
Relational database created on Supabase PostgreSQL featuring 14 core tables:
`users`, `lab_partners`, `family_members`, `addresses`, `tests`, `packages`, `package_tests`, `bookings`, `booking_items`, `phlebotomist_assignments`, `phlebotomist_locations`, `reports`, `reviews`, `payouts`.
Row-Level Security (RLS) policies enforce multi-tenant isolation.

---

# CHAPTER 7: FUTURE SCOPE

## 7.1 Key Extensions
1. AI Prescription OCR Reader using Multimodal Computer Vision.
2. Direct HL7 & FHIR LIS/HIS automated synchronization.
3. Smart Traveling Salesman route optimization for phlebotomists.
4. IoT cold-chain temperature telemetry sensors.
5. Native iOS & Android React Native applications.
6. Integrated Doctor Teleconsultation video engine.

---

# CHAPTER 8: CONCLUSION

## 8.1 Summary
LabEase successfully digitizes, simplifies, and standardizes diagnostic healthcare bookings. By linking patients, labs, phlebotomists, and administrators through a location-aware web platform, LabEase creates a transparent, efficient, and scalable healthcare ecosystem.
