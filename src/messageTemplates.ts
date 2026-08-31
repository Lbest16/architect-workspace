import type { OpportunityType } from './opportunity';

export interface MessageTemplate {
  subject: string;
  bodyTemplate: string;
}

const templates: Record<OpportunityType, MessageTemplate> = {
  new_arrival_match: {
    subject: 'Just landed — thought of you, {{clientName}}',
    bodyTemplate:
      'Hi {{clientName}}, we just received {{productName}} from {{productHouse}} and it immediately made me think of you. Given your love for {{preferredCategory}}, I wanted you to have first look before it is shown on the floor.',
  },
  category_expansion: {
    subject: 'Something a little different for you, {{clientName}}',
    bodyTemplate:
      'Hi {{clientName}}, based on your collection so far I thought {{productName}} from {{productHouse}} might be a lovely way to explore {{preferredCategory}}. I would love to set aside time to show it to you.',
  },
  re_engagement: {
    subject: 'It has been a while, {{clientName}}',
    bodyTemplate:
      'Hi {{clientName}}, I realized it has been some time since we last connected and wanted to check in. I would love to hear what you have been drawn to lately and share a few pieces I think you will enjoy.',
  },
};

export type TemplateLookupResult = { ok: true; template: MessageTemplate } | { ok: false; error: string };

/**
 * Looks up the message template for an opportunity type. Takes a plain string, not
 * OpportunityType, because the caller may be relaying an unvalidated/untrusted
 * opportunity — an unrecognized or future type must fail gracefully, not crash.
 */
export function findMessageTemplate(opportunityType: string): TemplateLookupResult {
  const template = (templates as Record<string, MessageTemplate>)[opportunityType];
  if (!template) {
    return { ok: false, error: `No message template is configured for opportunity type '${opportunityType}'.` };
  }
  return { ok: true, template };
}
