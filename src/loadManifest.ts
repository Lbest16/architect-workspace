import { fetchJson, type FetchJsonResult } from './fetchJson';

export interface ManifestFile {
  path: string;
  sha256: string;
}

export interface Manifest {
  generated_at: string;
  plan_version: number;
  plan_sha256: string;
  correlation_id: string;
  files: ManifestFile[];
}

const MANIFEST_PATH = './.colaberry/manifest.json';

export function loadManifest(): Promise<FetchJsonResult<Manifest>> {
  return fetchJson<Manifest>(MANIFEST_PATH);
}
