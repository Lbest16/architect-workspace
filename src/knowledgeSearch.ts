import type { Plan } from './loadPlan';
import { detailHref, type TabId } from './route';

export interface SearchHit {
  label: string;
  snippet: string;
  tab: TabId;
  href: string;
}

export function searchKnowledge(plan: Plan, query: string): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits: SearchHit[] = [];

  for (const req of plan.requirements) {
    if (req.id.toLowerCase().includes(q) || req.statement.toLowerCase().includes(q) || req.cluster.toLowerCase().includes(q)) {
      hits.push({ label: req.id, snippet: req.statement, tab: 'knowledge-base', href: detailHref('knowledge-base', req.id) });
    }
  }

  for (const story of plan.stories) {
    if (story.id.toLowerCase().includes(q) || story.title.toLowerCase().includes(q) || story.narrative.toLowerCase().includes(q)) {
      hits.push({ label: story.id, snippet: story.title, tab: 'project-management', href: detailHref('project-management', story.id) });
    }
  }

  return hits;
}
