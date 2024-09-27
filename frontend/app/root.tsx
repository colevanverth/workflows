import type { LinksFunction } from "@remix-run/node";

import cssLink from "./styles/export.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: cssLink },
];

import {
  Meta,
  Outlet,
  Scripts,
  Links,
  ScrollRestoration,
} from "@remix-run/react";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Links />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
