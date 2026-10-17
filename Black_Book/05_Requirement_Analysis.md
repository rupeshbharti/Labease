# CHAPTER 5: REQUIREMENT ANALYSIS

---

## 5.1 Functional Requirements

### 1. Patient Portal Requirements
* **FR-PAT-01:** The system shall automatically detect user geolocation or allow manual entry of pin code / address.
* **FR-PAT-02:** The system shall display lab search results filtered by distance radius (5km–25km), price, rating, and turnaround time.
* **FR-PAT-03:** The system shall allow patients to manage multiple saved delivery addresses (Home, Work, Other) with latitude/longitude coordinates.
* **FR-PAT-04:** The system shall enable patients to maintain family member sub-profiles (Name, DOB, Gender, Relation) and select sub-profiles during booking checkout.
* **FR-PAT-05:** The system shall calculate total cart amounts including test prices, home collection fees, and promo code discounts.
* **FR-PAT-06:** The system shall present a 4-digit security OTP code upon booking confirmation for validation during home collection.
* **FR-PAT-07:** The system shall render a real-time GPS tracking dashboard displaying live phlebotomist movement on a map, current ETA, and step-by-step order progress.
* **FR-PAT-08:** The system shall provide access to historical test records and enable instant PDF report downloading and shareable public link generation.

### 2. Lab Partner Portal Requirements
* **FR-LAB-01:** The system shall allow lab administrators to register lab profiles, set service radii, upload photos, and attach NABL certificates.
* **FR-LAB-02:** The system shall provide full CRUD capabilities for individual diagnostic tests (Code, Name, Category, Sample Type, Fasting, TAT, Price).
* **FR-LAB-03:** The system shall allow lab partners to group individual tests into discounted multi-test health packages.
* **FR-LAB-04:** The system shall display incoming booking requests and allow staff to accept or reject orders.
* **FR-LAB-05:** The system shall display an active roster of phlebotomists filtered by duty status (online/offline) for order assignment.
* **FR-LAB-06:** The system shall provide a multi-file PDF report upload interface linked directly to patient booking records.
* **FR-LAB-07:** The system shall provide financial analytics displaying total bookings, Gross Merchandise Value (GMV), platform commission deductions, and net lab revenue.

### 3. Phlebotomist Portal Requirements
* **FR-PHL-01:** The system shall provide a single-tap online/offline duty status toggle.
* **FR-PHL-02:** The system shall display a chronologically ordered daily task queue of assigned home collection bookings.
* **FR-PHL-03:** The system shall stream phlebotomist device GPS coordinates (`lat`, `lng`) to the server via Socket.IO at regular intervals when en route.
* **FR-PHL-04:** The system shall require input of the 4-digit patient OTP code to unlock sample collection confirmation.
* **FR-PHL-05:** The system shall record sample deposit verification at the processing laboratory to transfer sample custody.

### 4. Platform Admin Panel Requirements
* **FR-ADM-01:** The system shall present a verification queue of pending lab partner registrations alongside submitted NABL accreditation documents.
* **FR-ADM-02:** The system shall enable platform admins to approve, request revisions for, or reject lab registrations.
* **FR-ADM-03:** The system shall provide a global live order monitor tracking all active platform bookings.
* **FR-ADM-04:** The system shall allow configuration of platform commission percentages (global default and lab-specific overrides).
* **FR-ADM-05:** The system shall generate weekly/monthly financial payout summaries for partner laboratories.

---

## 5.2 Non-Functional Requirements

### 1. Performance Requirements
* **NFR-PERF-01:** REST API endpoint response time shall not exceed 200 milliseconds under standard operating load.
* **NFR-PERF-02:** Socket.IO WebSocket location broadcast latency shall be under 1,000 milliseconds (1 second).
* **NFR-PERF-03:** First Contentful Paint (FCP) of the React SPA application shall load within 1.5 seconds on standard 4G network connections.

### 2. Security Requirements
* **NFR-SEC-01:** All client-server communication must be encrypted in transit using TLS 1.3.
* **NFR-SEC-02:** Database tables must enforce tenant isolation using Supabase Row-Level Security (RLS) policies based on user authentication tokens.
* **NFR-SEC-03:** Diagnostic report PDF files stored in cloud storage must be accessible only via authenticated user sessions or time-limited shareable UUID tokens.
* **NFR-SEC-04:** 4-digit collection OTP codes must be cryptographically generated and validated server-side.

### 3. Reliability & Availability Requirements
* **NFR-REL-01:** The platform target availability shall be 99.9% uptime.
* **NFR-REL-02:** In the event of temporary WebSocket disconnection, the client app shall fall back gracefully to periodic HTTP polling without breaking the tracking UI.

### 4. Maintainability & Usability Requirements
* **NFR-MAINT-01:** Codebase must follow modular ES Module standards, separating React components (`src/`), Express REST routes (`server/routes/`), and database migrations (`supabase/migrations/`).
* **NFR-USA-01:** UI components must adhere to a responsive mobile-first design system utilizing standardized CSS custom variables and accessible color contrasts.

---

## 5.3 Software Requirements

### Development & Execution Environment:
* **Operating System:** Windows 10/11, macOS, or Linux (Ubuntu 22.04 LTS).
* **Runtime Environment:** Node.js (v18.x or v20.x LTS).
* **Frontend Framework:** React 19.0.0.
* **Routing Library:** React Router DOM v7.1.0.
* **Build Tool:** Vite 6.0.0.
* **Backend Web Framework:** Express.js v5.2.1.
* **Real-Time Engine:** Socket.IO v4.8.3 (Server & Client).
* **Database & Cloud Services:** Supabase PostgreSQL with `@supabase/supabase-js` v2.49.0.
* **UI Components & Icons:** Lucide React v0.460.0, React Hot Toast v2.5.0, Vanilla CSS.
* **Utility Libraries:** Axios v1.7.0, Cors v2.8.6, Multer v2.2.0, Dotenv v17.4.2.
* **IDE & Tools:** Visual Studio Code, Git Version Control.

---

## 5.4 Hardware Requirements

### 1. Developer Workstation Minimum Specifications
* **Processor:** Intel Core i5 / AMD Ryzen 5 (Quad-Core 2.5 GHz or higher).
* **RAM:** 8 GB DDR4 minimum (16 GB recommended).
* **Storage:** 256 GB Solid State Drive (SSD).
* **Network:** High-speed broadband internet (10 Mbps+).

### 2. Production Server / Cloud Host Specifications
* **Application Server:** Node.js Container (1 vCPU, 2 GB RAM minimum, scalable compute).
* **Database Server:** Managed Supabase PostgreSQL instance (Compute Add-on, SSD Storage with WAL backup).
* **Storage Bucket:** Supabase Cloud Storage (S3-compatible, multi-region redundancy).

### 3. End-User Device Specifications
* **Patient / Lab / Admin Device:** Any modern web browser (Google Chrome v110+, Mozilla Firefox v110+, Apple Safari v16+, Microsoft Edge v110+).
* **Phlebotomist Mobile Device:** Android smartphone or iPhone with GPS Location Services enabled and HTML5 Geolocation API support.
