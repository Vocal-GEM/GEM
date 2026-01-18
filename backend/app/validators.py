import re
import bleach
from email_validator import validate_email, EmailNotValidError

ALLOWED_EXTENSIONS = {
    'audio': {'wav', 'mp3', 'ogg', 'm4a', 'flac', 'webm'},
    'image': {'jpg', 'jpeg', 'png', 'gif', 'webp'},
    'document': {'pdf', 'txt', 'csv', 'json', 'md'}
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

def validate_magic_number(file_stream, ext):
    """
    Validate file content using magic numbers for common types.
    Returns True if valid or if type check is skipped, False if invalid.
    """
    if not file_stream:
        return True # Skip if no stream provided

    try:
        # Save current position
        pos = file_stream.tell()
        file_stream.seek(0)
        header = file_stream.read(10) # Read enough bytes
        file_stream.seek(pos) # Reset position

        if ext == 'pdf':
            return header.startswith(b'%PDF-')
        elif ext == 'png':
            return header.startswith(b'\x89PNG\r\n\x1a\n')
        elif ext in ['jpg', 'jpeg']:
            return header.startswith(b'\xff\xd8')
        elif ext == 'gif':
            return header.startswith(b'GIF87a') or header.startswith(b'GIF89a')

        return True
    except Exception as e:
        print(f"Magic number validation error: {e}")
        return False

def validate_file_upload(filename, allowed_types=None, file_stream=None):
    """
    Validates file extension and optional content against allowed types.
    allowed_types: list of categories ('audio', 'image', 'document') or None for all.
    file_stream: Optional file object to validate magic numbers.
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
                # Security enhancement: Fail on unknown categories to prevent logic errors
                # like passing extensions instead of categories.
                return False, f"Invalid category '{cat}' in allowed_types configuration"

    if ext not in allowed:
         return False, f"File type '{ext}' not allowed"

    # Magic number check
    if file_stream:
        if not validate_magic_number(file_stream, ext):
             return False, "File content does not match extension"
    
    return True, None
