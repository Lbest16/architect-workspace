# Quality Contract: orders.csv

- `order_id` must be unique across all rows.
- `region` is required (non-empty) for every row.
- `revenue` must be greater than zero.
- `load_timestamp` must be less than 24 hours old at validation time.
- Expected row count is at least 10.
