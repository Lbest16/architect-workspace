import { describe, expect, it } from 'vitest';
import { renderOverview } from '../src/renderOverview';
import { projectMeta } from '../src/projectMeta';
import { releases } from '../src/releases';
import { getOverviewLiveIndicators } from '../src/liveStatus';

const baseVm = {
  meta: projectMeta,
  releases,
  currentRelease: releases[0],
  todayIso: '2026-08-17',
  liveIndicators: getOverviewLiveIndicators('2026-08-17T12:00:00.000Z'),
};

describe('renderOverview', () => {
  it('shows the project name and the current release', () => {
    const html = renderOverview({ ...baseVm, mode: 'real' });
    expect(html).toContain(projectMeta.name);
    expect(html).toContain('r0');
    expect(html).toContain('Initial Setup and Core Functionality');
  });

  it('adds a sample note only in sample mode', () => {
    const real = renderOverview({ ...baseVm, mode: 'real' });
    const sample = renderOverview({ ...baseVm, mode: 'sample' });
    expect(real).not.toContain('sample-tag');
    expect(sample).toContain('SAMPLE');
  });

  it('renders an empty state instead of inventing a release', () => {
    const html = renderOverview({ ...baseVm, currentRelease: null, mode: 'real' });
    expect(html).toContain('No release is scheduled');
  });

  it('escapes untrusted text so it cannot inject markup', () => {
    const html = renderOverview({
      ...baseVm,
      mode: 'real',
      meta: { ...projectMeta, name: '<script>alert(1)</script>' },
    });
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });
});
