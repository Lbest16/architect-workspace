export interface ProjectMeta {
  name: string;
  tagline: string;
  description: string;
  demoDayIso: string;
  buildEndIso: string;
}

export const projectMeta: ProjectMeta = {
  name: 'Luxury Client Intelligence Agent',
  tagline: 'Command Center',
  description:
    'An AI-powered tool for luxury retail client advisors to manage client relationships by ' +
    'identifying clienteling opportunities, recommending products, and generating personalized messages.',
  demoDayIso: '2026-10-08',
  buildEndIso: '2026-10-01',
};
