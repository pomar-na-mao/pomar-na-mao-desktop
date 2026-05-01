# 🍎 Pomar na Mão (Desktop)

[![Angular](https://img.shields.io/badge/Angular-21.0.3-DD0031?style=for-the-badge&logo=angular)](https://angular.io/)
[![Tauri](https://img.shields.io/badge/Tauri-2.9.1-24C8D8?style=for-the-badge&logo=tauri)](https://tauri.app/)
[![Supabase](https://img.shields.io/badge/Supabase-2.93.2-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2.2-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

**Pomar na Mão** is a modern desktop application designed for efficient orchard management and agricultural data collection. Built with cutting-edge technologies like **Angular 21** and **Tauri 2**, it provides a robust, offline-first experience for field workers and agricultural managers.

---

## ✨ Key Features

- 📊 **Field Works Dashboard**: A centralized view of all ongoing agricultural tasks and routine checks.
- 📍 **Mass Inclusion**: Efficiently plot occurrences, pests, and diseases directly on a map using Leaflet.
- 🌦️ **Weather Intelligence**: Integrated weather widgets to monitor field conditions in real-time.
- 🗺️ **Geospatial Tracking**: Detailed map views for orchard layout and occurrence tracking.
- 🔄 **Data Synchronization**: Powered by Supabase for seamless data syncing between the field and the cloud.
- 🌑 **Modern UI/UX**: Sleek interface with dark mode support, built using Tailwind CSS 4.

---

## 🚀 Tech Stack

- **Frontend Framework**: [Angular 21](https://angular.io/) (utilizing Signals and latest reactive patterns)
- **Desktop Runtime**: [Tauri 2](https://tauri.app/) (Rust-powered, lightweight desktop wrapper)
- **Persistence & Auth**: [Supabase](https://supabase.com/)
- **Mapping**: [Leaflet](https://leafletjs.com/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Translations**: [NGX-Translate](http://www.ngx-translate.com/)

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js**: `^22.12.0` or `^24.0.0`
- **Rust**: Required for Tauri builds.

### Installation

```bash
# Clone the repository
git clone https://github.com/lspei/pomar-na-mao-desktop.git

# Install dependencies
npm install
```

### Development

To start the application in development mode with Tauri:

```bash
npm run start
# or
npm run tauri:serve
```

To run exclusively in the browser:

```bash
npm run web:serve
```

---

## 📂 Project Structure

```text
src/
├── app/
│   ├── core/      # Core services, guards, and interceptors
│   ├── data/      # Repositories and data access logic
│   ├── domain/    # Domain models and business logic
│   ├── shared/    # Reusable components, pipes, and directives
│   └── ui/        # Component views, view-models, and layout
├── assets/        # Static assets (images, icons, i18n)
└── src-tauri/     # Rust backend and Tauri configuration
```

---

## 📜 Available Scripts

- `npm run start`: Starts the Tauri dev server.
- `npm run web:build`: Builds the Angular application for the web.
- `npm run tauri:bundle`: Bundles the application for production (Windows/macOS/Linux).
- `npm run lint`: Runs ESLint for code quality checks.
- `npm run test`: Runs unit tests using Vitest.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE.md).

---

<p align="center">Made with ❤️ for modern agriculture.</p>
