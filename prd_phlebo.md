# PRD — Phlebotomist App (Delivery Partner App)
## LabEase

**Version:** 1.0  
**Module:** Phlebotomist App  
**Type:** Delivery Partner App (Zomato Delivery Model)

---

# 1. Overview

The Phlebotomist App is the **field-execution app** of LabEase.

It enables phlebotomists to:
- Manage daily collection tasks
- Navigate to patient locations
- Complete sample collection workflows
- Provide proof of service
- Track earnings and availability

---

# 2. Goals

### Primary Goals
- Ensure smooth and timely sample collection
- Provide clear task workflows
- Enable real-time tracking & updates

### Success Metrics
- Task completion rate > 95%
- On-time arrival rate > 90%
- Average collection time < 15 mins

---

# 3. Core Workflow

Go Online → Receive Tasks → Accept Task → Navigate → Collect Sample → Submit Proof → Complete

---

# 4. Features & Functional Requirements

## 4.1 Authentication & Availability

### Features:
- Login via credentials (provided by admin)
- Toggle:
  - Online (available for tasks)
  - Offline (not available)

### UI:
- Profile header
- Status toggle (Online / Offline)

---

## 4.2 Task List (Daily Jobs)

### Features:
- View assigned tasks
- Sorted by time
- Task details:
  - Patient Name
  - Address
  - Tests
  - Time slot

### UI:
- Task Cards:
  - Time
  - Location
  - Status

---

## 4.3 Task Actions

### Features:
- Accept / Reject task
- Mark status:
  - En Route
  - Arrived
  - Collected

### UI:
- Action buttons on task card

---

## 4.4 Navigation

### Features:
- Open location in Google Maps
- One-click navigation

### UI:
- “Navigate” button

---

## 4.5 Sample Collection Flow

### Steps:
1. Arrive at location
2. Perform checklist
3. Upload proof

### Proof:
- Photo of sample
- OTP from patient

---

## 4.6 Proof Upload

### Features:
- Capture image
- Enter OTP
- Submit

### UI:
- Camera button
- OTP input field
- Submit button

---

## 4.7 Earnings Dashboard

### Features:
- Daily earnings
- Weekly summary
- Completed tasks count

### UI:
- Earnings cards
- Graph (optional)

---

# 5. UI Wireframes (Textual)

## Home / Dashboard
[Online Toggle]
[Today’s Tasks]
[Quick Stats]

---

## Task List
--------------------------------
| 10:00 AM | Patient A | Pending |
--------------------------------

---

## Task Detail
[Patient Info]
[Address]
[Tests]
[Buttons: Accept / Reject]

---

## Navigation Screen
[Map Button]

---

## Collection Screen
[Checklist]
[Upload Photo]
[Enter OTP]
[Submit]

---

## Earnings Screen
[Today Earnings]
[Weekly Summary]

---

# 6. Non-Functional Requirements

- Offline support
- Fast performance (<2 sec load)
- Real-time sync
- Secure data handling

---

# 7. Future Enhancements

- Route optimization (multiple tasks)
- Incentive system
- Performance ratings
- Voice navigation support

---

