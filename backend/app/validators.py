import re
import bleach
from email_validator import validate_email, EmailNotValidError

ALLOWED_EXTENSIONS = {
    'audio': {'wav', 'mp3', 'ogg', 'm4a', 'flac', 'webm'},
    'image': {'jpg', 'jpeg', 'png', 'gif', 'webp'},
    'document': {'pdf', 'txt', 'csv', 'json'}
}

def validate_username(username):
    """
    Validate username: 3-30 chars, alphanumeric + common special characters
    """
    if not username:
        return False, "Username is required"
    
    if len(username) < 3 or len(username) > 30:
        return False, "Username must be between 3 and 30 characters"
    
    # Allow letters, numbers, underscores, hyphens, and periods
    if not re.match(r'^[a-zA-Z0-9_.\-]+$', username):
        return False, "Username can only contain letters, numbers, underscores, hyphens, and periods"
        
    return True, None

def validate_password(password):
    """
    Validate password: min 8 chars, at least one letter and one number.
    Special characters are allowed but not required.
    """
    if not password:
        return False, "Password is required"
        
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
        
    if not re.search(r'[a-zA-Z]', password):
        return False, "Password must contain at least one letter"
        
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
        
    return True, None

def sanitize_html(content):
    """
    Sanitize HTML content using bleach
    """
    if not content:
        return ""
        
    allowed_tags = ['b', 'i', 'u', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li']
    allowed_attributes = {'a': ['href', 'title', 'target']}
    
    return bleach.clean(content, tags=allowed_tags, attributes=allowed_attributes, strip=True)

def validate_email_address(email):
    """
    Validate email address format
    """
    if not email:
        return False, "Email is required"
        
    try:
        validate_email(email, check_deliverability=False)
        return True, None
    except EmailNotValidError as e:
        return False, str(e)

def validate_file_upload(filename, allowed_types=None):
    """
    Validates file extension against allowed types.
    allowed_types: list of categories ('audio', 'image', 'document') or None for all.
    """
    if not filename or '.' not in filename:
        return False, "Invalid filename"

    ext = filename.rsplit('.', 1)[1].lower()

    allowed = set()
    if allowed_types is None:
        for cat in ALLOWED_EXTENSIONS.values():
            allowed.update(cat)
    else:
        for cat in allowed_types:
            if cat in ALLOWED_EXTENSIONS:
                allowed.update(ALLOWED_EXTENSIONS[cat])
            else:
                 # Handle if a specific extension set is passed or just ignore unknown categories
                 pass

    if ext not in allowed:
         return False, f"File type '{ext}' not allowed"

    return True, None
