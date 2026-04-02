# Kapot Branding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the "Kapot" rebranding by applying a minimalist monochrome theme and a typographic logo component.

**Architecture:** Create a reusable `<Logo />` component and use it across the app (like header). Clean up global CSS to ensure a strict black-and-white (monochrome) theme, removing or standardizing stray colors. Update metadata in layout files.

**Tech Stack:** React, Next.js (App Router), Tailwind CSS, lucide-react.

---

### Task 1: Consolidate and Clean Up Global CSS Theme

**Files:**
- Modify: `app/globals.css` (or `styles/globals.css`, whichever is active)
- Delete: Redundant `globals.css` if both exist.

- [ ] **Step 1: Check which `globals.css` is active and remove duplicate**
Run: `ls app/globals.css styles/globals.css`
If both exist, check `components.json` or `layout.tsx` to see which is imported, and delete the unused one.

- [ ] **Step 2: Modify `globals.css` for strict monochrome theme**
Update the active `globals.css`. Ensure primary, background, and foreground colors are strictly black, white, and shades of gray.

```css
@import 'tailwindcss';
@import 'tw-animate-css';

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.145 0 0);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.145 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.145 0 0);
  --destructive: oklch(0.577 0.245 27.325); /* Keep for errors */
  --destructive-foreground: oklch(1 0 0);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.145 0 0);
  --radius: 0.5rem;
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.145 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.145 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.145 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.396 0.141 25.723);
  --destructive-foreground: oklch(0.985 0 0);
  --border: oklch(0.269 0 0);
  --input: oklch(0.269 0 0);
  --ring: oklch(0.985 0 0);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  /* other standard mappings */
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 3: Commit CSS changes**
```bash
git add app/globals.css styles/globals.css
git commit -m "style: enforce strict monochrome theme"
```

---

### Task 2: Create Typographic Logo Component

**Files:**
- Create: `components/ui/logo.tsx`

- [ ] **Step 1: Write the Logo component**
Create a new file with a minimalist typographic logo.

```tsx
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  withLink?: boolean;
}

export function Logo({ className, withLink = true }: LogoProps) {
  const content = (
    <div className={cn("flex items-baseline font-extrabold tracking-tighter text-xl", className)}>
      <span>Kapot</span>
      <span className="text-primary w-1.5 h-1.5 ml-[1px] bg-foreground rounded-full inline-block" />
    </div>
  );

  if (withLink) {
    return (
      <Link href="/" className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
```

- [ ] **Step 2: Commit Logo component**
```bash
git add components/ui/logo.tsx
git commit -m "feat: add typographic Kapot logo component"
```

---

### Task 3: Replace Branding in Header

**Files:**
- Modify: `components/header.tsx`

- [ ] **Step 1: Import and use Logo in Header**
Replace the "CarCheck" text with the new `<Logo />` component.

```tsx
// Inside components/header.tsx
// Add import:
import { Logo } from "@/components/ui/logo";

// Replace:
// <Link href="/" className="font-bold text-lg">
//   CarCheck
// </Link>
//
// With:
// <Logo />
```

- [ ] **Step 2: Commit Header changes**
```bash
git add components/header.tsx
git commit -m "feat: use Kapot logo in header"
```

---

### Task 4: Update Application Metadata

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update metadata text**

```tsx
// Inside app/layout.tsx
// Update the metadata export:

export const metadata: Metadata = {
  title: "Kapot",
  description: "Minimalist car evaluation and checking",
};
```

- [ ] **Step 2: Test the build**
Run: `npm run build`
Ensure no typing or routing errors occur due to the changes.

- [ ] **Step 3: Commit Metadata changes**
```bash
git add app/layout.tsx
git commit -m "chore: update app metadata to Kapot"
```