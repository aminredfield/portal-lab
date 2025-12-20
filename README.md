# Portal Lab

Portal Lab is an internal portal that demonstrates common patterns used in
modern web applications: authentication with roles, presigned file uploads,
centralised error handling and performance optimisation techniques. The
project is deliberately organised as a single coherent product rather than a
collection of unrelated demos. Both the backend and the frontend are
containerised via docker‑compose for ease of development and deployment.

## Features

### Auth + RBAC + Guards

- **Login / Logout** – Users log in with an email and a password (always `123` in the demo). A mock
  token containing the email, role and expiration is issued and stored in
  localStorage and a cookie.
- **Roles** – Three roles are defined: `admin`, `manager` and `viewer`. The role is
  derived from the email (`admin@demo.com`, `manager@demo.com` and any other
  address becomes `viewer`).
- **Route and UI guards** – On the server side a Next.js middleware reads the
  token cookie, decodes the role and expiry and redirects unauthorised users
  away from protected routes. On the client side pages also verify the
  token and expiration and redirect accordingly. Menu items for which the
  user lacks permissions are not rendered.

### Presigned Uploads

- The `/app/uploads` page lets managers and admins upload images via a
  presigned flow. The client first requests an upload URL from the API
  specifying the file name, type and size. On success it performs a `PUT`
  directly to that URL streaming the file contents while showing a progress
  bar.
- Only PNG and JPEG files up to 5 MB are accepted. Validation happens on both
  client and server.
- Uploads are retried by clicking the **Retry** button if a network error
  occurs. Upon success a toast is displayed and the list of recent uploads
  updates.
- The right side of the page lists the 10 most recent uploads including file
  name, size and timestamp. Each entry links to the public URL which serves
  the file.

### Centralised Error Handling

- An `apiClient` wraps axios and normalises network, HTTP and validation
  errors into a single union type. The `ToastProvider` shows mapped user
  friendly messages for 401, 403, 500 and 422 responses.
- The **Errors Lab** page exposes buttons to trigger demo endpoints on the
  backend (`/demo/http-500`, `/demo/http-401`, `/demo/validation`). The
  normalised error payload is rendered on screen and the appropriate toast
  appears without polluting the console.
- An `ErrorBoundary` component catches rendering errors anywhere under
  `/app` and shows a fallback UI with options to reload or go back to
  profile.

### Performance Lab

- Two pages under `/app/perf` illustrate web performance techniques. The
  **bad** implementation renders a large image via a plain `<img>`, filters
  a list of 200 items on every key stroke without debounce and imports all
  code synchronously.
- The **good** implementation uses `next/image` for automatic optimisation
  and LCP priority, dynamically imports a heavy component, debounces the
  search input and memoises the filtered list. A small widget on the page
  explains the differences. Consult the README in that folder for guidance
  on using Lighthouse to compare both versions.

## Repository structure

```
portal-lab/
  apps/
    api/    # Fastify backend
    web/    # Next.js frontend (App Router)
  docker-compose.yml
  .env.example
  README.md
```

### API (`apps/api`)

The Fastify server exposes the following endpoints:

- `POST /auth/login` – accepts `{ email, password }` and returns `{ token, role, exp }`. The password is always
  `123`. The role is derived from the email.
- `POST /uploads/presign` – (manager/admin) accepts `{ filename, contentType, size }` and returns `{ uploadId, uploadUrl, publicUrl }`.
- `PUT /upload/:uploadId` – (manager/admin) streams the request body to disk and records metadata.
- `GET /files/:uploadId` – serves an uploaded file.
- `GET /uploads/recent?limit=10` – returns metadata about the latest uploads.
- `GET /demo/http-500` – responds with HTTP 500.
- `GET /demo/http-401` – responds with HTTP 401.
- `POST /demo/validation` – responds with HTTP 422 and a validation payload.
- `GET /health` – simple health check returning `{ status: 'ok' }`.

Uploaded files are stored in the `uploads/` folder (persisted via a Docker
volume) and metadata is stored in a JSON file (`db.json`). The API enforces
file type and size limits defined via environment variables (`ALLOWED_TYPES`,
`MAX_FILE_SIZE`).

### Web (`apps/web`)

The Next.js frontend uses the App Router and Material UI. Important bits:

- **Routing and Middleware** – `/login` is the public login page. All
  `/app/*` routes are protected by a middleware (`middleware.ts`) which checks
  the token cookie and role. Unauthorized users are redirected to `/login`
  or `/app/profile` with a query flag used to display a toast.
- **AppShell** – Provides a responsive navigation drawer, an AppBar with
  portal title, role chip and avatar menu. The menu hides entries based on
  the user's role. The chip shows the current role.
- **State management** – Zustand stores the authentication state and persists
  it in localStorage. Upon login a cookie is also set so the middleware can
  authenticate requests. The `ToastProvider` exposes an `addToast` function
  to show alerts globally.
- **Uploads UI** – Uses MUI components and axios with progress events to
  implement the presigned upload flow. Drag'n'drop could be added but the
  demo keeps a button for simplicity.
- **Profile** – Shows session details and a checklist of accessible
  sections based on RBAC.
- **Reports and Admin** – Simple placeholder pages demonstrating how
  restricted sections could look.
- **Errors Lab** – Triggers API errors and displays the normalised error
  payload. A crash page intentionally throws an error to exercise the
  ErrorBoundary.
- **Performance Lab** – Two implementations of the same page with different
  performance techniques.

## Running locally

1. Copy `.env.example` to `.env` and adjust variables if needed.
2. Ensure you have Docker and docker‑compose installed.
3. Run `docker compose up --build` from the repository root. This will
   build and start both the API and the web application.
4. Navigate to `http://localhost:3000` in your browser.
5. Use one of the test accounts to log in:

   | Role    | Email           | Password |
   |---------|-----------------|----------|
   | Admin   | admin@demo.com  | 123      |
   | Manager | manager@demo.com| 123      |
   | Viewer  | viewer@demo.com | 123      |

## Lighthouse and performance

To compare the **bad** and **good** implementations in the Performance Lab:

1. Log in with any account and navigate to `/app/perf/bad`. Open Chrome
   DevTools and run Lighthouse on this page. Note the LCP, FID and CLS
   scores.
2. Navigate to `/app/perf/good` and run Lighthouse again. You should see
   improvements thanks to the optimisations described in the *What changed*
   widget on the page.

## Notes

- This repository aims to satisfy a detailed specification for a pet project.
  Some parts are simplified for brevity but the overall structure leaves
  room for extension. Replace the mock JWT implementation with a real
  authentication strategy and add proper persistence as needed.
