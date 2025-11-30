print("Hello from simple test")
import sys
import os
print(f"CWD: {os.getcwd()}")
try:
    sys.path.append(os.path.join(os.getcwd(), 'backend'))
    from app import create_app
    print("Import successful")
except Exception as e:
    print(f"Import failed: {e}")
