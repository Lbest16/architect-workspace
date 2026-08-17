# Quality Checks Reference

Detailed definitions for each check listed in `SKILL.md`. Read this before running checks.

## 1. Schema

Compare the dataset's columns against the contract's expected schema. If the contract doesn't define one, infer the expected schema from the dataset's own header on first read and treat any fields referenced elsewhere in the contract (e.g., in freshness or numeric rules) as required columns.
- **Evidence**: list of columns present vs. expected/referenced columns.
- **FAIL** if a column referenced by the contract is missing entirely.

## 2. Freshness

Check the load timestamp (or equivalent recency field) against the contract's age threshold.
- Compute both: (a) the dataset's most recent load timestamp (overall recency of the batch), and (b) any individual rows that are outliers relative to the rest of the batch or that individually violate the contract's threshold.
- **Evidence**: most recent timestamp, plus any rows exceeding the threshold with their age.
- State the "now" reference time used for age calculations if it isn't explicit in the session — freshness is meaningless without a stated reference point.
- **FAIL** if the contract's threshold is violated, whether at the dataset level or for individual rows the contract clearly intends to cover.
- **WARN** if only borderline/ambiguous cases exist (e.g., a single row near the threshold with no clear contract guidance on per-row vs. batch-level freshness).

## 3. Expected volume

Compare the actual row count (data rows, excluding header) against the contract's minimum/expected count.
- **Evidence**: actual row count vs. contract minimum.
- **FAIL** if below the contract's stated minimum.
- **WARN** if at or just above the minimum with no other issues, when the contract implies a target rather than a hard floor.

## 4. Key uniqueness

Check the contract's designated key column(s) (e.g., an ID field) for duplicate values.
- **Evidence**: any duplicate key values, with a count of occurrences.
- **FAIL** if any duplicate key value exists — a broken key almost always breaks downstream joins/aggregations.

## 5. Duplicates

Check for fully duplicate rows (every column identical), independent of the key-uniqueness check.
- **Evidence**: identify duplicate row(s) by key or row number.
- **FAIL** if any fully duplicate row exists.

## 6. Required fields

Check that every column the contract marks as required is non-empty for every row.
- **Evidence**: which rows/columns are empty.
- **FAIL** if any required field is empty in any row.

## 7. Nulls

Compute the null/blank rate per column, including columns not explicitly marked required.
- **Evidence**: null count and rate per column with any nulls.
- **WARN** if a non-required column has a non-trivial null rate that looks unexpected.
- Nulls in a column already marked required are covered by the Required fields check (FAIL there), not double-counted as a separate FAIL here.

## 8. Numeric rules

Check numeric fields against the contract's stated rules (e.g., "revenue must be greater than zero").
- **Evidence**: any values violating the rule, with the offending row and value.
- **FAIL** if any value violates a stated numeric rule.

## Severity roll-up

- Any single FAIL among the checks above forces the overall result to `FAIL` and the recommendation to `BLOCK`.
- If only WARN-level findings exist (no FAILs), the overall result is `WARN`; recommendation is a judgment call — `PUBLISH` if the WARNs are cosmetic/low-risk, `BLOCK` if they could plausibly mislead downstream consumers. State the reasoning in the Evidence column either way.
- All checks passing yields `PASS` and `PUBLISH`.
