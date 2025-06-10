# Vue 3 Kanban Board

A modern, responsive, and feature-rich Kanban board application built with Vue 3, Vuetify, and TypeScript. This project uses Supabase for its backend, providing real-time data synchronization and persistence.

**[🚀 Live Demo](https://kanban-board-azure-ten.vercel.app)**

[Kanban Board Video](./public/kanban-demo.gif)

## ✨ Key Features

- **Drag & Drop:** Intuitively move cards between columns.
- **Real-time Database:** Changes are instantly reflected for all users, powered by Supabase.
- **Card Management:** Create, edit, and delete cards through a clean dialog interface.
- **Responsive Design:** A seamless experience on both desktop and mobile devices.
- **Light & Dark Mode:** Switch between themes to suit your preference.
- **Form Validation:** Ensures data integrity when creating or editing cards.
- **Confirmation Dialogs:** Prevents accidental deletions of cards.

## 🛠️ Tech Stack

- **Frontend:**
  - [Vue 3](https://vuejs.org/) (Composition API)
  - [Vuetify 3](https://vuetifyjs.com/)
  - [Vue Router](https://router.vuejs.org/)
  - [TypeScript](https://www.typescriptlang.org/)
- **Backend & Database:**
  - [Supabase](https://supabase.io/) (PostgreSQL database)
- **Build & Dev Tools:**
  - [Vite](https://vitejs.dev/)
  - [ESLint](https://eslint.org/) & [Prettier](https://prettier.io/)
- **Testing:**
  - [Vitest](https://vitest.dev/)
  - [Vue Test Utils](https://test-utils.vuejs.org/)

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/en/) (v22.x or later recommended)
- [npm](https://www.npmjs.com/) (v10.x or later)
- A Supabase account and a new project.

### 2. Clone the Repository

```bash
git clone https://github.com/your-username/kanban-board.git
cd kanban-board
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up Environment Variables

This project requires a connection to a Supabase backend. Create a `.env` file in the root of the project by copying the example file:

```bash
cp .env.example .env
```

Now, open the `.env` file and add your Supabase Project URL and Anon Key. You can find these in your Supabase project dashboard under `Project Settings > API`.

```env
VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

### 5. Set Up Supabase Database

You need to run the SQL scripts located in `supabase/migrations` in your Supabase SQL Editor to set up the necessary tables (`columns`, `cards`) and policies.

## 📜 Available Scripts

### Run for Development

Starts the development server with hot-reloading.

```bash
npm run dev
```

### Run Unit Tests

Executes the component and composable unit tests using Vitest.

```bash
npm run test:unit
```

### Lint and Format

Checks for linting and formatting errors and attempts to fix them.

```bash
npm run lint
npm run format
```

### Build for Production

Compiles, type-checks, and minifies the application for production deployment.

```bash
npm run build
```

## ✅ Testing

The project maintains a high standard of code quality through comprehensive unit tests. We use **Vitest** for running tests and **Vue Test Utils** for mounting and interacting with Vue components. Key areas covered include:

- **Component Rendering:** Verifying that components render correctly in different states (e.g., create vs. edit mode).
- **Event Emission:** Ensuring components emit the correct events with the expected payloads.
- **Composable Logic:** Testing the reactive state and functions within our composables.
- **Mocking:** Dependencies like composables, browser APIs, and Vuetify components are mocked to ensure isolated and reliable tests.

## 📦 Deployment

This application is configured for easy deployment to platforms like Vercel
