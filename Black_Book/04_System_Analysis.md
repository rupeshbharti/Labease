# CHAPTER 4: SYSTEM ANALYSIS

---

## 4.1 Feasibility Study
Before initiating system engineering, a comprehensive feasibility study was conducted across four critical dimensions: Technical, Operational, Economic, and Schedule/Legal Feasibility.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FEASIBILITY ANALYSIS                              │
│                                                                             │
│   ┌─────────────────────┐                   ┌─────────────────────┐         │
│   │ TECHNICAL           │                   │ OPERATIONAL         │         │
│   │ • React 19 / Vite   │                   │ • Intuitive Portals │         │
│   │ • Node.js / Express │                   │ • OTP Verification  │         │
│   │ • Socket.IO / GPS   │                   │ • Automated Workflows│        │
│   │ • Supabase Postgres │                   │ • Multi-role Access │         │
│   └──────────┬──────────┘                   └──────────┬──────────┘         │
│              │                                         │                    │
│              └────────────────────┬────────────────────┘                    │
│                                   │                                         │
│              ┌────────────────────┴────────────────────┐                    │
│              │                                         │                    │
│   ┌──────────▼──────────┐                   ┌──────────▼──────────┐         │
│   │ ECONOMIC            │                   │ SCHEDULE & LEGAL    │         │
│   │ • Low Infrastructure│                   │ • 5-Phase Timeline  │         │
│   │ • Commission Split  │                   │ • NABL Compliance   │         │
│   │ • Zero Lab Hardware │                   │ • Data Privacy RLS  │         │
│   └─────────────────────┘                   └─────────────────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1. Technical Feasibility
* **Core Stack Suitability:** The combination of React 19 (SPA frontend), Express v5 (Node.js REST API), Socket.IO v4 (WebSockets), and Supabase (PostgreSQL) represents a proven, high-performance technology stack capable of handling real-time geolocation streaming and asynchronous database transactions.
* **Geospatial Capabilities:** PostgreSQL supports native mathematical spatial indexing (`lat`, `lng` coordinates with Haversine radial distance formulas), enabling rapid lab location discovery within a fraction of a millisecond.
* **Conclusion:** The project is **Highly Feasible Technically**.

### 2. Operational Feasibility
* **User-Centric Workflows:** Separate role-tailored interfaces ensure zero operational complexity. Patients experience a streamlined booking flow similar to popular food delivery apps. Lab staff use a single web browser dashboard for order management and PDF report dispatch without installing proprietary desktop software.
* **Field Efficiency:** Phlebotomists operate a lightweight web app with online/offline duty toggles and turn-by-turn navigation links.
* **Conclusion:** The project is **Highly Feasible Operationally**.

### 3. Economic Feasibility
* **Cost-Effective Cloud Architecture:** Using Supabase's serverless tier for database, authentication, and file storage minimizes upfront capital expenditure (CAPEX).
* **Sustainable Marketplace Monetization:** LabEase operates on a commission model (15% per booking), covering platform operational costs (OPEX) while generating recurring net revenue. Labs incur no upfront software licensing fees.
* **Conclusion:** The project is **Highly Feasible Economically**.

### 4. Schedule & Legal Feasibility
* **Development Schedule:** Executed across 5 agile milestone phases within a 12-week timeframe.
* **Regulatory Compliance:** Audits require lab partners to upload official NABL accreditation certificates. Database security complies with healthcare privacy guidelines via strict Row-Level Security (RLS) data partitioning.
* **Conclusion:** The project is **Highly Feasible Legally and Schedule-wise**.

---

## 4.2 System Workflows & Flowcharts

### 1. End-to-End Booking & Fulfillment Flowchart
```
[ Patient ] ──► Search Lab by GPS ──► Add Tests/Packages to Cart ──► Select Time Slot & Address
                                                                             │
                                                                             ▼
[ Patient ] ◄── Receive 4-Digit OTP ◄── [ Backend Server ] ◄── Create Booking (Pending Acceptance)
                                                                             │
                                                                             ▼
[ Phlebotomist ] ◄── Assign On-Duty Phlebo ◄── [ Lab Partner ] ◄── Accept Booking Order
       │
       ▼
Start Journey ──► Stream Live GPS (Socket.IO) ──► Arrive at Address ──► Enter 4-Digit Patient OTP
                                                                               │
                                                                               ▼
[ Patient ] ◄── View Report PDF / Share Link ◄── Upload PDF ◄── Deposit Sample at Lab Processing
```

---

## 4.3 Data Flow Diagrams (DFD)

### DFD Level 0: System Context Diagram
```
                   ┌─────────────────────────────────────────┐
                   │               PATIENT                   │
                   └────┬───────────────────────────────▲────┘
                        │ Search, Bookings,             │ Live GPS, Reports,
                        │ Address, Family Info          │ Confirmation
                        ▼                               │
                   ┌─────────────────────────────────────────┐
                   │                                         │
┌──────────────┐   │                                         │   ┌──────────────────────┐
│ LAB PARTNER  ├──►│           LABEASE SYSTEM                ├──►│    PHLEBOTOMIST      │
│              │◄──┤           CORE PLATFORM                 │◄──┤                      │
└──────────────┘   │                                         │   └──────────────────────┘
  Catalog CRUD,    │                                         │     Duty Status, GPS,
  Phlebo Assign,   └────────────────────┬────────────────────┘     OTP Verification,
  PDF Reports                           │                          Sample Deposit
                                        │ Audit & Financials
                                        ▼
                   ┌─────────────────────────────────────────┐
                   │             PLATFORM ADMIN              │
                   └─────────────────────────────────────────┘
```

