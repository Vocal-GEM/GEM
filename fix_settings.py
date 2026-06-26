with open('backend/app/routes/settings.py', 'r') as f:
    content = f.read()

content = content.replace("from flask import Blueprint, request, jsonify\n", "")
content = content.replace("""        logger.error(f"Error saving settings: {str(e)}")
        return jsonify({"error": "An error occurred while saving settings"}), 500
        current_app.logger.error(f"Error updating settings: {str(e)}")
        return jsonify({"error": "Failed to update settings"}), 500""", """        # Security: Log the error internally but return a generic message to the user
        logger.error(f"Error saving settings: {str(e)}")
        return jsonify({"error": "An error occurred while saving settings"}), 500""")

with open('backend/app/routes/settings.py', 'w') as f:
    f.write(content)
