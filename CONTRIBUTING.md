# Contributing to EV-CMS Brand Admin

Thank you for your interest in contributing to EV-CMS Brand Admin! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, Node version)

### Suggesting Features

1. Check existing feature requests in Issues
2. Create a new issue with:
   - Clear description of the feature
   - Use case and benefits
   - Potential implementation approach

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the code style guidelines
   - Write tests for new features
   - Update documentation as needed

4. **Run tests and linting**
   ```bash
   npm run lint
   npm test
   npm run build
   ```

5. **Commit your changes**
   - Use clear, descriptive commit messages
   - Follow conventional commits format:
     ```
     feat: add new feature
     fix: resolve bug
     docs: update documentation
     style: formatting changes
     refactor: code restructuring
     test: add tests
     chore: maintenance tasks
     ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Provide a clear description
   - Reference related issues
   - Include screenshots for UI changes

## Development Setup

### Prerequisites
- Node.js 18 or higher
- npm 9 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/Janakar-cloud/ev-cms-brand-admin.git
cd ev-cms-brand-admin

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

## Code Style Guidelines

### TypeScript
- Use TypeScript for all new code
- Define proper types/interfaces
- Avoid `any` type when possible
- Use meaningful variable names

### React Components
- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Follow React best practices

### Styling
- Use Tailwind CSS utility classes
- Follow existing component patterns
- Ensure responsive design
- Use CSS variables for theming

### File Organization
```
src/
├── app/              # Next.js pages
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   └── [feature]/   # Feature-specific components
├── lib/             # Utilities and services
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
└── styles/          # Global styles
```

## Testing

- Write unit tests for utilities and hooks
- Write integration tests for components
- Maintain minimum 80% code coverage
- Test edge cases and error scenarios

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## Documentation

- Update README.md for new features
- Add JSDoc comments for complex functions
- Update API documentation
- Include examples in documentation

## Review Process

1. All PRs require at least one review
2. Address review comments promptly
3. Keep PR scope focused and manageable
4. Ensure CI/CD checks pass

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create a release tag
4. Deploy to staging for testing
5. Deploy to production

## Questions?

- Open an issue for questions
- Check existing documentation
- Review closed issues for solutions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
