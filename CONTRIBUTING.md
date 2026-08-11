# Contributing Guidelines

Thank you for your interest in contributing to the **Enterprise Electoral Data Engineering Dashboard**!

## Code of Conduct
- Maintain professional communication and follow clean code standard practices.
- Respect Medallion Architecture rules (`data/raw`, `data/clean`, `data/processed`).

## Workflow
1. Fork the repository and create your feature branch: `git checkout -b feature/my-feature`
2. Ensure strict TypeScript types and zero linter errors (`npm run lint`).
3. Run the ETL pipeline if schema or raw data changed (`npm run etl`).
4. Build the application to verify zero compilation errors (`npm run build`).
5. Open a Pull Request detailing the changes, technical benefits, and test coverage.
