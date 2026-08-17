# Pipeline Run Metadata: orders_pipeline

- **Run ID**: 20260803-0300
- **Schedule**: daily @ 03:00 UTC
- **Source**: `raw.orders_staging`
- **Target**: `warehouse.orders`
- **Trailing 7-day average rows read**: 1,038
- **Rows read this run**: 1,042
- **Rows quarantined this run**: 40 (region enum failures: 37; revenue conversion failures: 3)
- **Rows loaded this run**: 0 (load step failed before commit, both attempts)
- **Retry policy**: max 2 attempts, 180s backoff
- **Attempt 1**: FAILED at load step — duplicate key violation, `order_id=ORD1010`
- **Attempt 2**: FAILED — identical schema mismatch, mapping failure, and duplicate key errors as attempt 1
- **Last known good run**: 2026-08-02 03:00 UTC — 1,029 rows loaded, 0 errors
- **Region enum version**: v3, last updated 2026-07-15 — valid values: `US-East, US-West, EU-West, EU-Central, APAC`
- **`region_code_map.yaml` last updated**: 2026-06-20
- **Downstream consumers blocked by this run**: executive revenue dashboard, weekly ops report
