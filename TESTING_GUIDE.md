# Testing Guide

This guide explains how to run and write tests for the VocalGEM project.

## Frontend Testing (Vitest)

### Setup

The frontend uses Vitest with React Testing Library. Dependencies are already in `package.json`.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test src/components/ui/Login.test.jsx
```

### Coverage Reports

After running tests with coverage, open the HTML report:
```bash
# Coverage report will be in ./coverage/index.html
open coverage/index.html  # macOS
start coverage/index.html  # Windows
```

### Test Files Created

**High Priority Tests:**
- ✅ `src/components/ui/ErrorBoundary.test.jsx` - Error boundary component
- ✅ `src/components/ui/GlobalErrorBoundary.test.jsx` - Global error handler
- ✅ `src/components/ui/Login.test.jsx` - Login authentication
- ✅ `src/components/ui/Signup.test.jsx` - Signup authentication

**Test Coverage:** Run `npm run test:coverage` to see detailed coverage metrics.

### Writing Frontend Tests

Example test structure:
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
    it('renders correctly', () => {
        render(<MyComponent />);
        expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    it('handles click events', () => {
        const onClick = vi.fn();
        render(<MyComponent onClick={onClick} />);

        fireEvent.click(screen.getByRole('button'));
        expect(onClick).toHaveBeenCalled();
    });
});
```

## Backend Testing (Pytest)

### Setup

Install development dependencies:
```bash
cd backend
pip install -r requirements-dev.txt
```

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_auth.py

# Run specific test class
pytest tests/test_auth.py::TestAuthEndpoints

# Run specific test
pytest tests/test_auth.py::TestAuthEndpoints::test_login_success

# Run with markers
pytest -m unit        # Only unit tests
pytest -m integration # Only integration tests
```

### Coverage Reports

```bash
# Generate HTML coverage report
pytest --cov=app --cov-report=html

# Open the report (in htmlcov/index.html)
open htmlcov/index.html  # macOS
start htmlcov/index.html  # Windows
```

### Test Files Created

**Backend Tests:**
- ✅ `backend/tests/conftest.py` - Test fixtures and configuration
- ✅ `backend/tests/test_auth.py` - Authentication endpoint tests
- ✅ `backend/tests/test_validators.py` - Input validation tests
- ✅ `backend/tests/test_models.py` - Database model tests

### Writing Backend Tests

Example test structure:
```python
import pytest

@pytest.mark.unit
class TestMyFeature:
    """Test my feature."""

    def test_success_case(self, client, db):
        """Test successful operation."""
        response = client.post('/api/endpoint', json={
            'data': 'value'
        })

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True

    def test_error_case(self, client):
        """Test error handling."""
        response = client.post('/api/endpoint', json={})
        assert response.status_code == 400
```

## Test Fixtures (Backend)

Available pytest fixtures in `conftest.py`:

- `app` - Flask application instance
- `db` - Database session
- `client` - Test client for making requests
- `sample_user` - Pre-created test user
- `authenticated_client` - Client logged in as sample_user

## Continuous Integration

### Running Tests Locally Before Commit

```bash
# Frontend
npm run test:coverage

# Backend
cd backend
pytest --cov=app

# Both should pass before committing
```

## Next Steps - Expanding Test Coverage

### High Priority Areas to Test Next:

1. **AudioEngine.js** - Core audio processing (currently 0% coverage)
2. **Core Views** - AnalysisView, ProgressView, VoiceQualityView (currently 8% coverage)
3. **Hooks** - useAudio, useCoach, useMediaRecorder (currently 29% coverage)
4. **Services** - AIService, BackendService, CourseService (currently 21% coverage)
5. **Backend Routes** - data.py, ai.py, analysis.py (currently untested)

### Recommended Test Types to Add:

1. **Integration Tests** - Test complete workflows
2. **E2E Tests** - Add Playwright/Cypress for user journeys
3. **Performance Tests** - Benchmark audio processing
4. **Accessibility Tests** - Add jest-axe/vitest-axe

## Troubleshooting

### Frontend Issues

**Problem:** Tests fail with "Cannot find module"
**Solution:** Ensure all dependencies are installed: `npm install`

**Problem:** Coverage not working
**Solution:** Check `vitest.config.js` has coverage configuration

### Backend Issues

**Problem:** Import errors
**Solution:** Ensure you're in the backend directory and have activated virtual environment

**Problem:** Database errors
**Solution:** Tests use temporary SQLite database - no setup needed

**Problem:** Tests hang
**Solution:** Check for async operations without proper waits

## Coverage Goals

**Current Coverage:**
- Frontend: ~16% of files have tests
- Backend: New test infrastructure established

**Target Coverage:**
- Frontend: 80% of critical paths (auth, audio engine, core views)
- Backend: 90% of API endpoints and models
- Integration: Key user workflows covered

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Pytest Documentation](https://docs.pytest.org/)
- [Flask Testing](https://flask.palletsprojects.com/en/latest/testing/)
