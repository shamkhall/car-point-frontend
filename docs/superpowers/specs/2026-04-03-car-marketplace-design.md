# Car Marketplace Design

## 1. Overview

This document outlines the design for a simple car marketplace feature. The marketplace will allow users to list their evaluated cars for sale and view listings from other users.

## 2. User Flow: Listing a Car

1.  After a user completes a car evaluation, they will see a "List this car for sale" button on the results page.
2.  Clicking this button will take them to a form with the following fields:
    *   Car details (pre-filled from the evaluation)
    *   A short description (user-provided)
    *   Asking price (pre-filled with the evaluation result, but editable)
    *   Contact information (e.g., email or phone number)
3.  Upon submission, the car will be added to the marketplace.

## 3. Marketplace Page

The marketplace will be a new page on the website that displays all cars for sale in a simple list format. Each listing will show:

*   The car's make, model, and year.
*   The asking price.
*   The seller's description.

## 4. Contacting a Seller

To facilitate contact between buyers and sellers, the seller's provided contact information (email or phone number) will be displayed on the listing page. There will be no built-in messaging system in this initial version.

## 5. Data Models

A new top-level Firestore collection named `listings` will be created. Each document in this collection will represent a single car for sale and will have the following structure:

```
{
  "userId": "string",       // The ID of the user who listed the car
  "evaluationId": "string", // The ID of the car's evaluation
  "price": "number",        // The asking price
  "description": "string",  // The seller's description
  "contactInfo": "string",  // The seller's contact information
  "createdAt": "timestamp"  // The date the listing was created
}
```
