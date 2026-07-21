import subprocess
import os

try:
    subprocess.check_call(["git", "commit", "--amend", "--no-edit"])
except Exception as e:
    print("Error:", e)
