# Common ETL Failure Signatures

Reference for matching log/metadata evidence to likely causes before ranking. Read this before producing Ranked Causes.

## Schema drift / mismatch

**Signature**: an error naming a column, an expected type/enum, and an actual value that doesn't fit (e.g., a categorical field receiving a value outside its known set).
**Likely cause**: upstream source started emitting a new/changed value the pipeline's schema or enum hasn't been updated for.
**Next test**: query the source table for distinct values of the offending column since the last known-good run, and diff against the pipeline's expected enum/schema definition.

## Mapping / lookup failures

**Signature**: a `KeyError`, "not found in map", or similar error referencing a lookup/reference file (e.g., a code-mapping YAML or table).
**Likely cause**: the mapping file is stale relative to the values now appearing in source data — usually the same root cause as a schema drift upstream, surfacing at the mapping step instead of validation.
**Next test**: inspect the mapping file's last-updated date/version against the first appearance date of the unmapped value.

## Type conversion failures

**Signature**: errors like "InvalidOperation converting X to Decimal/Int/Date", casting or parsing exceptions on a specific field.
**Likely cause**: null, blank, or malformed values reaching a step that assumes a clean numeric/date format.
**Next test**: query the source/staging table for rows with blank, null, or non-numeric values in the offending field for this run's batch.

## Duplicate key / constraint violations at load

**Signature**: "duplicate key violation", "unique constraint" errors at the load step, naming a specific key value.
**Likely cause**: either the source batch itself contains a duplicate, or a prior partial/failed run left a row committed that the current run collides with.
**Next test**: check the target table for whether the conflicting key already exists, and check the source/staging batch for the same key appearing more than once.

## Retry that doesn't resolve

**Signature**: a second (or later) attempt logs the same errors, at the same step, against the same data, with no remediation applied in between.
**Likely cause**: the retry mechanism re-runs the same job against the same unchanged input — it cannot fix a data-shape problem, only a transient one (network blip, lock contention, timeout). Identical failures across attempts point away from "transient" and toward a persistent upstream data issue.
**Next test**: compare the error text and affected row/key between attempt 1 and attempt 2 — identical evidence across attempts rules out transient causes and should raise (not lower) confidence in a data-quality-rooted cause.

## Volume anomalies

**Signature**: rows-read or rows-loaded far outside the recent historical range noted in run metadata.
**Likely cause**: upstream extraction issue (partial source read, filter misconfiguration) or a genuine spike/drop in source volume.
**Next test**: compare this run's row counts against the trailing average in run metadata and check the extract step's source query/filter for changes.

## Ranking guidance

- Prefer causes with the most direct, specific evidence (an exact error naming the field/value/key) over generic ones (a timeout with no further detail).
- When multiple failure types appear in one run, note whether they could share a single root cause (e.g., a schema mismatch cascading into a mapping failure) before ranking them as independent causes.
- A repeated identical failure across retries is evidence *against* a transient cause, not neutral — weight it accordingly in the ranking.
