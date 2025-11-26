import re
import bleach
from email_validator import validate_email, EmailNotValidError

def validate_username(username):
    """
    Validate username: 3-30 chars, alphanumeric + underscore
    """
    if not username:
        return False, "Username is required"
    
    if len(username) < 3 or len(username) > 30:
        return False, "Username must be between 3 and 30 characters"
    
    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        return False, "Username can only contain letters, numbers, and underscores"
        
    return True, None

def validate_password(password):
    """
    Validate password: min 8 chars, uppercase, lowercase, number, special char
    """
    if not password:
        return False, "Password is required"
        
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
        
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
        
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
        
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
        
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Password must contain at least one special character"
        
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
