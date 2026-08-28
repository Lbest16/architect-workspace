"""One complete tool-use round trip for the Luxury Client Intelligence Agent.

One question, one tool, one hardcoded data source. If ANTHROPIC_API_KEY is
set, this makes real calls to Claude. If it isn't, it prints a clearly
labeled simulated exchange instead — the real get_client_profile function
still runs either way; only the two model responses are canned.
"""

import json
import os
from types import SimpleNamespace

MODEL = "claude-sonnet-5"
QUESTION = "What's the best way to re-engage client CLT-88213? What do they usually buy?"

# Hardcoded data source standing in for a CRM/POS lookup.
CLIENT_DB = {
    "CLT-88213": {
        "name": "Isabelle Rourke",
        "lifetime_spend_usd": 340000,
        "preferred_houses": ["Chanel", "Loro Piana"],
        "last_contacted": "2026-05-02",
    },
    "CLT-40217": {
        "name": "Marcus Delaine",
        "lifetime_spend_usd": 128500,
        "preferred_houses": ["Brunello Cucinelli"],
        "last_contacted": "2026-07-19",
    },
}

TOOL = {
    "name": "get_client_profile",
    "description": (
        "Retrieve a luxury client's profile by client ID, including purchase history, "
        "preferred houses, lifetime spend, and last contact date. Use this whenever the "
        "advisor asks about a specific client's buying habits, spend tier, preferences, "
        "or when they were last contacted."
    ),
    "input_schema": {
        "type": "object",
        "properties": {
            "client_id": {
                "type": "string",
                "description": "The client's unique ID, e.g. 'CLT-88213'.",
            }
        },
        "required": ["client_id"],
    },
}


def get_client_profile(client_id: str) -> str:
    """MY function. This is what actually executes -- never the model."""
    profile = CLIENT_DB.get(client_id)
    if profile is None:
        return f"No client found with ID {client_id}."
    return json.dumps(profile)


def header(n, label):
    print(f"\n--- ({n}) {label} ---")


def get_first_response(messages):
    if os.environ.get("ANTHROPIC_API_KEY"):
        import anthropic

        client = anthropic.Anthropic()
        return client.messages.create(
            model=MODEL, max_tokens=1024, tools=[TOOL], messages=messages
        )

    print("[SIMULATED -- no ANTHROPIC_API_KEY found, this is not a live call]")
    return SimpleNamespace(
        stop_reason="tool_use",
        content=[
            SimpleNamespace(type="text", text="Let me pull up their profile first."),
            SimpleNamespace(
                type="tool_use",
                id="toolu_01QRS456",
                name="get_client_profile",
                input={"client_id": "CLT-88213"},
            ),
        ],
    )


def get_followup_response(messages):
    if os.environ.get("ANTHROPIC_API_KEY"):
        import anthropic

        client = anthropic.Anthropic()
        return client.messages.create(
            model=MODEL, max_tokens=1024, tools=[TOOL], messages=messages
        )

    print("[SIMULATED -- no ANTHROPIC_API_KEY found, this is not a live call]")
    return SimpleNamespace(
        content=[
            SimpleNamespace(
                type="text",
                text=(
                    "CLT-88213 (Isabelle Rourke) has a lifetime spend of $340,000 and "
                    "gravitates toward Chanel and Loro Piana. It has been about three "
                    "months since your last contact -- a good re-engagement move would "
                    "be previewing new arrivals in those two houses, framed as a "
                    "personal heads-up before they hit the floor."
                ),
            )
        ]
    )


def main():
    messages = [{"role": "user", "content": QUESTION}]

    header(1, "REQUEST SENT")
    request_payload = {
        "model": MODEL,
        "max_tokens": 1024,
        "tools": [TOOL],
        "messages": messages,
    }
    print(json.dumps(request_payload, indent=2))

    response = get_first_response(messages)

    header(2, "STOP_REASON")
    print(response.stop_reason)

    tool_use_block = next(b for b in response.content if b.type == "tool_use")
    header(3, "TOOL_USE BLOCK (arguments the model filled in)")
    print(
        json.dumps(
            {
                "id": tool_use_block.id,
                "name": tool_use_block.name,
                "input": tool_use_block.input,
            },
            indent=2,
        )
    )

    header(4, "MY FUNCTION EXECUTES")
    client_id = tool_use_block.input["client_id"]
    result = get_client_profile(client_id)  # <-- this is the line
    print(f"get_client_profile({client_id!r}) -> {result}")

    tool_result = {
        "type": "tool_result",
        "tool_use_id": tool_use_block.id,
        "content": result,
    }
    header(5, "TOOL_RESULT SENT BACK")
    print(json.dumps(tool_result, indent=2))

    messages.append({"role": "assistant", "content": response.content})
    messages.append({"role": "user", "content": [tool_result]})

    followup = get_followup_response(messages)

    header(6, "FINAL ANSWER")
    for block in followup.content:
        if block.type == "text":
            print(block.text)


if __name__ == "__main__":
    main()
