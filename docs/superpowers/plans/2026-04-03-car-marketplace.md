# Car Marketplace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** To build a simple car marketplace where users can list their evaluated cars for sale and view listings from others.

**Architecture:** A new page will be added to the Next.js application to display the marketplace listings. The data will be stored in a new `listings` collection in Firestore. The existing car evaluation flow will be modified to allow users to list their car for sale after receiving an evaluation.

**Tech Stack:** Next.js, TypeScript, Firebase/Firestore, Tailwind CSS, shadcn/ui

---

### Task 1: Create Firestore `listings` collection

**Files:**
- This task is performed in the Firebase console.

- [ ] **Step 1: Create the `listings` collection**
  - In the Firebase console, create a new top-level collection named `listings`.
  - This collection will store the documents for each car listing.
  - You do not need to add any documents yet.

- [ ] **Step 2: Set up Firestore security rules**
  - In the Firebase console, go to Firestore Database -> Rules.
  - Add the following rules to allow reading of all listings and writing only for authenticated users.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /listings/{listingId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    // Existing rules...
  }
}
```

- [ ] **Step 3: Commit**
  - This step is manual, but we will create a commit to track the change.

```bash
git commit --allow-empty -m "chore: set up listings collection in Firestore"
```

### Task 2: Create a type definition for a Listing

**Files:**
- Create: `lib/types.ts` (if it doesn't exist) or add to an existing types file.

- [ ] **Step 1: Add the `Listing` type**

```typescript
// In lib/types.ts

export type Listing = {
  id: string;
  userId: string;
  evaluationId: string;
  price: number;
  description: string;
  contactInfo: string;
  createdAt: any; // Firestore timestamp
};
```

- [ ] **Step 2: Commit**

```bash
git add lib/types.ts
git commit -m "feat: add Listing type definition"
```

### Task 3: Create the Marketplace Page

**Files:**
- Create: `app/marketplace/page.tsx`

- [ ] **Step 1: Create the basic page structure**

```tsx
// app/marketplace/page.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MarketplacePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Car Marketplace</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Listings will be rendered here */}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/marketplace/page.tsx
git commit -m "feat: create basic marketplace page"
```

### Task 4: Fetch and Display Listings

**Files:**
- Modify: `app/marketplace/page.tsx`

- [ ] **Step 1: Fetch listings from Firestore**

```tsx
// app/marketplace/page.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getFirestore, collection, getDocs, orderBy, query } from "firebase/firestore";
import { firebaseApp } from "@/lib/firebase"; // Assuming you have this file
import { Listing } from "@/lib/types";
import { useEffect, useState } from "react";

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      const db = getFirestore(firebaseApp);
      const listingsCollection = collection(db, "listings");
      const q = query(listingsCollection, orderBy("createdAt", "desc"));
      const listingsSnapshot = await getDocs(q);
      const listingsData = listingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
      setListings(listingsData);
      setLoading(false);
    };

    fetchListings();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Car Marketplace</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {listings.map(listing => (
          <Card key={listing.id}>
            <CardHeader>
              <CardTitle>Car for Sale</CardTitle>
              <CardDescription>${listing.price}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{listing.description}</p>
              <p className="mt-4">Contact: {listing.contactInfo}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/marketplace/page.tsx
git commit -m "feat: fetch and display listings on marketplace page"
```

### Task 5: Add "List for Sale" Button to Evaluation Results

**Files:**
- Modify: `components/steps/results-step.tsx`

- [ ] **Step 1: Add the "List for Sale" button**

```tsx
// components/steps/results-step.tsx

// ... existing imports
import { Button } from "@/components/ui/button";
import Link from "next/link";

// ... existing component

// In the return statement, after displaying the evaluation results:
<div className="mt-8">
  <Link href="/list-for-sale">
    <Button>List this car for sale</Button>
  </Link>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add components/steps/results-step.tsx
git commit -m "feat: add 'List for Sale' button to results step"
```

### Task 6: Create "List for Sale" Page

**Files:**
- Create: `app/list-for-sale/page.tsx`

- [ ] **Step 1: Create the form component**

```tsx
// app/list-for-sale/page.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { firebaseApp } from "@/lib/firebase";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth"; // Assuming you have a useAuth hook
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ListForSalePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to list a car for sale.");
      return;
    }

    const db = getFirestore(firebaseApp);
    await addDoc(collection(db, "listings"), {
      userId: user.uid,
      evaluationId: "...", // We'll get this from the URL in a later step
      price: Number(price),
      description,
      contactInfo,
      createdAt: serverTimestamp(),
    });

    router.push("/marketplace");
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>List Your Car for Sale</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">Asking Price</Label>
                <Input id="price" type="number" value={price} onChange={e => setPrice(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactInfo">Contact Info (Email or Phone)</Label>
                <Input id="contactInfo" value={contactInfo} onChange={e => setContactInfo(e.target.value)} required />
              </div>
              <Button type="submit">List My Car</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/list-for-sale/page.tsx
git commit -m "feat: create 'List for Sale' page and form"
```
