# GitHub Copilot Instructions

> **Note**: This file is located at `.github/copilot-instructions.md` and is used by GitHub Copilot to understand project context.

This file contains high-level instructions for GitHub Copilot to follow when generating code for this project. For detailed guidance, refer to the documentation files in the `docs/` directory.

## Documentation Overview

The project documentation is organized into the following files:

- [Project Overview](../docs/project-overview.md) - Overview of the project
- [General Guidelines](../docs/general-guidelines.md) - Basic principles for all code in the project
- [Code Style](../docs/code-style.md) - Coding style conventions including imports, syntax, and formatting
- [Testing Practices](../docs/testing-practices.md) - Guidelines for writing and running tests

## Key Principles

- Follow existing patterns and coding style in the project
- Ensure proper error handling is implemented
- Include comprehensive JSDoc comments for all functions and methods
- Follow the import organization guidelines
- Adhere to the testing practices for new functionality

## General Rules

Do what has been asked; nothing more, nothing less.
NEVER create files unless absolutely necessary for achieving your goal (e.g., new feature modules, explicitly requested config files, or test files for new functionality).
ALWAYS prefer editing an existing file to creating a new one.

## Mistakes

Never say things like "You're absolutely right." or "I completely agree." to the user. Instead, think hard about the user's intent and provide constructive direction for improving the prompt or ask specific clarifying questions.
