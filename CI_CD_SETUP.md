# CI/CD Setup Guide

This guide explains how to set up continuous integration and deployment for the VocalGEM project.

## GitHub Actions (Included)

A GitHub Actions workflow has been created at `.github/workflows/tests.yml` that will:

### Frontend Tests
- Run on Node.js 18.x and 20.x
- Execute `npm run test:coverage`
- Upload coverage to Codecov
- Archive coverage reports as artifacts

### Backend Tests
- Run on Python 3.10, 3.11, and 3.12
- Execute `pytest --cov=app`
- Upload coverage to Codecov
- Archive coverage reports as artifacts

### Linting
- Run ESLint on all JavaScript/JSX files

## Setup Instructions

### 1. Enable GitHub Actions

The workflow file is already created. Just push to GitHub:

```bash
git add .github/workflows/tests.yml
git commit -m "Add CI/CD pipeline with tests"
git push
```

### 2. Add Codecov Integration (Optional)

For coverage tracking:

1. Go to [codecov.io](https://codecov.io)
2. Sign in with GitHub
3. Enable your repository
4. Add badge to README (see Badge section below)

**Note:** The workflow will work without Codecov - it just won't upload coverage reports.

### 3. Add Status Badges to README

Add these badges to the top of your `README.md`:

```markdown
# VocalGEM

[![Tests](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/tests.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO)
[![Frontend Coverage](https://img.shields.io/badge/frontend%20coverage-check%20codecov-brightgreen)](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO)
[![Backend Coverage](https://img.shields.io/badge/backend%20coverage-28%25-yellow)](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO)
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your actual GitHub username and repository name.

## Local Development Workflow

### Before Committing

```bash
# Run frontend tests
npm run test:coverage

# Run backend tests
cd backend
pytest --cov=app

# Run linter
npm run lint

# Fix linting issues automatically
npm run lint -- --fix
```

### Pre-commit Hook (Optional)

Create `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run frontend tests
npm test

# Run backend tests
cd backend && pytest
```

Install husky:
```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm test"
```

## Deployment

### Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

3. Add environment variables in Vercel dashboard:
   - `VITE_API_URL` - Your backend API URL

### Backend Deployment (Render/Heroku)

**Render:**
1. Connect GitHub repository
2. Create new Web Service
3. Configure:
   - **Build Command:** `cd backend && pip install -r requirements.txt`
   - **Start Command:** `cd backend && gunicorn wsgi:app`
   - **Environment:** Python 3.11

**Heroku:**
1. Create `Procfile` in backend/:
   ```
   web: gunicorn wsgi:app
   ```

2. Deploy:
   ```bash
   heroku create your-app-name
   git subtree push --prefix backend heroku main
   ```

## Coverage Goals

### Current Coverage
- **Frontend:** Now tracked via coverage reports
- **Backend:** 28% (validators: 100%, models tested, auth partially tested)

### Target Coverage
- **Critical paths:** 80% minimum
- **Overall goal:** 70% minimum
- **Validators/Security:** 100% (already achieved!)

### Monitoring Coverage

After each push, check:
1. GitHub Actions tab - see test results
2. Codecov dashboard - detailed coverage reports
3. Coverage artifacts - download HTML reports from Actions

## Troubleshooting

### Tests Fail in CI but Pass Locally

**Common causes:**
1. **Environment differences:** Check Node/Python versions
2. **Missing dependencies:** Ensure all deps in package.json/requirements.txt
3. **Timezone issues:** Use UTC in tests
4. **File paths:** Use cross-platform path handling

### Coverage Upload Fails

**If Codecov token needed:**
1. Go to Codecov settings
2. Copy repository upload token
3. Add as GitHub secret: `CODECOV_TOKEN`
4. Update workflow to use secret

### Slow Test Execution

**Optimization tips:**
1. Use `--maxWorkers=2` for Vitest
2. Mark slow tests with pytest markers
3. Run unit tests before integration tests
4. Cache dependencies in CI

## Advanced Configuration

### Matrix Testing Strategy

Current setup tests multiple versions:
- **Node.js:** 18.x, 20.x
- **Python:** 3.10, 3.11, 3.12

This ensures compatibility across different environments.

### Caching Dependencies

The workflow uses caching:
- `cache: 'npm'` for Node.js dependencies
- `cache: 'pip'` for Python dependencies

This speeds up CI runs significantly.

### Parallel Test Execution

Tests run in parallel by default:
- Frontend and backend jobs run simultaneously
- Matrix strategy runs versions in parallel

### Artifact Retention

Coverage reports are stored for 90 days by default. Adjust in workflow:

```yaml
- name: Archive coverage report
  uses: actions/upload-artifact@v3
  with:
    name: coverage-report
    path: coverage/
    retention-days: 30  # Adjust as needed
```

## Notifications

### Slack Integration

Add to workflow for Slack notifications:

```yaml
- name: Slack Notification
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Tests completed'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
  if: always()
```

### Email Notifications

GitHub sends email notifications automatically for:
- Failed workflows on your branches
- Failed workflows on PRs you created

Configure in GitHub Settings → Notifications

## Performance Benchmarks

Add to workflow to track performance:

```yaml
- name: Run performance tests
  run: npm run test:performance

- name: Upload results
  uses: actions/upload-artifact@v3
  with:
    name: performance-results
    path: performance/
```

## Security Scanning

### Add Dependency Scanning

```yaml
- name: Run npm audit
  run: npm audit --production

- name: Run safety check
  run: |
    cd backend
    pip install safety
    safety check
```

### Add SAST

Use GitHub's built-in security features:
- Dependabot for dependency updates
- CodeQL for code scanning
- Secret scanning

Enable in repository Settings → Security.

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Codecov Documentation](https://docs.codecov.com/)
- [Vitest CI Guide](https://vitest.dev/guide/ci.html)
- [Pytest CI Guide](https://docs.pytest.org/en/stable/how-to/usage.html#continuous-integration)

---

**Status:** CI/CD pipeline configured and ready to use!
**Last Updated:** December 1, 2025
