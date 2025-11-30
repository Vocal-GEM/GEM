import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app import create_app

print("--- Starting Test ---")
app = create_app()
print("--- Test Finished ---")
