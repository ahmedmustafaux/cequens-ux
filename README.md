# CEQUENS

A modern messaging and campaign management platform built with React, Vite, and TypeScript.

## Overview

CEQUENS is a comprehensive communication platform designed to streamline messaging and campaign management for businesses of all sizes.

## Tech Stack

- 🚀 [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- ⚛️ [React](https://reactjs.org/) - A JavaScript library for building user interfaces
- 📘 [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- 🎯 [React Router](https://reactrouter.com/) - Declarative routing for React
- 🎨 [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- 🗃️ [Prisma](https://www.prisma.io/) - Next-generation ORM for Node.js and TypeScript
- 🎭 [shadcn/ui](https://ui.shadcn.com/) - Re-usable components built with Radix UI and Tailwind CSS
- 🤖 [Model Context Protocol (MCP)](https://microsoft.github.io/model-context-protocol/) - Standard protocol for AI model interaction

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/ahmedmustafaux/CEQUENS-newux.git
cd CEQUENS
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- 📱 Responsive design
- 🔒 Authentication and authorization
- 💬 Campaign management
- 📊 Analytics dashboard
- 👥 Contact management
- 📝 Message templates
- ⚡ Real-time updates
- 🌙 Dark mode support

## Development

- Run `npm run lint` to check for linting issues
- Check `DEVELOPMENT_GUIDELINES.md` for coding standards and best practices
- The project uses a modular architecture with components, contexts, and hooks organized in their respective directories

## Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

The build output will be in the `dist` directory.

## UI Components with shadcn/ui

This project uses shadcn/ui for its component library, which provides:

- 🎨 Beautiful, modern components built with Radix UI and Tailwind CSS
- ♿ Accessible and customizable components
- 🛠️ Easy installation and usage with CLI
- 📦 Copy and paste components into your project

To add new shadcn/ui components:

```bash
npx shadcn-ui@latest add [component-name]
```

## Model Context Protocol (MCP)

The project implements the Model Context Protocol (MCP) for AI integrations:

- 🤖 Standardized communication with AI models
- 📝 Context-aware interactions
- 🔄 Bi-directional streaming support
- 🎯 Improved accuracy with structured context
- 🛠️ Built-in tools and capabilities

MCP components can be found in the project structure and are used for:
- Intelligent campaign suggestions
- Context-aware message generation
- Smart contact categorization
- Analytics insights

For more information about MCP implementation, check the `DEVELOPMENT_GUIDELINES.md`.

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to help improve CEQUENS.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
