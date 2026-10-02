import { describe, expect, it } from 'vitest';
import { renderClientDetail, type ClientDetailVm } from '../src/renderClientDetail';
import type { ClientProfile } from '../src/clientProfile';
import type { Opportunity } from '../src/opportunity';

const client: ClientProfile = {
  id: 'CLT-1',
  name: 'Isabelle Rourke',
  preferences: { preferredCategories: ['Handbags'], preferredHouses: ['Chanel'] },
  purchaseHistory: [],
  lastContactedOn: '2026-01-01',
};

const opportunity: Opportunity = {
  clientId: 'CLT-1',
  type: 'new_arrival_match',
  productId: 'PRD-1002',
  headline: 'New arrival matches Isabelle Rourke\'s preferences',
  score: 70,
};

function baseVm(overrides: Partial<ClientDetailVm> = {}): ClientDetailVm {
  return {
    client,
    opportunity,
    recommendation: { clientId: 'CLT-1', opportunityType: 'new_arrival_match', productId: 'PRD-1002', productName: 'Quilted Flap Bag', score: 70 },
    recommendationError: null,
    message: { clientId: 'CLT-1', opportunityType: 'new_arrival_match', productId: 'PRD-1002', subject: 'A new arrival for you', body: 'Thought of you.', characterCount: 16, generatedAt: '2026-01-01T00:00:00.000Z' },
    messageError: null,
    ...overrides,
  };
}

describe('renderClientDetail', () => {
  it('shows the client, opportunity, recommendation, and an editable message draft', () => {
    const html = renderClientDetail(baseVm());
    expect(html).toContain('Isabelle Rourke');
    expect(html).toContain(opportunity.headline);
    expect(html).toContain('Quilted Flap Bag');
    expect(html).toContain('<textarea');
    expect(html).toContain('Thought of you.');
    expect(html).toContain('data-queue-message');
  });

  it('never renders a send action, only a queue-for-approval action', () => {
    const html = renderClientDetail(baseVm());
    expect(html.toLowerCase()).not.toContain('send');
  });

  it('shows the recommendation error when no product was recommended', () => {
    const html = renderClientDetail(baseVm({ recommendation: null, recommendationError: 'No product matches.' }));
    expect(html).toContain('No product matches.');
  });

  it('labels the opportunity and the product recommendation as AI-generated', () => {
    const html = renderClientDetail(baseVm());
    const aiBadgeCount = html.split('data-ai-generated="true"').length - 1;
    expect(aiBadgeCount).toBe(2);

    const opportunitySection = html.slice(html.indexOf('<h3>Opportunity'), html.indexOf('Recommended product'));
    expect(opportunitySection).toContain('AI-generated');

    const recommendationSection = html.slice(html.indexOf('<h3>Recommended product'));
    expect(recommendationSection).toContain('AI-generated');
  });

  it('does not label a failed recommendation attempt as AI-generated, since nothing was generated', () => {
    const html = renderClientDetail(baseVm({ recommendation: null, recommendationError: 'No product matches.' }));
    const recommendationSection = html.slice(html.indexOf('<h3>Recommended product'));
    expect(recommendationSection).not.toContain('AI-generated');
  });

  it('never marks factual client or product data as AI-generated', () => {
    const html = renderClientDetail(baseVm());

    const clientHeader = html.slice(html.indexOf('<h2>'), html.indexOf('<section'));
    expect(clientHeader).toContain('Isabelle Rourke');
    expect(clientHeader).toContain('CLT-1');
    expect(clientHeader).not.toContain('AI-generated');

    const recommendationSection = html.slice(html.indexOf('<h3>Recommended product'));
    expect(recommendationSection).toContain('Quilted Flap Bag');
    const productNameLine = recommendationSection.split('\n').find((line) => line.includes('Quilted Flap Bag'));
    expect(productNameLine).not.toContain('AI-generated');
  });

  it('shows the message error when no draft could be generated', () => {
    const html = renderClientDetail(baseVm({ message: null, messageError: 'No template available.' }));
    expect(html).toContain('No template available.');
    expect(html).not.toContain('<textarea');
  });
});
