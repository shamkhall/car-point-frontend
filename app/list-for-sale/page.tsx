"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { app } from "@/lib/firebase";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/components/auth-provider";
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

    const db = getFirestore(app);
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
