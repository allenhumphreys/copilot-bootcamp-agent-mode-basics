# Project Overview

## Introduction

This project is a full-stack JavaScript application designed as a starter template for the Copilot Bootcamp by Slalom. It consists of a React frontend and a Node.js/Express backend, organized in a monorepo structure using npm workspaces.

## Architecture

The project follows a monorepo architecture with the following structure:

- `packages/frontend/`: React-based web application
- `packages/backend/`: Express.js API server

## Technology Stack

### Frontend

- React
- React DOM
- Material-UI (MUI) for component library
- Luxon for date parsing and manipulation
- CSS for styling
- Jest for testing

### Backend

- Node.js
- Express.js
- SQLite with better-sqlite3 for in-memory database
- Jest for testing

### Date Handling

The application uses Luxon for all date parsing and manipulation in the frontend to ensure consistent handling of SQLite timestamp formats (`YYYY-MM-DD HH:MM:SS`). SQLite timestamps are treated as UTC and properly converted for display in the user's local timezone.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

1. Clone the repository
2. Run `npm install` at the root of the project to install all dependencies
3. Start the development environment using `npm run start`

### Code Quality Tools

The project includes ESLint and Prettier for code linting and formatting:

- **ESLint**: Enforces coding standards and catches potential issues
- **Prettier**: Ensures consistent code formatting
- Run `npm run lint` to check for issues
- Run `npm run format` to automatically fix formatting and linting issues

## Development Workflow

The project uses npm workspaces to manage the monorepo structure. You can:

- Run `npm run start` from the root to start both frontend and backend in development mode
- Run `npm test` from the root to run tests for all packages
- Work on individual packages by navigating to their directories and using their specific scripts

## Deployment

Deployment instructions and environments will be covered in the bootcamp sessions.

## Next Steps

Refer to the other documentation files for more detailed guidance:

- [General Guidelines](./general-guidelines.md)
- [Code Style](./code-style.md)
- [Testing Practices](./testing-practices.md)
