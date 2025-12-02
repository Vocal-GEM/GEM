import pytest
from app.validators import (
    validate_username,
    validate_password,
    validate_email_address,
    sanitize_html
)


@pytest.mark.unit
class TestUsernameValidation:
    """Test username validation."""

    def test_valid_usernames(self):
        """Test valid username formats."""
        valid_usernames = [
            'user123',
            'test_user',
            'User_Name_123',
            'abc',  # Minimum length
            'a' * 30,  # Maximum length
        ]

        for username in valid_usernames:
            is_valid, error = validate_username(username)
            assert is_valid is True, f"Username '{username}' should be valid"
            assert error is None

    def test_invalid_username_empty(self):
        """Test empty username."""
        is_valid, error = validate_username('')
        assert is_valid is False
        assert error == "Username is required"

    def test_invalid_username_none(self):
        """Test None username."""
        is_valid, error = validate_username(None)
        assert is_valid is False
        assert error == "Username is required"

    def test_invalid_username_too_short(self):
        """Test username too short."""
        is_valid, error = validate_username('ab')
        assert is_valid is False
        assert "between 3 and 30 characters" in error

    def test_invalid_username_too_long(self):
        """Test username too long."""
        is_valid, error = validate_username('a' * 31)
        assert is_valid is False
        assert "between 3 and 30 characters" in error

    def test_invalid_username_special_chars(self):
        """Test username with invalid characters."""
        invalid_usernames = [
            'user@name',
            'user-name',
            'user.name',
            'user name',
            'user!name',
        ]

        for username in invalid_usernames:
            is_valid, error = validate_username(username)
            assert is_valid is False
            assert "can only contain letters, numbers, and underscores" in error


@pytest.mark.unit
class TestPasswordValidation:
    """Test password validation."""

    def test_valid_passwords(self):
        """Test valid password formats."""
        valid_passwords = [
            'Password123!',
            'Valid@Pass1',
            'MyP@ssw0rd',
            'Test1234!',
        ]

        for password in valid_passwords:
            is_valid, error = validate_password(password)
            assert is_valid is True, f"Password should be valid: {error}"
            assert error is None

    def test_invalid_password_empty(self):
        """Test empty password."""
        is_valid, error = validate_password('')
        assert is_valid is False
        assert error == "Password is required"

    def test_invalid_password_none(self):
        """Test None password."""
        is_valid, error = validate_password(None)
        assert is_valid is False
        assert error == "Password is required"

    def test_invalid_password_too_short(self):
        """Test password too short."""
        is_valid, error = validate_password('Short1!')
        assert is_valid is False
        assert "at least 8 characters" in error

    def test_invalid_password_no_uppercase(self):
        """Test password without uppercase letter."""
        is_valid, error = validate_password('password123!')
        assert is_valid is False
        assert "uppercase letter" in error

    def test_invalid_password_no_lowercase(self):
        """Test password without lowercase letter."""
        is_valid, error = validate_password('PASSWORD123!')
        assert is_valid is False
        assert "lowercase letter" in error

    def test_invalid_password_no_number(self):
        """Test password without number."""
        is_valid, error = validate_password('Password!')
        assert is_valid is False
        assert "number" in error

    def test_invalid_password_no_special_char(self):
        """Test password without special character."""
        is_valid, error = validate_password('Password123')
        assert is_valid is False
        assert "special character" in error


@pytest.mark.unit
class TestEmailValidation:
    """Test email validation."""

    def test_valid_emails(self):
        """Test valid email formats."""
        valid_emails = [
            'user@example.com',
            'test.user@example.co.uk',
            'user+tag@example.com',
        ]

        for email in valid_emails:
            is_valid, error = validate_email_address(email)
            assert is_valid is True, f"Email '{email}' should be valid"
            assert error is None

    def test_invalid_email_empty(self):
        """Test empty email."""
        is_valid, error = validate_email_address('')
        assert is_valid is False
        assert error == "Email is required"

    def test_invalid_email_none(self):
        """Test None email."""
        is_valid, error = validate_email_address(None)
        assert is_valid is False
        assert error == "Email is required"

    def test_invalid_email_format(self):
        """Test invalid email formats."""
        invalid_emails = [
            'notanemail',
            '@example.com',
            'user@',
            'user@.com',
        ]

        for email in invalid_emails:
            is_valid, error = validate_email_address(email)
            assert is_valid is False
            assert error is not None


@pytest.mark.unit
class TestHtmlSanitization:
    """Test HTML sanitization."""

    def test_sanitize_allowed_tags(self):
        """Test that allowed tags are preserved."""
        html = '<p>Hello <b>world</b>!</p>'
        result = sanitize_html(html)
        assert '<p>' in result
        assert '<b>' in result
        assert 'Hello' in result
        assert 'world' in result

    def test_sanitize_removes_scripts(self):
        """Test that script tags are removed."""
        html = '<p>Hello</p><script>alert("XSS")</script>'
        result = sanitize_html(html)
        assert '<script>' not in result
        assert 'alert' not in result
        assert 'Hello' in result

    def test_sanitize_removes_disallowed_tags(self):
        """Test that disallowed tags are removed."""
        html = '<p>Hello</p><div>world</div><span>!</span>'
        result = sanitize_html(html)
        assert '<div>' not in result
        assert '<span>' not in result
        assert 'Hello' in result
        assert 'world' in result  # Content should remain

    def test_sanitize_empty_content(self):
        """Test sanitization of empty content."""
        assert sanitize_html('') == ''
        assert sanitize_html(None) == ''

    def test_sanitize_allowed_attributes(self):
        """Test that allowed link attributes are preserved."""
        html = '<a href="https://example.com" title="Example">Link</a>'
        result = sanitize_html(html)
        assert 'href="https://example.com"' in result
        assert 'title="Example"' in result

    def test_sanitize_removes_dangerous_attributes(self):
        """Test that dangerous attributes are removed."""
        html = '<a href="javascript:alert(\'XSS\')">Link</a>'
        result = sanitize_html(html)
        # Bleach should remove javascript: protocol
        assert 'javascript:' not in result.lower()
