import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { NavigationProgress, nprogress } from "@mantine/nprogress";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useFetchers,
  useNavigation,
} from "react-router";
import { Notifications } from "@mantine/notifications";

import { useEffect, useMemo } from "react";

import type { Route } from "./+types/root";
import stylesheet from "./styles/app.css?url";
import { theme } from "./styles/theme";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap",
  },
  { rel: "stylesheet", href: stylesheet },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const navigation = useNavigation();
  let fetchers = useFetchers();

  /**
   * This gets the state of every fetcher active on the app and combine it with
   * the state of the global transition (Link and Form), then use them to
   * determine if the app is idle or if it's loading.
   * Here we consider both loading and submitting as loading.
   */
  let state = useMemo<"idle" | "loading">(
    function getGlobalState() {
      let states = [
        navigation.state,
        ...fetchers.map((fetcher) => fetcher.state),
      ];
      if (states.every((state) => state === "idle")) return "idle";
      return "loading";
    },
    [navigation.state, fetchers]
  );

  useEffect(() => {
    // and when it's something else it means it's either submitting a form or
    // waiting for the loaders of the next location so we start it
    if (state === "loading") nprogress.start();
    // when the state is idle then we can to complete the progress bar
    if (state === "idle") nprogress.complete();
  }, [state]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
        <Meta />
        <Links />
      </head>
      <body>
        <ColorSchemeScript defaultColorScheme="light" />
        <MantineProvider theme={theme}>
          <NavigationProgress />

          <ModalsProvider>{children}</ModalsProvider>

          <Notifications />
        </MantineProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
