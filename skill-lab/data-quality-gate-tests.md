# data-quality-gate — Trigger Tests

Manual test prompts for confirming the skill triggers on validation/publish-readiness requests and stays silent on ordinary SQL, metric, or dashboard-design requests.

## Should trigger

1. "Before this feeds the executive dashboard, validate `skill-lab/orders.csv` against `skill-lab/quality-contract.md` and tell me PUBLISH or BLOCK."
2. "Can you check this ETL output CSV for data quality issues before we load it into the warehouse?"
3. "Is this query result safe to publish to the report? Run a quality check first."

## Should NOT trigger

1. "Write a SQL query to calculate total revenue by region for last quarter."
2. "Design a dashboard layout showing order volume and revenue trends by region."
3. "Calculate the month-over-month growth rate for this orders table."

## Expected output requirements

**When triggered (prompts 1–3 above):**
- A single table with columns: `Check | Evidence | Status | Recommended Action`.
- Exactly one final result line: `PASS`, `WARN`, or `FAIL`.
- Exactly one final recommendation line: `PUBLISH` or `BLOCK`.
- Source dataset is never modified — read-only.
- Output is concise and procedural — no extra narrative beyond the table, result, and recommendation.

**When not triggered (prompts 4–6 above):**
- The model answers the SQL/metric/dashboard request directly (e.g., produces the SQL query, the dashboard layout, or the metric calculation).
- No PASS/WARN/FAIL line, no PUBLISH/BLOCK line, and no quality-check table appear in the response.
- The `data-quality-gate` skill is not invoked.
