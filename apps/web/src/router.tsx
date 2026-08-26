import type { ReactElement } from "react";
import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

/** Render the browser-only route outlet without document or API state. */
function RootLayout(): ReactElement {
  return (
    <main className="app-shell">
      <Outlet />
    </main>
  );
}

/** Render the intentionally minimal client-foundation route. */
function HomePage(): ReactElement {
  return (
    <section aria-labelledby="page-title" className="welcome-panel">
      <p className="eyebrow">Cipher Trace</p>
      <h1 id="page-title">Encrypted document history, kept private.</h1>
      <p>
        The web client foundation is ready for the approved encryption and
        workflow contracts.
      </p>
    </section>
  );
}

/** Render the local fallback for routes outside the foundation. */
function NotFoundPage(): ReactElement {
  return (
    <section aria-labelledby="page-title" className="welcome-panel">
      <p className="eyebrow">Cipher Trace</p>
      <h1 id="page-title">Page not found</h1>
      <p>This route is not part of the current client foundation.</p>
    </section>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
});

const indexRoute = createRoute({
  component: HomePage,
  getParentRoute: () => rootRoute,
  path: "/",
});

const routeTree = rootRoute.addChildren([indexRoute]);

/**
 * Browser-only route tree for the Cipher Trace client foundation.
 *
 * The base deliberately has no loaders, API client, or document state.
 */
export const router = createRouter({
  defaultPreload: "intent",
  routeTree,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
