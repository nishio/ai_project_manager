#!/usr/bin/env python3

import os
import sys

def check_environment():
    print("=== Environment Check ===")
    openai_key = os.getenv("OPENAI_API_KEY")
    if not openai_key:
        print("ERROR: OPENAI_API_KEY is not set")
        sys.exit(1)
    print("✓ OPENAI_API_KEY is set")
    print("Environment check passed!")

if __name__ == "__main__":
    check_environment()
