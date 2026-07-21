import subprocess
try:
    subprocess.check_call(["git", "commit", "--amend", "--no-edit"])
except Exception as e:
    print(e)
