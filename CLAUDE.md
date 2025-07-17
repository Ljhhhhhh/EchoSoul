# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This project uses `pnpm` as the package manager.

### Essential Commands

- `pnpm install` - Install dependencies
- `pnpm dev` - Start development mode with hot reload (Electron + Vite)
- `pnpm build` - Build the application for production
- `pnpm typecheck` - Run TypeScript type checking across all modules
- `pnpm lint` - Run ESLint on the codebase
- `pnpm format` - Format code with Prettier

### Type Checking

- `pnpm typecheck:node` - Type check main process (Node.js) code
- `pnpm typecheck:web` - Type check renderer process (Vue) code

### Building & Distribution

- `pnpm build:win` - Build for Windows
- `pnpm build:mac` - Build for macOS
- `pnpm build:linux` - Build for Linux
- `pnpm build:unpack` - Build and create unpacked directory

### Development Workflow

- `pnpm start` - Preview the built application
- `pnpm postinstall` - Install app dependencies (runs automatically after install)

## Architecture Overview

### Technology Stack

- **Desktop Shell**: Electron 35+ with electron-vite for development
- **Renderer Process**: Vue 3 + TypeScript + Vite 6
- **Main Process**: TypeScript services architecture
- **AI/NLP**: LangChain.js integration for multiple LLM providers
- **Storage**: SQLite (metadata) + Markdown files (reports)
- **Styling**: Tailwind CSS + Vue components
- **Task Scheduling**: node-cron with in-memory queues

### Project Structure

```
src/
├── main/                    # Electron main process
│   ├── index.ts            # Main entry point
│   ├── ipc/                # IPC handlers
│   │   ├── handlers.ts     # General IPC handlers
│   │   └── initialization.ts # Initialization flow handlers
│   ├── services/           # Core business logic services
│   │   ├── AppServices.ts  # Service orchestrator
│   │   ├── AnalysisService.ts # AI analysis pipeline
│   │   ├── ChatlogHttpClient.ts # External chatlog API client
│   │   ├── ChatlogService.ts # Chatlog integration
│   │   ├── ConfigService.ts # Configuration management
│   │   ├── DatabaseService.ts # SQLite database operations
│   │   ├── InitializationManager.ts # App initialization flow
│   │   ├── ReportService.ts # Report generation and storage
│   │   └── SchedulerService.ts # Task scheduling
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utilities (logger, HTTP client, diagnostics)
├── preload/                # Electron preload scripts
├── renderer/               # Vue frontend application
│   └── src/
│       ├── App.vue         # Main Vue component
│       ├── components/     # Vue components
│       └── assets/         # Static assets
└── types/                  # Shared type definitions
```

### Service Architecture

The main process uses a service-oriented architecture with dependency injection:

1. **AppServices**: Central orchestrator that manages all other services
2. **ConfigService**: Handles secure configuration storage and API key management
3. **ChatlogService**: Integrates with external chatlog APIs for data retrieval
4. **AnalysisService**: AI-powered analysis using LangChain.js
5. **ReportService**: Generates and stores Markdown reports with SQLite metadata
6. **SchedulerService**: Manages automated tasks and cron jobs
7. **DatabaseService**: SQLite database operations
8. **InitializationManager**: Complex initialization workflow with progress tracking

### Data Storage Strategy

- **SQLite Database**: Stores structured metadata (reports, settings, task status)
- **Markdown Files**: Stores report content for readability and version control
- **Encrypted Storage**: API keys stored securely using electron-store

### IPC Communication

- Main process exposes services through IPC handlers in `src/main/ipc/`
- Initialization flow has dedicated handlers for multi-step setup process
- Event-driven architecture for progress updates and notifications

### Key Features

- **WeChat Integration**: Detects WeChat processes and integrates with chatlog APIs
- **Multi-LLM Support**: Supports OpenAI, Anthropic, Gemini, DeepSeek via LangChain
- **Automated Reports**: Scheduled daily report generation
- **Custom Analysis**: User-defined time ranges and analysis parameters
- **Progress Tracking**: Real-time task progress with cancellation support

### Development Notes

- Uses electron-vite for optimal development experience
- TypeScript strict mode enabled across all modules
- Separate tsconfig files for main process (Node.js) and renderer (web)
- Vue 3 with Composition API in renderer process
- Service initialization follows dependency order in AppServices.ts
