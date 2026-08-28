import json

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("order-support-assistant")

# Hardcoded data source standing in for an OMS/POS lookup.
ORDER_DB = {
    "ORD-10234": {
        "customer": "Isabelle Rourke",
        "status": "shipped",
        "items": ["Chanel quilted flap bag"],
        "carrier": "FedEx",
        "tracking_number": "784512396581",
        "estimated_delivery": "2026-08-30",
    },
    "ORD-10567": {
        "customer": "Marcus Delaine",
        "status": "processing",
        "items": ["Brunello Cucinelli cashmere sweater", "Silk pocket square"],
        "carrier": None,
        "tracking_number": None,
        "estimated_delivery": "2026-09-02",
    },
    "ORD-10891": {
        "customer": "Priya Nandakumar",
        "status": "delayed",
        "items": ["Loro Piana overcoat"],
        "carrier": "UPS",
        "tracking_number": "1Z999AA10123456784",
        "estimated_delivery": "2026-09-10",
    },
}

RETURN_POLICY_MD = """# Return Policy

- Items may be returned within 30 days of delivery in original condition.
- Made-to-measure and monogrammed items are final sale.
- Refunds are issued to the original payment method within 5-7 business days of receipt.
"""


@mcp.tool()
def get_order_status(order_id: str) -> str:
    """Look up an order's current status, items, and shipping details by order ID."""
    order = ORDER_DB.get(order_id)
    if order is None:
        return json.dumps({"error": f"No order found with ID {order_id}."})
    return json.dumps(order)


@mcp.resource("orders://catalog", mime_type="application/json")
def order_catalog() -> str:
    """Full order catalog as JSON, keyed by order ID."""
    return json.dumps(ORDER_DB, indent=2)


@mcp.resource("orders://return-policy", mime_type="text/markdown")
def return_policy() -> str:
    """The store's return policy."""
    return RETURN_POLICY_MD


@mcp.prompt()
def draft_order_update(order_id: str, tone: str) -> str:
    """Draft a customer-facing message updating them on an order's status."""
    return (
        f"Write a short, {tone} message to the customer updating them on the "
        f"status of order {order_id}. Call get_order_status first to look up "
        f"the current details, and reference the specific items and estimated "
        f"delivery date in the message."
    )


if __name__ == "__main__":
    mcp.run()
