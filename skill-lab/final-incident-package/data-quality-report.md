# Data Quality Report: orders.csv

Validated against: skill-lab/quality-contract.md
Reference time ("now") used for freshness calculations: 2026-08-03T12:00:00Z (current date per session context; no exact validation time was supplied)

| Check | Evidence | Status | Recommended Action |
|---|---|---|---|
| Schema | Contract-referenced columns (order_id, region, revenue, load_timestamp) all present in header: order_id, order_date, customer, region, quantity, revenue, load_timestamp | PASS | None |
| Freshness | Threshold: <24h old. 7 of 12 rows exceed it: ORD1001 (26h), ORD1002 (~25h55m), ORD1003 (~25h50m), ORD1004 (25h), ORD1005 (24h45m), ORD1006 (24h30m), ORD1007 (24h00m, borderline), and ORD1008 is a severe outlier at ~75h (load_timestamp 2026-07-31T09:00:00Z). Most recent batch timestamp (ORD1011) is 2026-08-03T09:00:00Z, only 3h old. | FAIL | Block publish; determine why over half the batch is stale and why ORD1008 is a ~3-day outlier before re-validating |
| Expected volume | 12 data rows present vs. contract minimum of 10 | PASS | None |
| Key uniqueness | order_id `ORD1010` appears twice (rows 11 and 12) | FAIL | Block publish; de-duplicate at source/pipeline before reload |
| Duplicates | Rows 11 and 12 are fully identical: `ORD1010,2026-08-03,Kappa Co,APAC,1,65.00,2026-08-03T08:15:00Z` | FAIL | Block publish; investigate double-write/re-ingest in pipeline |
| Required fields | `region` is empty for ORD1006 (row 6) | FAIL | Block publish; source/transform must populate region or reject row |
| Nulls | Only null found is ORD1006's region, already captured under Required fields (not double-counted) | PASS | None |
| Numeric rules | `revenue` must be > 0; ORD1007 (row 7) has revenue = -45.00 | FAIL | Block publish; investigate negative revenue value (possible refund/credit miscoded or sign error) |

## Overall Result
FAIL

## Recommendation
BLOCK
