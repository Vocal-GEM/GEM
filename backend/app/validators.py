import re
import bleach
from email_validator import validate_email, EmailNotValidError

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

def validate_file_upload(filename, allowed_extensions=None):
    """
    Validate file upload based on extension.

    Args:
        filename (str): The name of the file
        allowed_extensions (set): Set of allowed extensions (without dot).
                                 If None, uses a default safe list.

    Returns:
        tuple: (bool, str or None) - (is_valid, error_message)
    """
    if not filename:
        return False, "Filename is required"

    if allowed_extensions is None:
        # Default safe extensions
        allowed_extensions = {
            'png', 'jpg', 'jpeg', 'gif', 'webp', # Images
            'pdf', 'txt', 'md', 'csv', 'json',   # Documents
            'wav', 'mp3', 'ogg', 'm4a', 'webm'   # Audio
        }

    if '.' not in filename:
        return False, "File has no extension"

    ext = filename.rsplit('.', 1)[1].lower()

    if ext not in allowed_extensions:
        return False, f"File type '{ext}' is not allowed"

    return True, None
