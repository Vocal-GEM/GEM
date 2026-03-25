import re
import bleach
import filetype
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
    Sanitize HTML content using bleach.
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
        return False, "Invalid email address"

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

    # Validate magic numbers if file_stream is provided
    if file_stream:
        # Read header to guess type
        # Note: filetype.guess handles bytes or buffer.
        # For FileStorage/stream, we might need to read a bit or rely on filetype handling it.
        # filetype.guess does NOT advance the file pointer if it's a file path,
        # but for a stream/bytes, it reads.

        # We need to save the current position to reset it later
        current_pos = file_stream.tell()

        # Read first 2048 bytes (usually enough for magic numbers)
        header = file_stream.read(2048)
        file_stream.seek(current_pos) # Reset position immediately

        kind = filetype.guess(header)

        # If kind is None, filetype couldn't determine the type.
        # This happens for text files (txt, csv, json, md) as they don't have magic numbers.
        # We should skip magic number check for those or check if they are binary.

        if kind:
            # If we detected a type, ensure it matches the extension
            # Note: kind.extension might not exactly match (e.g. jpeg vs jpg), so we check MIME or if it's in our allowed list

            # Map of detected extension to our allowed extensions (if needed)
            # But simpler: check if the detected extension is allowed.

            # However, if I upload 'malware.exe' renamed to 'image.jpg':
            # 1. ext is 'jpg' (allowed)
            # 2. kind.extension is 'exe' (not allowed)
            # So we must verify kind.extension is in allowed list OR matches the declared extension.

            # But strictly speaking, we want to ensure the CONTENT matches the EXTENSION.
            # So if ext is 'jpg', kind.extension should be 'jpg' or 'jpeg'.

            detected_ext = kind.extension
            if detected_ext == 'jpeg': detected_ext = 'jpg'

            # Allow compatible types (e.g. m4a/mp4 usually detected as mp4)
            if ext == 'm4a' and detected_ext == 'mp4':
                pass
            elif ext != detected_ext:
                 # Check if detected type is also allowed?
                 # If I rename a valid png to jpg, it's probably fine security-wise, but maybe confusing.
                 # But if I rename exe to jpg, detected_ext will be exe (or not allowed).

                 # Let's enforce that the detected type must be one of the ALLOWED types.
                 if detected_ext not in allowed:
                     return False, f"File content detected as '{detected_ext}', which is not allowed"

                 # And arguably we should warn if it doesn't match the extension,
                 # but for now let's just ensure the content is safe.
        else:
            # Could not determine type (likely text file or unknown binary)
            # If extension implies binary (jpg, mp3, pdf), but we couldn't detect it, that's suspicious?
            # txt, csv, json don't have magic numbers usually.

            # List of extensions that SHOULD have magic numbers
            binary_extensions = ALLOWED_EXTENSIONS['audio'] | ALLOWED_EXTENSIONS['image'] | {'pdf'}

            if ext in binary_extensions:
                # If we expect a binary file but filetype failed, it might be a corrupted file or a text file masquerading.
                # We should reject this as suspicious for strictly binary formats.
                return False, f"Could not determine file type for extension '{ext}' (possibly corrupted or invalid format)"

    # Magic number check
    if file_stream:
        if not validate_magic_number(file_stream, ext):
             return False, "File content does not match extension"
    
    return True, None
