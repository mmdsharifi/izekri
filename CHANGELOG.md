# Changelog

## [Unreleased]

### Added

- **Vitest migration:** Switched all tests from Jest to Vitest for faster, modern testing with Vite.
- **Global test setup:** Added `setupTests.ts` to globally import `@testing-library/jest-dom` and mock HTMLMediaElement methods for jsdom compatibility.
- **Automated test-gated deploy:** `npm run deploy:ci` now runs all tests and only deploys if they pass (Netlify CLI).

### Fixed

- All test files updated to use `vi.fn`/`vi.mock` instead of `jest.fn`/`jest.mock` for Vitest compatibility.
- Fixed matcher errors by importing `@testing-library/jest-dom` in all test files.
- Fixed jsdom errors for audio elements by mocking `play` and `pause` methods.
- All tests now pass (33/33, 100% green).

### Changed

- Updated `vite.config.ts` to enable Vitest globals, jsdom environment, and setupFiles.
- Updated test scripts in `package.json` for safe, test-gated deploys.

---

See deploy logs and live app at: https://iazkari.netlify.app