### DFD Level 1: Subsystem Data Flow
```
Patient Data ──► [ Process 1.0: Discovery & Search ] ──► Fetch Nearby Labs ──► ( D1: Lab Partners )
                                                                                     │
Cart Items   ──► [ Process 2.0: Booking Management ] ──► Save Booking       ──► ( D2: Bookings )
                                                                                     │
Accept Order ──► [ Process 3.0: Assignment & Duty  ] ──► Assign Phlebo      ──► ( D3: Assignments )
                                                                                     │
GPS Stream   ──► [ Process 4.0: Live GPS Engine    ] ──► Broadcast Location ──► ( D4: GPS Logs )
                                                                                     │
OTP Input    ──► [ Process 5.0: Verification Engine] ──► Validate OTP Code   ──► ( D2: Bookings )
                                                                                     │
PDF Upload   ──► [ Process 6.0: Report & Storage   ] ──► Store Cloud PDF    ──► ( D5: Reports )
```

---

## 4.4 Unified Modeling Language (UML) Diagrams

### 1. Use Case Diagram
```
                             LABEASE SYSTEM BOUNDARY
   ┌──────────────────────────────────────────────────────────────────────────┐
   │                                                                          │
   │   ( Search Labs by Radius & Price )                                      │
   │   ( Book Home Collection Slot ) ◄─────────────────────────┐              │
   │   ( Track Phlebotomist via Live GPS )                     │              │
   │   ( Download & Share PDF Report )                         │              │
   │                                                           │              │
   │   ( Setup Storefront & NABL Audit )                       │              │
   │   ( Manage Test & Package Catalog )                       │              │
   │   ( Assign Phlebotomist to Order )                        │              │
   │   ( Upload Diagnostic PDF Report )                        │              │
   │                                                           │              │
   │   ( Toggle Online/Offline Duty )                          │              │
   │   ( Stream GPS Location )                                 │              │
   │   ( Validate 4-Digit Patient OTP )                        │              │
   │   ( Confirm Lab Sample Handover )                         │              │
   │                                                           │              │
   │   ( Audit & Approve Lab Partners )                        │              │
   │   ( Configure Commission Rates )                          │              │
   │   ( Process Revenue Payouts )                             │              │
   └───────────────────────────────────────────────────────────┼──────────────┘
          ▲                         ▲                   ▲      │
          │                         │                   │      │
      [ Patient ]             [ Lab Owner ]       [ Phlebo ]   └─ [ Admin ]
```

### 2. Sequence Diagram: Booking Creation, Tracking & Fulfillment
```
Patient               Lab Partner            Phlebotomist           Backend Server          Database
   │                       │                      │                       │                    │
   │─── Search Labs ─────────────────────────────────────────────────────►│                    │
   │◄── Return Sorted Labs ───────────────────────────────────────────────│                    │
   │                       │                      │                       │                    │
   │─── Create Booking ──────────────────────────────────────────────────►│                    │
   │                       │                      │                       │─── Insert Booking─►│
   │◄── Booking Confirmed (OTP Generated) ────────────────────────────────│                    │
   │                       │                      │                       │                    │
   │                       │◄── Notify Order ─────┼───────────────────────│                    │
   │                       │─── Assign Phlebo ────┼──────────────────────►│                    │
   │                       │                      │                       │─── Save Assign ───►│
   │                       │                      │◄── Notify Duty Task ──│                    │
   │                       │                      │                       │                    │
   │                       │                      │── Start Journey ─────►│                    │
   │                       │                      │── Stream GPS Location►│                    │
   │◄──────────────────────┼──────────────────────┼── Broadcast Location ─│                    │
   │                       │                      │                       │                    │
   │                       │                      │── Input 4-Digit OTP ─►│                    │
   │                       │                      │                       │── Verify OTP ─────►│
   │                       │                      │◄── Sample Collected ──│                    │
   │                       │                      │                       │                    │
   │                       │◄── Handover Sample ──│                       │                    │
   │                       │─── Upload Report PDF ───────────────────────►│                    │
   │                       │                      │                       │── Store Cloud PDF─►│
   │◄── Notify Report Ready (Download Link) ──────────────────────────────│                    │
```

### 3. State Machine Diagram: Booking Lifecycle
```
 [*] ──► Pending Lab Acceptance ──► Confirmed ──► Phlebotomist Assigned
                                      │                  │
                                      ▼                  ▼
                                  Cancelled          En Route
                                                         │
                                                         ▼
                                                      Arrived
                                                         │
                                                         ▼
                                                  Sample Collected
                                                         │
                                                         ▼
                                              Sample Received at Lab
                                                         │
                                                         ▼
                                                    Processing
                                                         │
                                                         ▼
                                                   Report Ready ──► [*]
```
