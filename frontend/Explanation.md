# EXPLANATION — frontend/

## Purpose (Why does this folder/file exist?)

The `frontend/` folder contains the React application that users interact with — the dashboard, forms, invoice views, and client lists. It's a single-page application (SPA) that communicates with the backend API to display and manipulate data.

The frontend is intentionally **minimal** — it focuses on functionality over visual polish, using plain CSS or a utility library. This is a deliberate scope decision: FreelanceFlow is a personal tool, and over-engineering the UI delays building the features that matter.

---

## How it works (Step-by-step explanation in plain English)

### Vite + React Setup

**What is Vite?**
Vite is a build tool and development server for modern JavaScript projects. It replaces Create React App (CRA) and webpack for most use cases.

In development:
- Vite serves your files using native ES modules — no bundling step, so the dev server starts in milliseconds
- Hot Module Replacement (HMR) updates the browser instantly when you save a file

In production:
- Vite bundles and minifies your code using Rollup under the hood

**Project structure:**
```
frontend/
├── public/           ← Static files (favicon, index.html)
├── src/
│   ├── main.jsx      ← Entry point — renders <App /> into the DOM
│   ├── App.jsx       ← Root component — sets up routing
│   ├── pages/        ← One component per route/page
│   ├── components/   ← Reusable UI pieces (buttons, cards, tables)
│   ├── api/          ← Axios call functions
│   └── styles/       ← CSS files
├── index.html        ← HTML shell that Vite injects the bundle into
└── vite.config.js    ← Vite configuration
```

### How a page renders (end-to-end)

1. User visits `/invoices`
2. React Router matches the route and renders `<InvoicesPage />`
3. `InvoicesPage` calls `useEffect` on mount, which calls `getInvoices()` from `src/api/invoices.js`
4. `getInvoices()` uses axios to call `GET /api/invoices` with the stored auth token
5. The backend responds with JSON
6. The component stores the data in `useState` and re-renders with the invoice list

```
User navigates → React Router → Page Component
                                    ↓ useEffect
                                 api/invoices.js (axios)
                                    ↓ HTTP request
                                 Backend API
                                    ↓ JSON response
                                 useState → re-render
```

---

### How axios calls are structured

Axios is an HTTP client library. In FreelanceFlow, API calls are organized in `src/api/` — one file per resource.

**Setup — `src/api/axios.js`:**
```js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

**Why `axios.create()`?**
Creating a configured instance means every call automatically uses the right base URL and auth header — you don't repeat this setup in every file.

**Why an interceptor for the token?**
The alternative is passing `headers: { Authorization: ... }` in every API call. The interceptor does this once, centrally. If you later change from `localStorage` to `sessionStorage` or cookies, you update one line.

**Resource-specific API file — `src/api/invoices.js`:**
```js
import api from './axios';

export const getInvoices = () =>
  api.get('/invoices');

export const getInvoiceById = (id) =>
  api.get(`/invoices/${id}`);

export const createInvoice = (data) =>
  api.post('/invoices', data);

export const updateInvoice = (id, data) =>
  api.put(`/invoices/${id}`, data);

export const deleteInvoice = (id) =>
  api.delete(`/invoices/${id}`);

export const downloadInvoicePDF = (id) =>
  api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
```

**Usage in a component:**
```jsx
import { getInvoices } from '../api/invoices';

function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getInvoices()
      .then(res => setInvoices(res.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <ul>
      {invoices.map(inv => (
        <li key={inv._id}>{inv.invoiceNumber} — {inv.status}</li>
      ))}
    </ul>
  );
}
```

---

## Key decisions

### Why Vite instead of Create React App?

| Feature | Create React App | Vite |
|---|---|---|
| Dev server start | 10-30 seconds | < 1 second |
| HMR speed | Slow | Near-instant |
| Bundle size | Larger | Smaller |
| Config flexibility | Hard to customize | Easy |
| Status | Deprecated | Actively maintained |

CRA is no longer maintained. Vite is the current standard.

### Why no custom hooks for API calls?

Custom hooks (e.g., `useFetch`, `useInvoices`) are a common pattern for abstracting data fetching logic. FreelanceFlow deliberately avoids them for simplicity — the data fetching lives directly in `useEffect` inside each page component.

**Trade-offs:**
- **Simpler to read**: A junior dev can see exactly what's happening in one file without following abstractions
- **Some duplication**: Loading/error state boilerplate is repeated across components
- If the app grew significantly, extracting `useInvoices()` or using a library like React Query would eliminate the duplication and add caching

This is a valid trade-off for a personal tool. The decision can always be revisited.

### Why localStorage for the token?

The auth token is stored in `localStorage` after login and read by the axios interceptor on every request.

**Alternative: HTTP-only cookies**
- More secure (immune to XSS attacks — JavaScript can't read HTTP-only cookies)
- Requires backend changes (set cookie on login, read cookie on requests)
- CSRF protection needed

For a personal tool with a single user, `localStorage` is simpler. For a multi-user production app, HTTP-only cookies are the better choice.

### Why minimal UI / plain CSS?

FreelanceFlow is a backend-focused project. The frontend exists to demonstrate the API, not to be a polished product. Heavy UI libraries (Material UI, Chakra) add bundle size and learning curve. A minimal approach keeps focus on the business logic.

---

## Functions / Exports

### `src/api/axios.js` — default export `api`
- **What it does**: Creates an axios instance with base URL and automatic auth header injection
- **Gotchas**: `VITE_API_URL` must start with `VITE_` — Vite only exposes env vars with this prefix to the browser. Without this prefix, `import.meta.env.VITE_API_URL` is undefined.

### `src/api/*.js` — named exports per resource
Each file exports named async functions that return axios promises. Callers use `.then()` / `.catch()` or `async/await` to handle the response.

- `res.data` contains the response body parsed as JSON
- `err.response.data` contains the error body from the backend
- `err.response.status` contains the HTTP status code (401, 404, etc.)

### `src/main.jsx`
- Entry point — mounts `<App />` into `document.getElementById('root')`
- Wraps everything in `<BrowserRouter>` (React Router) if not done in `App.jsx`

### `src/App.jsx`
- Defines all routes using `<Routes>` and `<Route>`
- Handles protected route logic — if no token in localStorage, redirect to `/login`

---

## What you should learn from this

- **Vite**: Why it replaced CRA, how ES modules speed up development
- **axios.create()**: Building a pre-configured HTTP client so you don't repeat setup
- **axios interceptors**: Middleware for HTTP calls — automatically attach headers, handle 401s
- **useEffect for data fetching**: The standard React pattern for loading data when a component mounts
- **Loading/error state**: Every async operation needs three states: loading, success, error
- **import.meta.env**: How Vite exposes environment variables (must prefix with `VITE_`)
- **SPA routing**: React Router intercepts navigation and renders components without full page reloads