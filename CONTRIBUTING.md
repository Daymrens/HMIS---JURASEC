# Contributing to Jurasec POS

Thank you for your interest in contributing to Jurasec POS! This document provides guidelines for contributing to the project.

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- Clear description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- System information (OS, Node.js version, etc.)

### Suggesting Features

Feature suggestions are welcome! Please create an issue with:
- Clear description of the feature
- Use case and benefits
- Possible implementation approach
- Any relevant examples

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/Daymrens/HMIS---JURASEC.git
   cd HMIS---JURASEC
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed
   - Test your changes thoroughly

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add: Brief description of your changes"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Describe your changes
   - Submit the PR

## 📝 Code Style

### TypeScript/JavaScript

- Use TypeScript for type safety
- Follow existing naming conventions
- Use meaningful variable names
- Add JSDoc comments for functions
- Keep functions small and focused

### React Components

- Use functional components with hooks
- Keep components focused on single responsibility
- Extract reusable logic into custom hooks
- Use proper prop types

### CSS/Styling

- Use TailwindCSS utility classes
- Follow existing color scheme
- Ensure responsive design
- Test on different screen sizes

## 🧪 Testing

Before submitting a PR:

1. **Test the application**
   ```bash
   npm install
   npx vite build
   node build-electron.js
   npx electron .
   ```

2. **Test your specific feature**
   - Verify it works as expected
   - Test edge cases
   - Check for errors in console

3. **Test on different platforms** (if possible)
   - Linux
   - macOS
   - Windows

## 📚 Documentation

If your changes affect:
- User-facing features → Update README.md
- Setup process → Update START_HERE.md or QUICK_START.md
- Troubleshooting → Update TROUBLESHOOTING.md
- New features → Update WHATS_NEW.md

## 🎯 Areas for Contribution

### High Priority

- [ ] Bug fixes
- [ ] Performance improvements
- [ ] Security enhancements
- [ ] Documentation improvements
- [ ] Test coverage

### Feature Enhancements

- [ ] Mobile app companion
- [ ] Cloud synchronization
- [ ] Advanced analytics
- [ ] Additional integrations
- [ ] Localization improvements
- [ ] UI/UX enhancements

### Nice to Have

- [ ] Additional themes
- [ ] More report types
- [ ] Export formats
- [ ] Keyboard shortcuts
- [ ] Accessibility improvements

## 🔍 Code Review Process

1. Maintainers will review your PR
2. Feedback may be provided
3. Make requested changes if needed
4. Once approved, PR will be merged

## 📋 Commit Message Guidelines

Use clear, descriptive commit messages:

- `Add: New feature description`
- `Fix: Bug description`
- `Update: What was updated`
- `Refactor: What was refactored`
- `Docs: Documentation changes`
- `Style: Code style changes`
- `Test: Test additions or changes`

## 🚫 What Not to Do

- Don't commit `node_modules/`
- Don't commit database files
- Don't commit build outputs (`dist/`, `dist-electron/`, `release/`)
- Don't commit personal configuration files
- Don't make unrelated changes in a single PR
- Don't submit PRs without testing

## 💡 Getting Help

If you need help:
- Check existing documentation
- Search existing issues
- Create a new issue with your question
- Join discussions

## 📜 License

By contributing, you agree that your contributions will be licensed under the ISC License.

## 🙏 Thank You

Every contribution helps make Jurasec POS better for everyone. Thank you for taking the time to contribute!

---

**Happy Coding!** 🚀
