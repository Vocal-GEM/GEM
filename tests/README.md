# VocalGEM Test Suite

Comprehensive testing infrastructure for the VocalGEM voice training application.

## 📊 Current Status

### Frontend (Vitest)
- **Test Files:** 33 total
- **Test Cases:** 178 total (140 passing)
- **New Tests Added:** 7 files with 94 test cases
- **Coverage:** Tracked via `npm run test:coverage`

### Backend (Pytest)
- **Test Files:** 4 total
- **Test Cases:** 52 total
- **Code Coverage:** 28% (validators at 100%)
- **Framework:** pytest with pytest-flask, pytest-cov

## 🚀 Quick Start

### Running All Tests

**Frontend:**
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage report
```

**Backend:**
```bash
cd backend
pytest                     # Run all tests
pytest --cov=app          # With coverage
pytest -v                 # Verbose output
```

### Running Specific Tests

**Frontend:**
```bash
# Single file
npm test -- src/components/ui/Login.test.jsx

# Pattern matching
npm test -- src/hooks/*.test.js

# Specific test
npm test -- -t "renders login form"
```

**Backend:**
```bash
# Single file
pytest tests/test_auth.py

# Specific class
pytest tests/test_auth.py::TestAuthEndpoints

# Specific test
pytest tests/test_auth.py::TestAuthEndpoints::test_login_success

# By marker
pytest -m unit              # Unit tests only
pytest -m integration       # Integration tests only
```

## 📁 Test Organization

### Frontend Tests (`src/`)

```
src/
├── components/
│   ├── ui/
│   │   ├── ErrorBoundary.test.jsx          ✅ 9 tests
│   │   ├── GlobalErrorBoundary.test.jsx    ✅ 13 tests
│   │   ├── Login.test.jsx                  ✅ 13 tests
│   │   ├── Signup.test.jsx                 ⚠️  13 tests (needs label fixes)
│   │   ├── AudioLibrary.test.jsx           📝 Existing
│   │   ├── Breadcrumbs.test.jsx            📝 Existing
│   │   └── [other component tests]
│   └── viz/
│       └── ProgressCharts.test.jsx         📝 Existing
├── hooks/
│   ├── useAchievements.test.js             ✅ 11 tests (NEW)
│   ├── useSpeechRecognition.test.js        ✅ 15 tests (NEW)
│   ├── useFeedback.test.js                 ✅ 14 tests (NEW)
│   ├── useCourseProgress.test.js           📝 Existing
│   └── useTTS.test.js                      📝 Existing
├── services/
│   ├── AnalyticsService.test.js            📝 Existing
│   ├── IndexedDBManager.test.js            📝 Existing
│   └── SyncManager.test.js                 📝 Existing
├── utils/
│   ├── coachEngine.test.js                 📝 Existing
│   ├── cppAnalysis.test.js                 📝 Existing
│   ├── lpcAnalysis.test.js                 📝 Existing
│   └── pitch.test.js                       📝 Existing
└── context/
    ├── LanguageContext.test.jsx            📝 Existing
    ├── SettingsContext.test.js             📝 Existing
    └── TourContext.test.jsx                📝 Existing
```

### Backend Tests (`backend/tests/`)

```
backend/tests/
├── conftest.py                             ✅ Test fixtures
├── test_auth.py                            ✅ 17 tests (23 validators passing)
├── test_validators.py                      ✅ 24 tests (23/24 passing)
└── test_models.py                          ✅ 11 tests (needs google-generativeai)
```

## 🎯 Test Categories

### Frontend

**Component Tests:**
- Rendering and mount behavior
- User interactions (clicks, inputs)
- State management
- Error states
- Loading states
- Modal behavior

**Hook Tests:**
- State initialization
- State updates
- Side effects
- Dependency management
- Custom logic

**Service Tests:**
- API calls
- Data persistence
- Sync operations
- Error handling

**Utility Tests:**
- Pure function logic
- Algorithm correctness
- Edge cases

### Backend

**API Endpoint Tests:**
- Request validation
- Response formatting
- Authentication/Authorization
- Error responses
- Status codes

**Model Tests:**
- CRUD operations
- Relationships
- Validation
- Constraints

**Validator Tests:**
- Input sanitization
- XSS prevention
- Format validation
- Security checks

## 🧪 Test Patterns

### Frontend Patterns

**Component Testing:**
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

describe('MyComponent', () => {
    it('renders with props', () => {
        render(<MyComponent title="Test" />);
        expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('handles user interaction', () => {
        const onClick = vi.fn();
        render(<MyComponent onClick={onClick} />);

        fireEvent.click(screen.getByRole('button'));
        expect(onClick).toHaveBeenCalled();
    });
});
```

**Hook Testing:**
```javascript
import { renderHook, act } from '@testing-library/react';

it('updates state', () => {
    const { result } = renderHook(() => useMyHook());

    act(() => {
        result.current.update('value');
    });

    expect(result.current.value).toBe('value');
});
```

### Backend Patterns

**API Testing:**
```python
def test_endpoint(client, sample_user):
    response = client.post('/api/endpoint', json={
        'data': 'value'
    })

    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
```

**Model Testing:**
```python
def test_model_creation(db):
    model = MyModel(field='value')
    db.session.add(model)
    db.session.commit()

    assert model.id is not None
    assert model.field == 'value'
```

## 🔧 Configuration

### Frontend (`vitest.config.js`)
```javascript
{
  environment: 'jsdom',
  globals: true,
  setupFiles: ['./src/test/setup.js'],
  coverage: {
    provider: 'v8',
    reporter: ['text', 'html', 'lcov'],
    exclude: ['**/*.test.{js,jsx}', '**/test/**']
  }
}
```

### Backend (`backend/pytest.ini`)
```ini
[pytest]
testpaths = tests
python_files = test_*.py
markers =
    unit: Unit tests
    integration: Integration tests
    slow: Slow running tests
```

## 📈 Coverage Reports

### Viewing Coverage

**Frontend:**
```bash
npm run test:coverage
open coverage/index.html     # macOS
start coverage/index.html    # Windows
```

**Backend:**
```bash
cd backend
pytest --cov=app --cov-report=html
open htmlcov/index.html      # macOS
start htmlcov/index.html     # Windows
```

### Coverage Goals

| Area | Current | Target |
|------|---------|--------|
| Frontend - Error Boundaries | 100% | 100% ✅ |
| Frontend - Authentication | ~90% | 90% ✅ |
| Frontend - Hooks | 71% | 80% |
| Backend - Validators | 100% | 100% ✅ |
| Backend - Models | Tested | 90% |
| Backend - Routes | Partial | 80% |
| **Overall Backend** | **28%** | **70%** |

## 🐛 Debugging Tests

### Frontend

**Failed test:**
```bash
npm test -- --reporter=verbose src/path/to/test.jsx
```

**Single test:**
```bash
npm test -- -t "test name"
```

**Debug in browser:**
```bash
npm run test:ui
```

### Backend

**Verbose output:**
```bash
pytest -vv tests/test_file.py
```

**Show print statements:**
```bash
pytest -s tests/test_file.py
```

**Stop on first failure:**
```bash
pytest -x tests/
```

**Drop into debugger:**
```bash
pytest --pdb tests/test_file.py
```

## 🚦 CI/CD Integration

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

See `.github/workflows/tests.yml` for configuration.

**Status:** [![Tests](https://github.com/USER/REPO/actions/workflows/tests.yml/badge.svg)](https://github.com/USER/REPO/actions/workflows/tests.yml)

## 📚 Resources

### Documentation
- **Main Guide:** [TESTING_GUIDE.md](../TESTING_GUIDE.md)
- **CI/CD Setup:** [CI_CD_SETUP.md](../CI_CD_SETUP.md)
- **Summary:** [TEST_IMPLEMENTATION_SUMMARY.md](../TEST_IMPLEMENTATION_SUMMARY.md)

### External Resources
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Pytest Documentation](https://docs.pytest.org/)
- [pytest-flask](https://pytest-flask.readthedocs.io/)

## 🤝 Contributing

### Writing New Tests

1. **Match existing patterns:** Look at similar tests
2. **Use descriptive names:** `test_creates_user_with_valid_data`
3. **Test one thing:** Each test should verify one behavior
4. **Clean up:** Use fixtures and cleanup functions
5. **Document:** Add docstrings for complex tests

### Before Committing

```bash
# Run all tests
npm test
cd backend && pytest

# Check coverage
npm run test:coverage
cd backend && pytest --cov=app

# Lint code
npm run lint
```

### Adding New Test Files

**Frontend:**
1. Create `*.test.jsx` next to component
2. Import testing utilities
3. Write tests following patterns above
4. Verify with `npm test`

**Backend:**
1. Create `test_*.py` in `backend/tests/`
2. Import fixtures from `conftest.py`
3. Use pytest markers (`@pytest.mark.unit`)
4. Verify with `pytest`

## 🎉 Success Metrics

### Current Achievements
- ✅ 146 new test cases added
- ✅ Coverage reporting configured
- ✅ CI/CD pipeline established
- ✅ Testing documentation created
- ✅ Error boundaries fully tested
- ✅ Authentication flows tested
- ✅ Input validation at 100%

### Next Milestones
- 🎯 AudioEngine testing (0% → 80%)
- 🎯 Core views testing (8% → 70%)
- 🎯 Services testing (21% → 80%)
- 🎯 Backend routes (partial → 80%)
- 🎯 Integration tests (0 → 10+ scenarios)
- 🎯 E2E tests (0 → 5+ workflows)

---

**Last Updated:** December 1, 2025
**Maintained By:** Development Team
**Test Framework:** Vitest 4.0.14 (Frontend) | Pytest 8.0.0 (Backend)
