export type Listing = {
  id: string;
  userId: string;
  evaluationId: string;
  price: number;
  description: string;
  contactInfo: string;
  createdAt: any; // Firestore timestamp
};
