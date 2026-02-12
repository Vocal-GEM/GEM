# Tooling Maturity Roadmap

This document describes the quality gates for local development and CI.

## Current quality gates

- `npm run lint`: permissive linting for local iteration (`--max-warnings 600`).
- `npm run lint:ci`: strict linting (`--max-warnings 0`) for CI.
- `npm run test`: default Vitest watch/developer mode.
- `npm run test:ci`: CI test run with coverage reporting.
- `npm run build`: production build.
- `npm run analyze`: production build with bundle analysis (`dist/stats.html`).

## Near-term targets

1. **Lint budget ratchet**
   - Reduce local max warnings from 600 to 300, then 150, then 0.
   - Keep CI at 0 warnings for changed code paths.

2. **Coverage ratchet**
   - Raise thresholds each sprint while preserving stable tests.
   - Suggested path: lines/functions/statements 55 -> 65 -> 75 and branches 45 -> 55 -> 65.

3. **Flaky test budget**
   - Track known flaky suites and maintain a max flaky count of 0 in CI.
   - Quarantine unstable tests with owner + fix date if needed.

4. **Build diagnostics hygiene**
   - Keep bundle analysis opt-in via `npm run analyze`.
   - Review `dist/stats.html` during dependency upgrades and feature launches.

## Conventions

- Use Node version from `.nvmrc` for local development.
- Keep `engines` in `package.json` aligned with `.nvmrc`.
- Any new CI gate should be introduced in warning mode first, then enforced.
