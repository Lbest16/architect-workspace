import type { Product } from './product';

/** Fictional product catalog — see docs/REQUIREMENTS.md REQ-006/REQ-017. No real inventory data. */
export const sampleProducts: Product[] = [
  { id: 'PRD-1001', name: 'Cashmere Wrap Coat', category: 'Outerwear', house: 'Loro Piana', priceUsd: 6200, isNewArrival: true },
  { id: 'PRD-1002', name: 'Quilted Flap Bag', category: 'Handbags', house: 'Chanel', priceUsd: 8800, isNewArrival: true },
  { id: 'PRD-1003', name: 'Silk Twill Scarf', category: 'Accessories', house: 'Chanel', priceUsd: 650, isNewArrival: false },
  { id: 'PRD-1004', name: 'Wool Travel Blazer', category: 'Tailoring', house: 'Brunello Cucinelli', priceUsd: 3400, isNewArrival: false },
  { id: 'PRD-1005', name: 'Vicuña Overcoat', category: 'Outerwear', house: 'Loro Piana', priceUsd: 24000, isNewArrival: false },
];
