import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-strong max-w-md rounded-3xl p-10 text-center">
        <h1 className="text-7xl font-bold text-gradient-cosmic">404</h1>
        <h2 className="mt-4 text-2xl">Lost in the cosmos</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This constellation isn't mapped yet.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:glow-royal"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-strong max-w-md rounded-3xl p-10 text-center">
        <h1 className="text-2xl">The stars misaligned</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. Try again or head home.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground hover:glow-royal transition"
          >
            Try again
          </button>
          <a href="/" className="rounded-full glass px-5 py-2 text-sm hover:glow-gold transition">Home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "GrahGanit — Precision Vedic Planetary Mathematics, Kundali & Astrology" },
      { name: "description", content: "Discover your cosmic blueprint with GrahGanit (ग्रह गणित). Swiss-ephemeris Vedic Kundali, Planetary Mathematics, Numerology & Palmistry — calculated with precision." },
      { name: "author", content: "GrahGanit Engine" },
      { property: "og:title", content: "GrahGanit — Precision Vedic Astrology & Planetary Engine" },
      { property: "og:description", content: "Ancient Vedic planetary calculations powered by deterministic mathematics. Astrology, numerology, palm reading & Kundali on GrahGanit." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "shortcut icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { FloatingWhatsApp } from "@/components/site/FloatingWhatsApp";
import { useRouterState } from "@tanstack/react-router";
import { initGA, trackPageView } from "@/lib/analytics";

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // Initialize GA4 client-side once
  useEffect(() => {
    initGA();
  }, []);

  // Track SPA route changes including query params
  const routerState = useRouterState({
    select: (s) => ({
      pathname: s.location.pathname,
      searchStr: s.location.searchStr,
    }),
  });

  useEffect(() => {
    const fullPath = routerState.pathname + (routerState.searchStr ? `?${routerState.searchStr}` : "");
    trackPageView(fullPath, typeof document !== "undefined" ? document.title : "");
  }, [routerState.pathname, routerState.searchStr]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <FloatingWhatsApp />
    </QueryClientProvider>
  );
}
