# Help-Study-Abroad-built-with-Next.js-MUI-Zustand-and-NextAuth
A full-featured frontend design built with Next.js , MUI, Zustand, and NextAuth, consuming the [DummyJSON](https://dummyjson.com/) public API.
 
 
## Features
 
- **Authentication** — Login via NextAuth + DummyJSON auth API; JWT session; route protection via middleware
- **Users** — Paginated list with search, table (desktop) / card (mobile) layout, single user detail page
- **Products** — Paginated grid with search + category filter, image carousel on detail page, reviews section
- **State Management** — Zustand stores for auth, users, products with in-memory caching
- **Responsive UI** — MUI components, mobile-first layouts
- **Performance** — `React.memo`, `useCallback`, `useMemo`, API-side pagination, Zustand caching
  
## Setup
 
### Prerequisites
- Node.js 18+
- npm or yarn
  
### Installation
 
```bash
git clone <your-repo-url>
cd help-study-abroad
npm install
```
 
 
### Run Development Server
 
```bash
npm run dev
```
 
Open [http://localhost:3000](http://localhost:3000) in your browser.
 
### Build for Production
 
```bash
npm run build
npm start
```
 
---
 
## Demo Credentials
 
Use these DummyJSON test credentials on the login page:
 
| Field    | Value        |
|----------|--------------|
| Username | `emilys`     |
| Password | `emilyspass` |
