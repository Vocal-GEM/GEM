#!/usr/bin/env python3
"""
Simple script to call Anthropic Claude API from the terminal.
Usage: python claude_call.py [prompt]
If no prompt provided, uses a default one.
Requires ANTHROPIC_API_KEY environment variable.
"""

import os
import sys
import anthropic

def main():
    # Get API key from environment
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("Error: ANTHROPIC_API_KEY environment variable not set.")
        print("Get your API key from https://console.anthropic.com/")
        print("Set it with: $env:ANTHROPIC_API_KEY = 'your-key-here'")
        sys.exit(1)

    # Get prompt from command line or use default
    if len(sys.argv) > 1:
        prompt = " ".join(sys.argv[1:])
    else:
        prompt = "Write a Python function that checks if a number is prime."

    # Initialize client
    client = anthropic.Anthropic(api_key=api_key)

    try:
        # Make the API call
        message = client.messages.create(
            model="claude-3-haiku-20240307",  # Using Claude 3 Haiku as it's fast and cost-effective
            max_tokens=1000,
            temperature=0.7,
            system="You are a helpful AI assistant.",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        # Print the response
        print("Claude's response:")
        print(message.content[0].text)

    except anthropic.APIError as e:
        print(f"API Error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()