---
name: Clinical Clarity
colors:
  surface: '#f9f9ff'
  surface-dim: '#cadbfc'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dfe8ff'
  surface-container-highest: '#d6e3ff'
  on-surface: '#091c35'
  on-surface-variant: '#434654'
  inverse-surface: '#20314b'
  inverse-on-surface: '#ecf0ff'
  outline: '#737685'
  outline-variant: '#c3c6d6'
  surface-tint: '#0c56d0'
  primary: '#003d9b'
  on-primary: '#ffffff'
  primary-container: '#0052cc'
  on-primary-container: '#c4d2ff'
  inverse-primary: '#b2c5ff'
  secondary: '#00687a'
  on-secondary: '#ffffff'
  secondary-container: '#6ae1ff'
  on-secondary-container: '#006374'
  tertiary: '#432f9c'
  on-tertiary: '#ffffff'
  tertiary-container: '#5b49b5'
  on-tertiary-container: '#d5ccff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b2c5ff'
  on-primary-fixed: '#001848'
  on-primary-fixed-variant: '#0040a2'
  secondary-fixed: '#adecff'
  secondary-fixed-dim: '#5dd6f3'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5d'
  tertiary-fixed: '#e5deff'
  tertiary-fixed-dim: '#c9bfff'
  on-tertiary-fixed: '#1a0063'
  on-tertiary-fixed-variant: '#4633a0'
  background: '#f9f9ff'
  on-background: '#091c35'
  surface-variant: '#d6e3ff'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 60px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  price-display:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 48px
  max-width: 1200px
---

## Brand & Style
The design system is centered on the concept of "Guided Confidence." For patients navigating healthcare decisions, the interface must act as a calm, expert facilitator. The aesthetic is **Corporate Modern** with a lean toward **Minimalism**, prioritizing information density without sacrificing breathing room.

The emotional response should be one of clinical reliability and warmth. We achieve this by combining a structured, grid-based layout with soft organic shapes and a color palette that feels hygienic yet inviting. The UI avoids unnecessary decorative elements, ensuring that user attention is directed entirely toward making informed medical choices.

## Colors
The palette utilizes a "Medical Blue" primary to establish authority and trust. The "Care Teal" secondary color is used for success states, active highlights, and positive health indicators. 

- **Primary (#0052CC):** Used for primary actions, branding, and navigation headers.
- **Secondary (#00A3BF):** Used for secondary buttons, status badges (e.g., "Available"), and supportive iconography.
- **Surface:** A heavy reliance on pure white (#FFFFFF) for card backgrounds, with a very light cool gray (#F4F5F7) for page backgrounds to define card boundaries.
- **Semantic:** Red-600 for urgent alerts, Amber-500 for low availability or warnings.

## Typography
Inter is used across the entire system for its exceptional legibility and neutral, professional character. 

Hierarchy is established through weight rather than dramatic size shifts, keeping the UI compact. **Display-lg** is reserved for marketing hero sections. **Headline-lg** is the primary screen title. **Price-display** is a specialized token used in marketplace cards to ensure cost transparency is immediate. Tabular figures should be enabled for all price and rating displays to ensure vertical alignment in comparison lists.

## Layout & Spacing
The system uses an 8px spatial grid. Layouts are strictly aligned to this rhythm to maintain a sense of order. 

- **Mobile:** A single-column fluid layout with 16px side margins. Cards span the full width of the container minus margins.
- **Desktop:** A 12-column fixed grid (max-width: 1200px) with 24px gutters. Marketplace results use a sidebar-main configuration (3 columns for filters, 9 columns for results).
- **Density:** Information-heavy cards (e.g., test results) use 'sm' (12px) internal padding to maximize data visibility, while content-heavy pages use 'lg' (24px) padding for readability.

## Elevation & Depth
This design system uses **Tonal Layers** combined with low-opacity **Ambient Shadows** to create depth. 

- **Level 0 (Background):** #F4F5F7. Used for the base canvas.
- **Level 1 (Cards/Surface):** #FFFFFF. Used for all primary content containers. These feature a subtle 1px border (#EBECF0) and a very soft shadow (0px 2px 4px rgba(0,0,0,0.05)).
- **Level 2 (Hover/Active):** Raised cards use a more pronounced shadow (0px 8px 16px rgba(0,0,0,0.08)) to indicate interactivity.
- **Level 3 (Modals):** High-elevation shadow (0px 12px 24px rgba(0,0,0,0.12)) with a 40% opacity neutral-800 backdrop blur.

## Shapes
The shape language is "Approachable Geometric." All standard components (buttons, inputs, cards) use a base radius of 8px (Level 2). 

- **Base Radius (8px):** Primary buttons, text inputs, small cards.
- **Large Radius (16px):** Main marketplace cards, modal containers.
- **Pill Radius (Full):** Status chips, filter tags, and "Quick Action" buttons.
Consistency in corner radii is critical to maintaining the professional healthcare look; avoid mixing sharp and overly rounded corners.

## Components
### Marketplace Cards
The core component of the system.
- **Structure:** Top-aligned title, star rating with teal accents, price in Primary Blue at bottom-right.
- **Interaction:** Entire card area is clickable, with a subtle background shift to Neutral-50 on hover.

### Buttons
- **Primary:** Solid Primary Blue with white text. 8px radius.
- **Secondary:** Ghost style with Care Teal border and text. 
- **Tertiary:** Text-only for "View Details" or "Cancel" actions.

### Data Inputs
- **Search Bar:** Large 48px height, 8px radius, includes a leading "search" icon in Neutral-400.
- **Selectors:** Use a standard 1px border. Focus state uses a 2px Primary Blue ring.

### Status Chips
- Small, pill-shaped indicators for "Fast Results," "Top Rated," or "Insurance Accepted." Use low-saturation backgrounds (e.g., Light Teal for positive, Light Gray for neutral) with high-contrast text.

### List Items
- Used for navigation settings or filter menus. 16px padding with a subtle bottom divider (#EBECF0). Icons should be 20px, centered in a 32px soft-blue circle background.