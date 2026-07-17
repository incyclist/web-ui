---
applyTo: '**/*.{js,jsx}'
---
For test files, follow these guidelines:
1. Use descriptive names for test files, including the name of the module being tested. The pattern should be <module>.unit.test.js / <module>.unit.test.jsx for unit tests.
2. Store tests next to the code under test (in the same directory).
3. Write unit tests for externally exposed functions, hooks and components.
4. Use mocking and stubbing (vi.mock, vi.fn) to isolate tests from external dependencies (incyclist-services, incyclist-devices, other modules).
5. Aim for high test coverage, but prioritize testing critical functionality.
6. Write tests that are easy to understand and maintain.
7. Use "describe" and "test" blocks to group related tests and improve test organization.
8. In the test: use a descriptive name for the test case that clearly conveys its purpose - not necessarily the expected outcome. Don't start with "should ...", just describe the behavior being tested.
9. Create one "describe" block for each component, hook or function being tested, and nest "test" blocks within it for each individual scenario.
10. If test data is required, store this in a `__tests__` directory, following the logic of what the data represents (routes, workouts, ...).
11. Tests should be independent and not rely on each other. Use beforeEach/afterEach hooks to set up and tear down any shared state and/or mocks at the right level.
12. It is important that tests are deterministic and produce the same results each time they are run. Avoid using random data or relying on external state.
13. Clear/restore mocks after each test (vi.clearAllMocks() in afterEach) so the next test starts with a clean slate.
14. Keep a proper structure in your tests: imports at the top of the file (external libraries, then internal libraries/hooks, then the module under test), then test cases in the same order the scenarios occur in the file under test.
