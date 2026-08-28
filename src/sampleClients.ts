import type { ClientProfile } from './clientProfile';

/** Fictional client roster — see docs/REQUIREMENTS.md REQ-006/REQ-007/REQ-017. No real client data. */
export const sampleClients: ClientProfile[] = [
  {
    id: 'CLT-88213',
    name: 'Isabelle Rourke',
    preferences: { preferredCategories: ['Handbags', 'Accessories'], preferredHouses: ['Chanel', 'Loro Piana'] },
    purchaseHistory: [
      { productId: 'PRD-0900', category: 'Accessories', house: 'Chanel', priceUsd: 590, purchasedOn: '2025-11-02' },
      { productId: 'PRD-0812', category: 'Handbags', house: 'Chanel', priceUsd: 7200, purchasedOn: '2025-06-14' },
    ],
    lastContactedOn: '2026-05-02',
  },
  {
    id: 'CLT-40217',
    name: 'Marcus Delaine',
    preferences: { preferredCategories: ['Tailoring'], preferredHouses: ['Brunello Cucinelli'] },
    purchaseHistory: [
      { productId: 'PRD-0733', category: 'Tailoring', house: 'Brunello Cucinelli', priceUsd: 3100, purchasedOn: '2025-03-19' },
    ],
    lastContactedOn: '2026-07-19',
  },
  {
    id: 'CLT-55561',
    name: 'Priya Anand',
    preferences: { preferredCategories: ['Outerwear'], preferredHouses: ['Loro Piana'] },
    purchaseHistory: [
      { productId: 'PRD-0410', category: 'Outerwear', house: 'Loro Piana', priceUsd: 5800, purchasedOn: '2024-12-01' },
    ],
    lastContactedOn: '2025-09-01',
  },
];
