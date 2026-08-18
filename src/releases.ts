export interface Release {
  id: string;
  name: string;
  storyCount: number;
  startIso: string;
  endIso: string;
}

export const releases: Release[] = [
  {
    id: 'r0',
    name: 'Initial Setup and Core Functionality',
    storyCount: 3,
    startIso: '2026-08-13',
    endIso: '2026-08-25',
  },
  {
    id: 'r1',
    name: 'Enhanced User Interface and Data Management',
    storyCount: 2,
    startIso: '2026-08-28',
    endIso: '2026-09-07',
  },
  {
    id: 'r2',
    name: 'Security and Privacy Features',
    storyCount: 3,
    startIso: '2026-09-04',
    endIso: '2026-09-13',
  },
  {
    id: 'r3',
    name: 'AI Utilization and Scalability',
    storyCount: 2,
    startIso: '2026-09-13',
    endIso: '2026-09-19',
  },
  {
    id: 'r4',
    name: 'Project Planning and Final Adjustments',
    storyCount: 1,
    startIso: '2026-10-01',
    endIso: '2026-10-01',
  },
];
