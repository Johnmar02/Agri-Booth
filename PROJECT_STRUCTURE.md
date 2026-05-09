# Project Structure: ITCPH Digital Agri-Booth

This document outlines the directory structure and the purpose of key files in the ITCPH Digital Agri-Booth project. The project is built using **Vue.js 3 (Composition API)**, **Three.js** for 3D rendering, and **Pinia** for state management.

## Root Directory
- `.gitignore`: Specifies files and directories that Git should ignore.
- `index.html`: The main HTML entry point for the Vite application.
- `package.json`: Contains project metadata, dependencies, and scripts.
- `vite.config.mjs`: Configuration for the Vite build tool and dev server.
- `QA_DOCUMENTATION.txt`: Detailed documentation for Quality Assurance testing.
- `PROJECT_STRUCTURE.md`: (This file) Overview of the project architecture and file system.

## /public
Contains static assets that are served directly.
- `/fonts`: Typeface JSON files used for 3D text in Three.js.
- `/images`: Static images including materials, newsletter covers, and success stories.
- `/models`: The core 3D models (e.g., `3DAgri-booth.glb`).
- `be-booth.png`: The project's main logo.
- `favicon.svg`: Browser favicon.

## /src
The main source code of the application.

### /src/assets
Contains CSS and SVG assets processed by the build tool.
- `hero.png`: Hero background image.
- `style.css`: Global application styles.

### /src/components
Reusable Vue components organized by category.
- `ThreeCanvas.vue`: A wrapper for the Three.js scene, handling 3D rendering and interaction events.
- `BoothModelView.vue`: Component for displaying the 3D model properties.
- `HotspotPanel.vue`: UI for displaying hotspot-specific information.
- `RegistrationPortal.vue`: The "Virtual Logbook" form for visitor registration and login.
- `LmsPortal.vue`: Entry point for the Learning Management System interface.
- **`src/components/admin/`**: Sub-components for the Admin Dashboard (Analytics, Feedbacks, Logbook, etc.).
- **`src/components/modules/`**: Individual functional modules (Trivia, Calculators, Chat, Training, etc.) that appear in the side drawer.

### /src/composables
Encapsulated logic using Vue's Composition API.
- `useFormManager.js`: Reusable logic for handling form validation and state.

### /src/controllers
Controller layer that orchestrates logic between models, services, and stores.
- `useBoothController.js`: Manages the main booth state, including hotspot selection and module visibility.
- `useAdminController.js`: Handles admin authentication and dashboard data fetching.
- `useLogbookController.js`: Manages the visitor registration and login process.

### /src/models
Data structures and static content definitions.
- `boothModel.js`: Central source of truth for hotspot coordinates, module metadata, and brand information.
- `logbookModel.js`: Definitions for visitor registration fields and validation rules.

### /src/services
External integration and utility services.
- `apiClient.js`: The central REST API client for communicating with the .NET backend.
- `signalrService.js`: Handles real-time communication via Microsoft SignalR.

### /src/stores (Pinia)
Application-wide reactive state management.
- `visitor.js`: Stores current visitor profile and session status.
- `contentStore.js`: Manages loaded modules and resource tracking.
- `lms.js`: State for the Learning Management System (courses, lessons, progress).
- `bebuGame.js`: State for the Trivia (Bebu Game) session and leaderboard.

### /src/views
Main page-level components and route targets.
- `BoothView.vue`: The primary interactive 3D landing page.
- `ModuleDrawerView.vue`: Orchestrates the display of functional modules in a slide-out panel.
- `AdminDashboardView.vue`: The main entry point for the administrative interface.
- `SceneView.js`: The core JavaScript class responsible for initializing the Three.js scene, camera, and lighting.
- `VisitorAuthView.vue`: Dedicated view for visitor login and registration.

### Core Files in /src
- `main.js`: The application entry point that initializes Vue, Pinia, and the Router.
- `router.js`: Defines application routes and navigation guards (e.g., protecting the `/admin` path).
- `style.css`: Global styles and CSS variables for the application.
