# Kapot Branding and Logo Design

## 1. Overview
The goal is to update the application's branding to the new product name, "Kapot" (which means "hood" in English), and to establish a consistent visual identity across the app.

## 2. Visual Theme and Colors
- **Core Palette**: A strict, minimalist monochrome (black and white) theme. 
- **Variables**: The `globals.css` will be maintained to ensure the primary elements (backgrounds, text, cards, primary buttons) rely on neutral shades (black/white/gray).
- **Goal**: Ensure sharp, high-contrast, and modern aesthetics across all UI components.

## 3. Logo Design
- **Style**: Typographic (Wordmark).
- **Component**: A reusable `<Logo />` component will be created (e.g., in `components/ui/logo.tsx`).
- **Design Details**: The word "Kapot" will be styled using Tailwind utility classes for a bold, modern look (e.g., `font-extrabold tracking-tighter`). It may incorporate a subtle, minimalist visual hook, such as an accent dot or a sleek underline, to give it an automotive/tech edge while keeping it strictly text-based.

## 4. Brand Consistency
- Global replacement of old product names (e.g., "CarCheck") with "Kapot".
- Updates will target:
  - Header component (`components/header.tsx`).
  - Application metadata (`app/layout.tsx` title and description).
  - Any other visible text references to the old brand.

## 5. Scope
This design is tightly scoped to styling updates, string replacements, and the creation of a single simple UI component. No major architectural changes are needed.