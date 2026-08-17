**Status**: BLOCKED. The orders dashboard's scheduled publish is on hold. The underlying data failed quality validation (overall result: FAIL) and the source pipeline run also failed to load any new data.

**Business Impact**: Not stated in the source reports — no dollar figure or revenue impact was provided, so none is estimated here. Known scope: the executive revenue dashboard and the weekly ops report are both blocked from refreshing.

**What We Know**:
- The orders data failed 4 of 8 quality checks: a duplicate order ID with a duplicate row (ORD1010), a missing required region value (ORD1006), a negative revenue value (ORD1007), and more than half the rows being older than the 24-hour freshness limit (one row ~75 hours old).
- The pipeline's scheduled run today failed twice (original attempt plus one retry) and loaded zero new rows into the warehouse; the retry hit the identical errors as the first attempt, indicating the problem will not resolve on its own.
- The failure traces to two upstream issues: a new region value ("Northeast") that isn't recognized by current reference data/mappings, and a colliding order ID that violates a uniqueness rule at load time.
- The negative revenue value and the exact source/timing of the data file under review are not yet explained by the investigation and are flagged as open questions.

**What We Do Not Know**:
- Financial or business impact in dollar terms — not stated in source reports.
- Root cause of the negative revenue value on order ORD1007 — not tied to any cause found in the pipeline log.
- Why the reviewed data file contains rows timestamped after today's failed pipeline run, given that run loaded zero rows — provenance of the file is unconfirmed.
- Owner assigned to resolve this incident — not stated in source reports.
- Expected resolution time — not stated in source reports.

**Decision or Action Needed**: Keep the orders dashboard publish blocked. Do not re-trigger the pipeline until the region reference data/mapping is updated and the duplicate order ID is resolved upstream; retrying without fixing these will reproduce the same failure.

**Owner**: TBD — not stated in source reports.

**Next Update**: TBD — not stated in source reports.
