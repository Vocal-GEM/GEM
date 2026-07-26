with open("backend/app/routes/auth.py", "r") as f:
    content = f.read()

search = """@auth_bp.route('/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    data = request.json
    user = User.query.filter_by(username=data.get('username')).first()

    if user and check_password_hash(user.password_hash, data.get('password')):
        login_user(user)
        return jsonify({"message": "Logged in", "user": {"id": user.id, "username": user.username}})

    return jsonify({"error": "Invalid credentials"}), 401"""

replace = """@auth_bp.route('/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    data = request.json
    password = data.get('password', '')
    user = User.query.filter_by(username=data.get('username')).first()

    # Mitigate timing attacks by always performing a hash check
    dummy_hash = "pbkdf2:sha256:260000$salt$hash"

    if user:
        is_valid = check_password_hash(user.password_hash, password)
    else:
        is_valid = False
        check_password_hash(dummy_hash, password)

    if user and is_valid:
        login_user(user)
        return jsonify({"message": "Logged in", "user": {"id": user.id, "username": user.username}})

    return jsonify({"error": "Invalid credentials"}), 401"""

if search in content:
    content = content.replace(search, replace)
    with open("backend/app/routes/auth.py", "w") as f:
        f.write(content)
    print("Patched successfully")
else:
    print("Search string not found")
