import type { ActionFunctionArgs, LinksFunction } from "@remix-run/node";
import {
  ClientLoaderFunctionArgs,
  Form,
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  redirect,
  useLoaderData,
} from "@remix-run/react";

import stylesheet from "~/tailwind.css";
import { destroySession, getSession } from "./session";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export async function action({ request }: ActionFunctionArgs) {
  let session = await getSession(request.headers.get("Cookie"));
  return redirect('/', {
    headers: {
      "Set-Cookie": await destroySession(session)
    }
  })
}

export async function loader({ request }: ClientLoaderFunctionArgs) {
  let session = await getSession(request.headers.get("Cookie"));
  return { session: session.data }
}
export default function App() {
  const { session } = useLoaderData<typeof loader>();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="mx-auto max-w-7xl p-6">
          <h1 className="text-4xl text-white">Work journal</h1>
          <p className="mt-3 text-xl text-gray-400">
            Doings and learnings. Updated weekly.
          </p>
          {session.isAdmin ? (

            <Form method="post">
              <button type="submit">Logout</button>
            </Form>
          ) : (
            <Link to="/login">Login</Link>
          )}
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
