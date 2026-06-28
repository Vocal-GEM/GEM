from werkzeug.utils import secure_filename
filename = "../../../etc/passwd"
print(f"secure_filename result: {secure_filename(filename)}")
