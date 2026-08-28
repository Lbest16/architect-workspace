export interface Purchase {
  productId: string;
  category: string;
  house: string;
  priceUsd: number;
  purchasedOn: string;
}

export interface ClientPreferences {
  preferredCategories: string[];
  preferredHouses: string[];
}

export interface ClientProfile {
  id: string;
  name: string;
  preferences: ClientPreferences;
  purchaseHistory: Purchase[];
  lastContactedOn: string;
}
