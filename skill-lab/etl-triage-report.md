# ETL Triage Report: orders_pipeline

**Run ID**: 20260803-0300 (+ retry 20260803-0300-retry2)
**Status**: FAILED after 2 attempts, pipeline halted, 0 rows loaded

## 1. Incident Summary

The `orders_pipeline` scheduled run (daily @ 03:00 UTC) failed on 2026-08-03 after both its initial attempt and one automatic retry. The transform step quarantined 40 of 1,042 rows due to schema/mapping/conversion errors, and the load step then failed entirely on a duplicate key violation, resulting in 0 rows loaded into `warehouse.orders`. The retry reproduced identical errors, and the pipeline halted with no automatic remediation, blocking the executive revenue dashboard and weekly ops report.

## 2. Evidence

- Extract read 1,042 rows, in line with the trailing 7-day average of 1,038 (log line 3; metadata "Rows read this run"). Volume is not anomalous.
- `2026-08-03 03:00:06 ERROR [transform] Schema mismatch on column 'region': expected enum[US-East,US-West,EU-West,EU-Central,APAC], found value 'Northeast' at row_offset=214 order_id=ORD1042` (log line 5).
- `2026-08-03 03:00:06 WARN [transform] 37 rows failed region enum validation; routing to stg.orders_quarantine` (log line 6).
- `2026-08-03 03:00:07 ERROR [transform] Mapping step 'region_code_map' failed: KeyError 'Northeast' not found in region_code_map.yaml (37 rows affected)` (log line 7).
- `2026-08-03 03:00:07 ERROR [transform] Conversion step 'cast_revenue_decimal' failed for 3 rows: InvalidOperation converting '' to Decimal(10,2) (order_ids=ORD1058,ORD1071,ORD1090)` (log line 8).
- `2026-08-03 03:00:11 ERROR [load] Load failed: duplicate key violation on orders.order_id (value=ORD1010) — unique constraint orders_pkey` (log line 11), on a load attempt of 1,002 rows (log line 10).
- Retry attempt 2 (log lines 13–19) reproduced the identical region schema mismatch, mapping `KeyError`, and duplicate key violation on `ORD1010` — no new or different errors.
- `2026-08-03 03:03:18 ERROR [orchestrator] Retry attempt 2 failed — identical errors to attempt 1; no automatic remediation applied` (log line 20).
- Metadata: region enum v3 last updated 2026-07-15; `region_code_map.yaml` last updated 2026-06-20 — both predate this run and neither includes `Northeast`.
- Metadata: last known-good run (2026-08-02 03:00 UTC) loaded 1,029 rows with 0 errors, confirming this is a regression, not a chronic condition.
- Metadata: "Rows loaded this run: 0 (load step failed before commit, both attempts)" — the duplicate key error blocked the entire batch, not just `ORD1010`.

## 3. Ranked Causes

**1. Duplicate key violation at load (`order_id=ORD1010`) — most likely proximate cause of total failure**
Evidence: log lines 11 and 19 show identical unique-constraint violations on `orders_pkey` across both attempts; metadata confirms 0 rows loaded on either attempt despite 1,002 rows reaching the load step. This is the failure that actually blocks the run end-to-end — the schema/mapping issues below only quarantine a subset of rows and would not by themselves have prevented the remaining 1,002 from loading. Per the identical-retry signature, the repeat failure with no remediation between attempts rules out a transient cause (lock contention, timing) and points to either a duplicate already committed in `warehouse.orders` from a prior run, or a duplicate within the `raw.orders_staging` batch itself.

**2. Schema drift on `region` column cascading into mapping failure — most likely cause of the quarantined rows**
Evidence: log line 5 names the exact column, expected enum, and offending value (`'Northeast'`); line 6 confirms 37 rows affected; line 7 shows the same unmapped value causing a `KeyError` in `region_code_map.yaml`. Metadata shows both the enum (updated 2026-07-15) and the mapping file (updated 2026-06-20) predate this run and don't include `Northeast` — consistent with an upstream source starting to emit a new region value neither artifact has caught up to. Per triage guidance, the schema-validation error and the mapping `KeyError` on the same value (`'Northeast'`) likely share one root cause rather than being independent failures.

**3. Type conversion failure on `revenue` field — lowest impact, smallest evidence footprint**
Evidence: log line 8 shows 3 rows (`ORD1058, ORD1071, ORD1090`) failing `Decimal(10,2)` conversion on an empty string. Consistent with blank/malformed values reaching the cast step. Affects the fewest rows and did not by itself block the run (these rows were quarantined, not fatal to the batch).

## 4. Next Tests

1. **Duplicate key**: Query `warehouse.orders` for `order_id = 'ORD1010'` to check whether it already exists from a prior committed run; separately, query `raw.orders_staging` for this run's batch to check whether `ORD1010` appears more than once in the source.
2. **Schema drift / mapping**: Query `raw.orders_staging` for distinct values of `region` since the last known-good run (2026-08-02 03:00 UTC), and diff the result against the v3 enum (`US-East, US-West, EU-West, EU-Central, APAC`) and the keys in `region_code_map.yaml`, to confirm `'Northeast'` is a new, sustained value rather than a one-off.
3. **Conversion failure**: Query `raw.orders_staging` for `ORD1058, ORD1071, ORD1090` and any other rows with blank/null `revenue` values in this run's batch, to determine whether the source is emitting empty strings for a specific segment (e.g., tied to the same new region).

## 5. Escalation Recommendation

Escalate now. Two consecutive attempts failed identically, the retry policy is exhausted (2 of 2), no automatic remediation is available, and the failure is blocking business-facing consumers (executive revenue dashboard, weekly ops report). Recommend routing to the data pipeline owner / on-call for `orders_pipeline`, flagging both (a) a likely source-side duplicate or upstream region-value change requiring a source-system or reference-data owner to confirm, and (b) the enum/mapping artifacts as candidates for an update once the new `Northeast` value is confirmed intentional.
