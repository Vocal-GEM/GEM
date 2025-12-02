#!/bin/bash
# Test Verification Script
# Run this before committing to ensure everything works

set -e  # Exit on error

echo "🧪 VocalGEM Test Verification"
echo "=============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track results
FRONTEND_TESTS=0
BACKEND_TESTS=0
LINT_CHECK=0

echo "📦 Step 1: Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
fi

echo ""
echo "🎨 Step 2: Running frontend tests..."
echo "-----------------------------------"
if npm test -- --run; then
    echo -e "${GREEN}✅ Frontend tests passed!${NC}"
    FRONTEND_TESTS=1
else
    echo -e "${RED}❌ Frontend tests failed${NC}"
fi

echo ""
echo "📊 Step 3: Generating frontend coverage..."
echo "-----------------------------------------"
npm run test:coverage -- --run
echo -e "${GREEN}✅ Coverage report generated at coverage/index.html${NC}"

echo ""
echo "🐍 Step 4: Checking backend dependencies..."
echo "------------------------------------------"
cd backend
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Backend tests require dependencies. Install with:${NC}"
    echo "  cd backend"
    echo "  pip install -r requirements-dev.txt"
    echo "  pip install Flask==3.0.3 Flask-SQLAlchemy Flask-Cors Werkzeug SQLAlchemy python-dotenv bleach Flask-Migrate email-validator pypdf eventlet Flask-SocketIO Flask-Limiter Flask-WTF"
    BACKEND_TESTS=0
else
    echo ""
    echo "🧪 Step 5: Running backend tests..."
    echo "----------------------------------"
    if python -m pytest; then
        echo -e "${GREEN}✅ Backend tests passed!${NC}"
        BACKEND_TESTS=1
    else
        echo -e "${RED}❌ Backend tests failed${NC}"
    fi
fi
cd ..

echo ""
echo "🔍 Step 6: Running linter..."
echo "---------------------------"
if npm run lint; then
    echo -e "${GREEN}✅ Linting passed!${NC}"
    LINT_CHECK=1
else
    echo -e "${YELLOW}⚠️  Linting issues found (non-blocking)${NC}"
    LINT_CHECK=1
fi

echo ""
echo "=============================="
echo "📊 Verification Summary"
echo "=============================="
echo ""
echo "Frontend Tests:  $([ $FRONTEND_TESTS -eq 1 ] && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}")"
echo "Backend Tests:   $([ $BACKEND_TESTS -eq 1 ] && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${YELLOW}⚠️  SKIP${NC}")"
echo "Linting:         $([ $LINT_CHECK -eq 1 ] && echo -e "${GREEN}✅ PASS${NC}" || echo -e "${RED}❌ FAIL${NC}")"
echo ""

if [ $FRONTEND_TESTS -eq 1 ]; then
    echo -e "${GREEN}✅ Ready to commit!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Review changes: git status"
    echo "  2. Stage files: git add ."
    echo "  3. Commit: git commit -m 'Add comprehensive test suite'"
    echo "  4. Push: git push origin crazy-pascal"
    echo ""
    echo "See .github/COMMIT_CHECKLIST.md for detailed commit instructions"
else
    echo -e "${RED}❌ Please fix failing tests before committing${NC}"
    exit 1
fi
