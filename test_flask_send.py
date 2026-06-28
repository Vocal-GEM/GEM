from werkzeug.utils import safe_join
print(safe_join('/app/uploads', '../../../etc/passwd'))
