# Material-UI (MUI) Guidelines

## Overview

Material-UI (MUI) is the preferred React component library for this project. Use MUI components instead of plain HTML elements when possible.

## Key Components

- **Tables**: Use `Table`, `TableBody`, `TableCell`, `TableContainer`, `TableHead`, `TableRow`
- **Buttons**: Use `Button` component instead of HTML `<button>`
- **Forms**: Use `TextField`, `Select`, `Checkbox` components
- **Layout**: Use `Container`, `Grid`, `Box` for layout

## Installation

```bash
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
```

## Basic Usage

```jsx
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

<TableContainer component={Paper}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Name</TableCell>
        <TableCell>Actions</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {data.map((item) => (
        <TableRow key={item.id}>
          <TableCell>{item.name}</TableCell>
          <TableCell>
            <Button variant="contained" color="error">
              Delete
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
```

## Best Practices

- Import components individually: `import { Button } from '@mui/material'`
- Use `sx` prop for styling instead of inline styles
- Prioritize MUI components over HTML elements