import re

with open('src/context/AuthContext.test.jsx', 'r') as f:
    content = f.read()

content = content.replace("expect(api.post).toHaveBeenCalledWith('/auth/logout')", "expect(api.post).toHaveBeenCalledWith('/auth/logout', {})")

with open('src/context/AuthContext.test.jsx', 'w') as f:
    f.write(content)
