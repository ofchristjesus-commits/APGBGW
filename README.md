# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)
## Installation

From the repository root:

```bash
cd frontend
npm install
cd ../backend
npm install
```

Then use the wrapper scripts from the repository root:

- `npm run dev` - starts the frontend Vite server from `frontend/`
- `npm run serve-api` - starts the backend API server from `backend/` on `http://localhost:4000`
## Backend and API Integration

This project includes a simple backend API powered by `Express` and a JSON file-based database (`db.json`). The frontend is configured to proxy `/api` calls to the backend during development.

### Available scripts

- `npm run dev` - starts the frontend Vite server from `frontend/`
- `npm run serve-api` - starts the backend API server from `backend/` on `http://localhost:4000`

### Backend API endpoints

- `GET /api/:entity`
- `GET /api/:entity/:id`
- `POST /api/:entity`
- `PUT /api/:entity/:id`
- `DELETE /api/:entity/:id`

Entities are stored in `db.json` once created.

### Frontend API client

The frontend can call the API using `frontend/src/lib/apiClient.js`.

### Environment

To use API in production or from another host, set `VITE_API_BASE_URL` in your environment.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
