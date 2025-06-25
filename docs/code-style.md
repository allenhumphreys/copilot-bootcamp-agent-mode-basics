# Code Style

This document outlines the coding style conventions for this project, including imports, syntax, and formatting guidelines.

## General Formatting

- Use 2 spaces for indentation
- Use semicolons at the end of statements
- Keep line length to a maximum of 100 characters
- Use single quotes for string literals, except when avoiding escaping
- Add trailing commas for multi-line object and array literals
- Use consistent spacing inside brackets, parentheses, and braces

## JavaScript/TypeScript Conventions

### Variables and Constants

- Use `const` for values that should not be reassigned
- Use `let` for variables that need reassignment
- Avoid using `var`
- Use meaningful and descriptive variable names
- Use camelCase for variable and function names
- Use PascalCase for component names and class constructors
- Use UPPER_SNAKE_CASE for constants that are truly immutable and represent a fixed value

### Functions

- Use arrow functions for anonymous functions and callbacks
- Use function declarations for named functions when appropriate
- Keep functions small and focused on a single task
- Use descriptive function names that indicate what the function does
- Keep the number of function parameters minimal (preferably 3 or fewer)

### Import Organization

Organize imports in the following order, with a blank line between each group:

1. External libraries and frameworks
2. Project modules and components
3. Utility functions and constants
4. CSS/SCSS and other assets

Example:

```javascript
// External dependencies
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Project components
import Header from '../components/Header';
import UserCard from '../components/UserCard';

// Utilities and constants
import { formatDate, parseResponse } from '../utils/helpers';
import { API_ENDPOINTS, USER_ROLES } from '../constants';

// Styles and assets
import './styles.css';
import logo from '../assets/logo.svg';
```

### Component Structure

For React components, follow this organization:

1. Import statements
2. Prop type definitions
3. Component function
4. Helper functions
5. Export statement

Example:

```javascript
import React, { useState } from 'react';
import PropTypes from 'prop-types';

import './Button.css';

/**
 * Button component with customizable styles and click handling.
 */
function Button({ text, variant, onClick }) {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    setIsPressed(true);
    onClick();
    setTimeout(() => setIsPressed(false), 200);
  };

  return (
    <button
      className={`btn btn-${variant} ${isPressed ? 'btn-pressed' : ''}`}
      onClick={handleClick}
    >
      {text}
    </button>
  );
}

Button.propTypes = {
  text: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  onClick: PropTypes.func,
};

Button.defaultProps = {
  variant: 'primary',
  onClick: () => {},
};

export default Button;
```

### Comments and Documentation

- Use JSDoc comments for functions and components
- Use inline comments for complex logic or non-obvious code
- Keep comments up to date with code changes
- Document parameters, return values, and thrown exceptions
- Document side effects and any assumptions

Example:

```javascript
/**
 * Fetches user data from the API.
 *
 * @param {string} userId - The ID of the user to fetch
 * @param {Object} options - Additional options for the request
 * @param {boolean} options.includeProfile - Whether to include profile data
 * @returns {Promise<Object>} - The user data object
 * @throws {Error} If the user ID is invalid or the request fails
 */
async function fetchUserData(userId, options = {}) {
  // Implementation
}
```

## Backend Specific Guidelines

- Use async/await for asynchronous operations
- Organize routes by feature or resource
- Follow RESTful conventions for API endpoints
- Implement proper error handling middleware
- Validate request data before processing

## Frontend Specific Guidelines

- Keep components small and focused
- Use functional components with hooks instead of class components
- Break complex components into smaller, reusable pieces
- Manage component state appropriately
- Use consistent styling patterns (CSS, CSS Modules, or a CSS-in-JS solution)

## Testing Code Style

- Test files should be named similarly to the files they test with a `.test.js` suffix
- Organize tests with describe blocks for logical grouping
- Use clear test descriptions that explain the expected behavior
- Follow the AAA pattern (Arrange, Act, Assert)

For more guidance on testing, see the [Testing Practices](./testing-practices.md) document.

## Linting and Formatting

This project uses ESLint and Prettier to enforce code style and catch potential issues:

- **ESLint**: Analyzes code for potential errors, bugs, stylistic issues, and suspicious constructs
- **Prettier**: An opinionated code formatter that ensures consistent code formatting

### Configuration

- **ESLint Configuration**: `.eslintrc.js` at the root level with overrides for different environments
- **Prettier Configuration**: `.prettierrc` at the root level
- **Ignore Files**: `.eslintignore` and `.prettierignore` to exclude certain files and directories

### Available Scripts

#### Root Level Scripts

```bash
npm run lint          # Check for linting issues across the entire monorepo
npm run lint:fix      # Automatically fix linting issues where possible
npm run prettier      # Check code formatting
npm run prettier:fix  # Automatically format code
npm run format        # Run both prettier:fix and lint:fix
```

#### Package-Specific Scripts

```bash
# Frontend
npm run lint --workspace=frontend
npm run lint:fix --workspace=frontend
npm run prettier --workspace=frontend
npm run prettier:fix --workspace=frontend
npm run format --workspace=frontend

# Backend
npm run lint --workspace=backend
npm run lint:fix --workspace=backend
npm run prettier --workspace=backend
npm run prettier:fix --workspace=backend
npm run format --workspace=backend
```

### ESLint Rules

The project uses different ESLint configurations for different parts of the codebase:

#### Frontend (React)

- Extends `eslint:recommended`, `plugin:react/recommended`, `plugin:react-hooks/recommended`, `plugin:jsx-a11y/recommended`
- Enforces React best practices and accessibility guidelines
- Warns about unused prop types and React hooks dependencies

#### Backend (Node.js)

- Extends `eslint:recommended`
- Allows console statements (common in server-side code)
- Enforces modern JavaScript practices

#### Test Files

- Special configuration for Jest test files
- Allows console statements for debugging tests

### Prettier Configuration

The project uses the following Prettier settings:

- Single quotes for strings
- Semicolons at the end of statements
- 2-space indentation
- 100-character line width
- Trailing commas for ES5-compatible syntax
- LF line endings

### Running Linting Before Commits

Always run linting before committing code to ensure code quality:

```bash
npm run lint
```

To automatically fix most issues:

```bash
npm run format
```

### Integration with VS Code

For the best development experience, install the following VS Code extensions:

- ESLint
- Prettier - Code formatter

These extensions will provide real-time linting feedback and can format your code on save.

## Legacy Formatting Guidelines

This project previously used these manual formatting guidelines. With ESLint and Prettier now configured, these are automatically enforced:
