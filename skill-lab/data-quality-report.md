# Data Quality Report: skill-lab/orders.csv

Validated against: `skill-lab/quality-contract.md`
Validation date: 2026-08-03 (exact time-of-day not specified in session context; freshness ages below are computed against an assumed validation time of 2026-08-03T12:00:00Z — re-check if the actual run time differs materially).
Source data was read only; `orders.csv` was not modified.

| Check | Evidence | Status | Recommended Action |
|---|---|---|---|
| Schema | Header contains `order_id, order_date, customer, region, quantity, revenue, load_timestamp` — all fields referenced by the contract are present. | PASS | None. |
| Freshness | Dataset's most recent `load_timestamp` (2026-08-03T09:00:00Z) is fresh, but evaluated per-row against the contract's "<24h" rule, 8 of 12 rows exceed the threshold: `ORD1001`–`ORD1007` are ~24–26h old, and `ORD1008` is ~75h old (loaded 2026-07-31, roughly 3 days before the rest of the batch). | FAIL | Re-run/refresh the load for the stale rows before publishing; investigate specifically why `ORD1008` wasn't picked up in the current load cycle. |
| Expected volume | 12 data rows vs. contract minimum of 10. | PASS | None. |
| Key uniqueness (`order_id`) | `ORD1010` appears twice (two identical rows). | FAIL | Remove the duplicate `order_id` and confirm upstream dedup logic. |
| Duplicates (full row) | The two `ORD1010` rows are byte-identical duplicates. | FAIL | Drop the duplicate row. |
| Required fields (`region`) | `ORD1006` has an empty `region` value. | FAIL | Backfill `region` or exclude the row until sourced. |
| Nulls | 1 of 12 rows (8.3%) null in `region`; no nulls found in any other column. | WARN | Investigate source of the missing region; monitor null rate going forward. |
| Numeric rules (`revenue > 0`) | `ORD1007` has `revenue = -45.00`, violating the contract's positive-revenue rule. | FAIL | Correct or exclude the negative-revenue record; check for a refund/return misclassified as a standard order upstream. |

## Result

**FAIL**

## Recommendation

**BLOCK**

Multiple hard-failure checks (freshness, key uniqueness, row duplication, required-field completeness, and the revenue numeric rule) must be resolved before this dataset feeds the executive revenue dashboard.
