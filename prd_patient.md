# PRD — Patient App (Marketplace UI)
## LabEase

**Version:** 1.0  
**Module:** Patient App  
**Type:** Marketplace (Zomato-style)

---

# 1. Overview

The Patient App is the **consumer-facing marketplace interface** of LabEase.

It enables users to:
- Discover diagnostic tests
- Compare labs
- Book services
- Track sample collection
- Access reports

---

# 2. Goals

### Primary Goals
- Enable seamless test discovery
- Improve booking conversion rate
- Provide transparency (price, rating, TAT)

### Success Metrics
- Conversion Rate > 25%
- Avg booking time < 2 minutes
- Repeat users > 40%

---

# 3. Core User Flow

Search → Compare Labs → Select Lab → Book → Track → Download Report

---

# 4. Features & Functional Requirements

## 4.1 Search & Discovery

- Users can search tests by name (e.g., "CBC", "Thyroid")
- Auto-suggestions enabled
- Categories:
  - Full Body Checkup
  - Diabetes
  - Women's Health

---

## 4.2 Lab Listing (Marketplace View)

### UI Components:
- Lab Card:
  - Lab Name
  - Rating ⭐
  - Distance 📍
  - Price 💰
  - TAT ⏱
  

### Features:
- Sort by:
  - Price
  - Rating
  - Distance
- Filters:
  - Fastest Report
  - Home Collection Available

---

## 4.3 Lab Detail Page

### UI Sections:
- Lab Images (carousel)
- Ratings & Reviews
- Available Tests
- Pricing
- Book Now Button

---

## 4.4 Comparison Feature

- Compare up to 3 labs
- Show:
  - Price
  - Rating
  - Distance
  - TAT

---

## 4.5 Booking Flow

### Steps:
1. Select Test
2. Select Lab
3. Choose:
   - Home Collection / Lab Visit
4. Select Slot
5. Confirm Booking
6. Payment

---

## 4.6 Live Tracking

### UI:
- Map view
- Phlebotomist location
- ETA

### Status:
- Assigned
- En Route
- Arrived
- Collected

---

## 4.7 Reports

- View PDF
- Download
- Share link

---

# 5. UI Wireframe (Textual)

## Home Screen
[Search Bar]
[Categories]
[Top Labs Nearby]

---

## Lab Listing
[Filters] [Sort]
--------------------------------
| Lab A ⭐4.5 | ₹500 | 2km |
--------------------------------

---

## Lab Detail
[Images]
[Rating]
[Book Button]

---

## Booking Screen
[Test Summary]
[Select Slot]
[Confirm]

---

## Tracking Screen
[Map]
[Status]

---

## Reports Screen
[List of Reports]
[Download]

---

# 6. Non-Functional Requirements

- Load time < 2 sec
- Secure data handling
- Mobile-first UI

---

# 7. Future Enhancements

- AI test recommendations
- Health dashboard
- Doctor consultation

---

