# PRD — Lab Partner App (Marketplace Dashboard)
## LabEase

**Version:** 1.0  
**Module:** Lab Partner App  
**Type:** Marketplace Seller Dashboard (Zomato Restaurant Model)

---

# 1. Overview

The Lab Partner App is the **provider-facing dashboard** of LabEase.

It enables labs to:
- Manage bookings (accept/reject)
- Control pricing & catalog
- Handle operations
- Upload reports
- Maintain profile visibility

---

# 2. Goals

### Primary Goals
- Enable efficient order management
- Reduce manual operations
- Improve lab visibility & conversion

### Success Metrics
- Order acceptance rate > 90%
- Report upload time < 12 hours
- Lab response time < 2 minutes

---

# 3. Core Workflow

Incoming Order → Accept/Reject → Assign → Process → Upload Report

---

# 4. Features & Functional Requirements

## 4.1 Dashboard (Home)

### UI Components:
- Total Orders Today
- Pending Orders
- Completed Orders
- Revenue Summary

---

## 4.2 Order Management

### Features:
- View incoming orders in real-time
- Accept / Reject booking
- View order details:
  - Patient info
  - Tests
  - Slot
  - Address

### UI:
- Order Card:
  - Status Badge
  - Accept / Reject Buttons

---

## 4.3 Test Catalog Management

### Features:
- Add / Edit / Delete tests
- Create packages
- Set:
  - Price
  - TAT
  - Preparation instructions

### UI:
- Table View:
  - Test Name | Price | Status | Edit

---

## 4.4 Pricing Management

- Dynamic pricing per test
- Discounts & offers
- Surge pricing (optional)

---

## 4.5 Slot & Availability Management

### Features:
- Set working hours
- Define available slots
- Block dates/times

### UI:
- Calendar View
- Slot toggles

---

## 4.6 Report Upload

### Features:
- Upload PDF reports
- Attach to booking ID
- Version control

### UI:
- Upload button
- File preview

---

## 4.7 Profile Management

### Features:
- Lab details:
  - Name
  - Address
  - Images
  - Description
- Ratings & reviews display

### UI:
- Profile page
- Image upload section

---

# 5. UI Wireframes (Textual)

## Dashboard
[Stats Cards]
[Order Summary]
[Recent Orders]

---

## Orders Page
--------------------------------
| Order #123 | Pending | Accept |
--------------------------------

---

## Catalog Page
--------------------------------
| Test | Price | Edit |
--------------------------------

---

## Calendar (Slots)
[Calendar View]
[Time Slots Toggle]

---

## Report Upload
[Upload PDF]
[Submit]

---

## Profile Page
[Lab Images]
[Details]
[Ratings]

---

# 6. Non-Functional Requirements

- Real-time updates
- Fast UI (<2 sec load)
- Secure report handling
- Role-based access

---

# 7. Future Enhancements

- Analytics dashboard
- AI pricing suggestions
- Lab performance insights
- Multi-branch support

---

