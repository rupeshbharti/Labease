// ============================================================
// LabEase — Constants & Enums
// ============================================================

// User Roles
export const USER_ROLES = {
  PATIENT: 'patient',
  LAB_STAFF: 'lab_staff',
  PHLEBOTOMIST: 'phlebotomist',
  PLATFORM_ADMIN: 'platform_admin',
};

export const ROLE_LABELS = {
  [USER_ROLES.PATIENT]: 'Patient',
  [USER_ROLES.LAB_STAFF]: 'Lab Partner',
  [USER_ROLES.PHLEBOTOMIST]: 'Phlebotomist',
  [USER_ROLES.PLATFORM_ADMIN]: 'Platform Admin',
};

// Role-based dashboard routes
export const ROLE_DASHBOARDS = {
  [USER_ROLES.PATIENT]: '/patient',
  [USER_ROLES.LAB_STAFF]: '/lab',
  [USER_ROLES.PHLEBOTOMIST]: '/phlebo',
  [USER_ROLES.PLATFORM_ADMIN]: '/admin',
};

// Lab Partner Status
export const LAB_STATUS = {
  PENDING_REVIEW: 'pending_review',
  VERIFIED: 'verified',
  LIVE: 'live',
  SUSPENDED: 'suspended',
};

export const LAB_STATUS_LABELS = {
  [LAB_STATUS.PENDING_REVIEW]: 'Pending Review',
  [LAB_STATUS.VERIFIED]: 'Verified',
  [LAB_STATUS.LIVE]: 'Live',
  [LAB_STATUS.SUSPENDED]: 'Suspended',
};

export const LAB_STATUS_COLORS = {
  [LAB_STATUS.PENDING_REVIEW]: 'warning',
  [LAB_STATUS.VERIFIED]: 'info',
  [LAB_STATUS.LIVE]: 'success',
  [LAB_STATUS.SUSPENDED]: 'error',
};

// Booking Status
export const BOOKING_STATUS = {
  PENDING_LAB_ACCEPTANCE: 'pending_lab_acceptance',
  CONFIRMED: 'confirmed',
  PHLEBOTOMIST_ASSIGNED: 'phlebotomist_assigned',
  EN_ROUTE: 'en_route',
  ARRIVED: 'arrived',
  SAMPLE_COLLECTED: 'sample_collected',
  SAMPLE_RECEIVED_AT_LAB: 'sample_received_at_lab',
  PROCESSING: 'processing',
  REPORT_READY: 'report_ready',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  CASH_ON_COLLECTION: 'cash_on_collection',
  REFUNDED: 'refunded',
};

// Collection Mode
export const COLLECTION_MODE = {
  HOME_COLLECTION: 'home_collection',
  WALK_IN: 'walk_in',
};

// Assignment Status
export const ASSIGNMENT_STATUS = {
  ASSIGNED: 'assigned',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  EN_ROUTE: 'en_route',
  ARRIVED: 'arrived',
  COLLECTED: 'collected',
  FAILED: 'failed',
};

// Payout Status
export const PAYOUT_STATUS = {
  SCHEDULED: 'scheduled',
  PROCESSING: 'processing',
  PAID: 'paid',
  FAILED: 'failed',
};

// API Base URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
