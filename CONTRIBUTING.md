# Contributing to SuiLinkTree

Thank you for your interest in contributing to SuiLinkTree! This document provides guidelines for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)

## 🤝 Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

## 💡 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- Clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, wallet, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- Use a clear and descriptive title
- Provide detailed description of the proposed feature
- Explain why this enhancement would be useful
- Include mockups or examples if possible

### Code Contributions

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 🛠️ Development Setup

### Prerequisites

- Node.js v18+
- Sui CLI
- Walrus CLI
- Git

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sui-linktree.git
   cd sui-linktree
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Copy environment file**
   ```bash
   cp .env.example .env
   ```

4. **Build Move contract**
   ```bash
   sui move build
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🔄 Pull Request Process

1. **Update documentation** if you're changing functionality
2. **Add tests** for new features
3. **Ensure all tests pass** (`npm test`)
4. **Update README.md** if needed
5. **Follow coding standards** (see below)
6. **Request review** from maintainers

### PR Title Format

Use conventional commit format:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Example: `feat: add dark mode theme option`

## 📝 Coding Standards

### TypeScript/JavaScript

- Use TypeScript for type safety
- Follow ESLint configuration
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Move (Smart Contracts)

- Follow Move best practices
- Add inline documentation
- Use descriptive error codes
- Test all functions thoroughly
- Consider gas optimization

### React Components

- Use functional components with hooks
- Keep components small and reusable
- Use props interfaces
- Add PropTypes or TypeScript types
- Follow component naming conventions

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow mobile-first approach
- Ensure accessibility (WCAG 2.1 AA)
- Test on multiple browsers

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run Move tests
npm run move:test

# Run with coverage
npm test -- --coverage
```

### Writing Tests

- Write tests for new features
- Maintain test coverage above 80%
- Test edge cases and error conditions
- Use descriptive test names

Example:
```typescript
describe('LinkTreeService', () => {
  it('should create a profile with valid data', async () => {
    // Test implementation
  });
  
  it('should throw error when name already exists', async () => {
    // Test implementation
  });
});
```

## 📂 Project Structure

```
sui-linktree/
├── sources/           # Move smart contracts
├── src/
│   ├── components/    # React components
│   ├── lib/          # Services and utilities
│   ├── pages/        # Page components
│   └── types/        # TypeScript types
├── public/           # Static assets
└── tests/            # Test files
```

## 🐛 Debugging

### Frontend Debugging

- Use React Developer Tools
- Check browser console for errors
- Use network tab for API issues
- Enable verbose logging

### Smart Contract Debugging

```bash
# Build with debug info
sui move build --dev

# Run tests with verbose output
sui move test --verbose
```

## 📖 Additional Resources

- [Sui Documentation](https://docs.sui.io/)
- [Walrus Documentation](https://docs.wal.app/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## ❓ Questions?

- Open an issue for technical questions
- Join our Discord (if available)
- Check existing issues and discussions

## 🙏 Thank You!

Your contributions make SuiLinkTree better for everyone. We appreciate your time and effort!
