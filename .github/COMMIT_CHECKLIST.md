# Pre-Commit Checklist

Before committing the new test infrastructure, verify:

## ✅ Automated Checks (Run These)

```bash
# 1. Run frontend tests
npm test

# 2. Run frontend tests with coverage
npm run test:coverage

# 3. Run backend tests (requires dependencies)
cd backend
pip install -r requirements-dev.txt
pip install Flask==3.0.3 Flask-SQLAlchemy Flask-Cors Werkzeug SQLAlchemy python-dotenv bleach Flask-Migrate email-validator pypdf eventlet Flask-SocketIO Flask-Limiter Flask-WTF
pytest

# 4. Run linting
cd ..
npm run lint
```

## 📋 Manual Verification

- [ ] All new test files are in correct locations
- [ ] Coverage reports generate successfully
- [ ] Documentation files are complete
- [ ] .gitignore updated for coverage files
- [ ] GitHub Actions workflow is valid YAML

## 🚀 Ready to Commit

Once all checks pass:

```bash
# Stage all test files
git add .github/workflows/tests.yml
git add backend/pytest.ini
git add backend/requirements-dev.txt
git add backend/tests/

git add src/components/ui/ErrorBoundary.test.jsx
git add src/components/ui/GlobalErrorBoundary.test.jsx
git add src/components/ui/Login.test.jsx
git add src/components/ui/Signup.test.jsx

git add src/hooks/useAchievements.test.js
git add src/hooks/useFeedback.test.js
git add src/hooks/useSpeechRecognition.test.js

git add vitest.config.js
git add package.json
git add .gitignore

# Stage documentation
git add TESTING_GUIDE.md
git add TEST_IMPLEMENTATION_SUMMARY.md
git add CI_CD_SETUP.md
git add tests/README.md
git add .github/COMMIT_CHECKLIST.md

# Create commit
git commit -m "Add comprehensive test suite with CI/CD

- Add 7 frontend test files (94 test cases)
- Add 4 backend test files (52 test cases)
- Configure coverage reporting (frontend & backend)
- Set up GitHub Actions CI/CD pipeline
- Add comprehensive testing documentation
- Achieve 28% backend coverage, 100% validator coverage
- Test error boundaries, authentication, and critical hooks

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to branch
git push origin crazy-pascal
```

## 📊 Expected Results

After pushing:
- GitHub Actions will run automatically
- Tests will execute on Node 18, 20 and Python 3.10, 3.11, 3.12
- Coverage reports will be generated
- You'll see status checks in the PR

## 🔍 Troubleshooting

**If tests fail in CI:**
1. Check the Actions tab for detailed logs
2. Verify all dependencies are in package.json/requirements.txt
3. Ensure environment variables are set if needed

**If coverage upload fails:**
1. Codecov token may be needed for private repos
2. Add `CODECOV_TOKEN` secret in repo settings
3. Or remove Codecov steps from workflow (tests will still run)
