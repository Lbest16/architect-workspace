import { escapeHtml } from './escapeHtml';
import type { ClientProfile } from './clientProfile';
import type { Opportunity } from './opportunity';
import type { ProductRecommendation } from './productRecommendation';
import type { OutreachMessage } from './message';

export interface ClientDetailVm {
  client: ClientProfile;
  opportunity: Opportunity;
  recommendation: ProductRecommendation | null;
  recommendationError: string | null;
  message: OutreachMessage | null;
  messageError: string | null;
}

function renderRecommendation(vm: ClientDetailVm): string {
  if (vm.recommendation) {
    return `
      <section class="client-detail__section">
        <h3>Recommended product</h3>
        <p>${escapeHtml(vm.recommendation.productName)} &middot; score ${vm.recommendation.score}</p>
      </section>`;
  }
  return `
    <section class="client-detail__section">
      <h3>Recommended product</h3>
      <p class="client-detail__note">${escapeHtml(vm.recommendationError ?? 'No recommendation available.')}</p>
    </section>`;
}

function renderMessageDraft(vm: ClientDetailVm): string {
  if (!vm.message) {
    return `
      <section class="client-detail__section">
        <h3>Outreach message</h3>
        <p class="client-detail__note">${escapeHtml(vm.messageError ?? 'No draft available.')}</p>
      </section>`;
  }
  return `
    <section class="client-detail__section">
      <h3>Outreach message</h3>
      <form class="message-draft" data-message-draft-form>
        <label class="message-draft__label" for="message-subject">Subject</label>
        <input id="message-subject" class="message-draft__subject" type="text" value="${escapeHtml(vm.message.subject)}" />
        <label class="message-draft__label" for="message-body">Body</label>
        <textarea id="message-body" class="message-draft__body" rows="6">${escapeHtml(vm.message.body)}</textarea>
        <button type="button" class="message-draft__queue-btn" data-queue-message>Queue for approval</button>
      </form>
    </section>`;
}

/** Renders the full client detail view: opportunity, recommended product, and an editable message draft. */
export function renderClientDetail(vm: ClientDetailVm): string {
  return `
    <div class="client-detail">
      <p><a href="#/clients">&larr; Back to clients</a></p>
      <h2>${escapeHtml(vm.client.name)}</h2>
      <p class="client-detail__meta">${escapeHtml(vm.client.id)} &middot; last contacted ${escapeHtml(vm.client.lastContactedOn)}</p>

      <section class="client-detail__section">
        <h3>Opportunity</h3>
        <p>${escapeHtml(vm.opportunity.headline)}</p>
      </section>

      ${renderRecommendation(vm)}
      ${renderMessageDraft(vm)}
    </div>`;
}
