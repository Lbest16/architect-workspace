# ETL Triage Report: orders_pipeline (run_id 20260803-0300)

## 1. Incident Summary
The scheduled `orders_pipeline` run at 2026-08-03 03:00 UTC failed on both attempts at the load step due to a duplicate key on `order_id=ORD1010`, on top of transform-stage schema and conversion errors that quarantined 40 of 1,042 extracted rows. Zero rows were loaded into `warehouse.orders`; the pipeline halted and downstream refresh (executive revenue dashboard, weekly ops report) was skipped.

## 2. Evidence
- Extract read 1,042 rows, in line with the trailing 7-day average of 1,038 (`pipeline-run-metadata.md`; log line 3) — no volume anomaly.
- Transform: schema mismatch on `region` — value `'Northeast'` not in enum `[US-East,US-West,EU-West,EU-Central,APAC]` (v3, last updated 2026-07-15) at `row_offset=214, order_id=ORD1042` (log line 5).
- Transform: 37 rows failed region enum validation and were quarantined (log line 6; metadata line 9).
- Transform: mapping step `region_code_map` raised `KeyError 'Northeast'` — the value is absent from `region_code_map.yaml`, last updated 2026-06-20, i.e. over a month before this run (log line 7; metadata line 16).
- Transform: `cast_revenue_decimal` failed for 3 rows — `InvalidOperation converting '' to Decimal(10,2)` for `order_ids=ORD1058,ORD1071,ORD1090` (log line 8).
- Load: `duplicate key violation on orders.order_id (value=ORD1010) — unique constraint orders_pkey` (log line 11), repeated identically on retry attempt 2 (log line 19).
- Retry attempt 2 reproduced the identical schema-mismatch, mapping-failure, and duplicate-key errors as attempt 1, with "no automatic remediation applied" (log line 20).
- Run marked FAILED after 2 attempts; **rows loaded this run = 0** (metadata line 10); last known good run was 2026-08-02 03:00 UTC with 1,029 rows loaded and 0 errors (metadata line 14).

## 3. Ranked Causes

1. **Duplicate key at load (`order_id=ORD1010`)** — direct load-step error, identical on both attempts (log lines 11, 19). This is the proximate cause of the load failure and directly matches the duplicate `order_id` and duplicate full row found for `ORD1010` in the data-quality report.
2. **Stale region reference data causing schema/mapping cascade** — `'Northeast'` is rejected by both the region enum (v3, unchanged since 2026-07-15) and `region_code_map.yaml` (unchanged since 2026-06-20), a single upstream drift surfacing at two transform steps (log lines 5, 7; common-failures.md "Schema drift" and "Mapping/lookup failures" signatures). Per common-failures.md guidance, this is likely one root cause (an upstream source emitting a new region value) rather than two independent failures.
3. **Blank-value revenue conversion failures** — 3 rows failed casting an empty string to `Decimal(10,2)` (log line 8), matching the "Type conversion failure" signature (blank/malformed value reaching a step assuming clean numeric format). Evidence gap: the affected `order_ids` (ORD1058, ORD1071, ORD1090) do not match `ORD1007`, the negative-revenue row identified in the data-quality report — the log does not cite a cause for that negative value, so it should be treated as a separate, unexplained issue rather than attributed to this failure.
4. **Retry did not and could not resolve the issue** — attempt 2 reproduced identical errors with no remediation applied (log line 20), consistent with common-failures.md guidance that identical repeated failures point to a persistent data-quality root cause, not a transient one.

## 4. Evidence Gap (flag, not a ranked cause)
`orders.csv` contains rows with `load_timestamp` values as late as `2026-08-03T09:00:00Z` — after this run's 03:00–03:03 UTC failure window — while the metadata states 0 rows were loaded this run and the last known good load was 2026-08-02 03:00 UTC. The log and metadata do not explain how `orders.csv` acquired those later timestamps; this suggests `orders.csv` may not be a direct, unmodified export of `warehouse.orders` from this run, or that it was populated by a separate process. This should be confirmed before assuming the log fully accounts for every anomaly in the CSV.

## 5. Next Tests (read-only, one per ranked cause)
1. Duplicate key: query `warehouse.orders` and `raw.orders_staging` for `order_id='ORD1010'` to check whether the value already exists in the target table, the staging batch, or both.
2. Region drift: query `raw.orders_staging` for distinct `region` values in this run's batch and diff against the v3 enum and `region_code_map.yaml` to find all unmapped values (not just `'Northeast'`).
3. Revenue conversion: query `raw.orders_staging` for `order_ids` ORD1058, ORD1071, ORD1090 to inspect the raw (pre-cast) revenue field values.
4. Retry/non-transient confirmation: no further test needed beyond the log comparison already performed — attempts 1 and 2 are identical, confirming a data-rooted (not transient) cause.
5. Evidence gap: check the source/lineage of `orders.csv` (what job or export produced it, and when) to confirm whether it derives from `warehouse.orders` or a separate path.

## 6. Escalation Recommendation
Escalate now to the data engineering/pipeline owner. Severity is high: the load has failed for 0 rows loaded two runs in a row's worth of attempts, the executive revenue dashboard and weekly ops report are explicitly blocked (metadata line 17), and the root causes (stale reference data, a colliding key, unexplained negative revenue, unclear provenance of the CSV under review) all require source-system or reference-data fixes that are outside the scope of a pipeline retry. Do not re-trigger the pipeline until the region enum/mapping drift and the ORD1010 key collision are resolved upstream.
