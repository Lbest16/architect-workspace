export interface DataModelEntity {
  name: string;
  purpose: string;
  fields: string[];
  relationships: string[];
  requirementIds: string[];
}

/**
 * A starting-point data model derived from docs/REQUIREMENTS.md, per STORY-000:
 * "show me the model before you create the tables." Not read from a file because
 * no file in this repo carries a data model yet — this tab's job is to propose one.
 */
export const dataModelEntities: DataModelEntity[] = [
  {
    name: 'client_profile',
    purpose: 'A fictional client an advisor manages.',
    fields: ['id', 'name', 'preferences', 'created_at'],
    relationships: ['has many purchase_history_entry', 'has many clienteling_opportunity'],
    requirementIds: ['REQ-001', 'REQ-006', 'REQ-007', 'REQ-017'],
  },
  {
    name: 'purchase_history_entry',
    purpose: 'One past purchase used to infer opportunities.',
    fields: ['id', 'client_profile_id', 'product_id', 'purchased_at'],
    relationships: ['belongs to client_profile', 'references product'],
    requirementIds: ['REQ-001', 'REQ-006'],
  },
  {
    name: 'product',
    purpose: 'One catalog item that can be recommended.',
    fields: ['id', 'name', 'category', 'availability'],
    relationships: ['referenced by purchase_history_entry', 'referenced by clienteling_opportunity'],
    requirementIds: ['REQ-003', 'REQ-006'],
  },
  {
    name: 'clienteling_opportunity',
    purpose: 'The strongest opportunity identified for a client, with its reasoning and recommended product.',
    fields: ['id', 'client_profile_id', 'product_id', 'reasoning', 'identified_at'],
    relationships: ['belongs to client_profile', 'references product', 'has one outreach_message'],
    requirementIds: ['REQ-001', 'REQ-002', 'REQ-003'],
  },
  {
    name: 'outreach_message',
    purpose: 'A generated, editable message for one opportunity, queued for approval before it can send.',
    fields: ['id', 'clienteling_opportunity_id', 'draft_text', 'edited_text', 'is_ai_generated'],
    relationships: ['belongs to clienteling_opportunity', 'has one approval_queue_entry'],
    requirementIds: ['REQ-004', 'REQ-005', 'REQ-010'],
  },
  {
    name: 'approval_queue_entry',
    purpose: 'The human approval gate a draft must pass before it is ever sent.',
    fields: ['id', 'outreach_message_id', 'status', 'decided_by', 'decided_at'],
    relationships: ['belongs to outreach_message'],
    requirementIds: ['REQ-016'],
  },
  {
    name: 'access_role',
    purpose: 'A least-privilege role assigned to a system user.',
    fields: ['id', 'name', 'permissions'],
    relationships: ['assigned to many advisor'],
    requirementIds: ['REQ-009'],
  },
  {
    name: 'audit_log_entry',
    purpose: 'An append-only record of a reasoning trail, a message, or a decision, for every Trust criterion.',
    fields: ['id', 'subject_type', 'subject_id', 'action', 'actor', 'recorded_at'],
    relationships: ['references any of the entities above by subject_type/subject_id'],
    requirementIds: ['REQ-007', 'REQ-009', 'REQ-015', 'REQ-016'],
  },
];
