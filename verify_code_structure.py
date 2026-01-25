import inspect
import sys
import os
from flask import Flask

# Add repo root to path
sys.path.append(os.getcwd())

try:
    from backend.app.routes import community
    source = inspect.getsource(community.submit_success_story)
    print("Source code of submit_success_story:")
    print(source)

    if "user_id=current_user.id" in source:
        print("VERIFIED: user_id is passed")
    else:
        print("FAILED: user_id is MISSING")

    if "title=clean_title" in source:
        print("VERIFIED: title=clean_title is present")
    else:
        print("FAILED: title=clean_title is MISSING")

    if "story=clean_story" in source:
        print("VERIFIED: story=clean_story is present")
    else:
        print("FAILED: story=clean_story is MISSING")

except Exception as e:
    print(f"Error: {e}")
