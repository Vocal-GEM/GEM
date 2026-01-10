import re
import bleach
import filetype
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

def validate_file_upload(file_input, allowed_types=None):
    """
    Validates file extension and content (magic numbers) against allowed types.

    Args:
        file_input: Can be a filename string (legacy check only),
                   or a file-like object (e.g. werkzeug FileStorage),
                   or a path string.
        allowed_types: list of categories ('audio', 'image', 'document') or None for all.
    """
    # 1. Determine filename and file stream
    filename = None
    file_stream = None

    if hasattr(file_input, 'filename'): # FileStorage object
        filename = file_input.filename
        file_stream = file_input
    elif isinstance(file_input, str): # Path or Filename
        filename = file_input
        if '.' in filename and '/' not in filename and '\\' not in filename:
             # Just a filename, cannot check content unless we have the file
             pass
        else:
             # It's a path, try to open it
             try:
                 file_stream = open(file_input, 'rb')
             except:
                 pass # Cannot open, fall back to extension check

    if not filename or '.' not in filename:
        return False, "Invalid filename"

    # 2. Extension Validation
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
                 pass

    if ext not in allowed:
         return False, f"File type '{ext}' not allowed"
    
    # 3. Content Validation (Magic Numbers)
    if file_stream:
        try:
            # Read first 2KB for magic number detection
            if hasattr(file_stream, 'read'):
                # Remember position
                pos = file_stream.tell() if hasattr(file_stream, 'tell') else 0
                head = file_stream.read(2048)
                # Reset position
                if hasattr(file_stream, 'seek'):
                    file_stream.seek(pos)
            else:
                # If it's a file path string that we couldn't open above, we skip
                head = None

            if head:
                # Text file check (scripts often start with #!)
                # If we expect audio/image but find text, that's suspicious.
                # However, some formats like SVG are text. But we only allow png/jpg/audio.

                # Check for shebang (script)
                if head.startswith(b'#!'):
                     return False, "File content mismatch: detected script"

                kind = filetype.guess(head)
                if kind:
                    mime = kind.mime
                    # Check if detected mime matches allowed extension category

                    # If we expect audio, but get image/video/executable
                    if allowed_types and 'audio' in allowed_types:
                        # Allow explicit audio types
                        if mime.startswith('audio/'):
                            pass
                        # Allow video containers that often hold audio
                        elif ext in ['webm', 'ogg', 'm4a'] and mime.startswith('video/'):
                            pass
                        # Disallow known non-audio binaries
                        elif mime.startswith('image/') or mime.startswith('application/'):
                             # But wait, application/ogg is valid audio sometimes.
                             if mime == 'application/ogg' or mime == 'application/x-ogg':
                                 pass
                             else:
                                 # Reject images, executables (application/x-msdownload, application/x-executable), archives
                                 return False, f"File content mismatch: expected audio, got {mime}"

                    if allowed_types and 'image' in allowed_types:
                        if not mime.startswith('image/'):
                             return False, f"File content mismatch: expected image, got {mime}"

        except Exception as e:
            # If we fail to read/guess, log it but don't fail closed to avoid breaking valid uploads in edge cases
            # unless we are strict. For Sentinel, we log.
            print(f"Warning: Content validation failed: {e}")

    return True, None
