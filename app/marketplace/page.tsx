"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getFirestore, collection, getDocs, orderBy, query } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { Listing } from "@/lib/types";
import { useEffect, useState } from "react";

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      const db = getFirestore(app);
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
