/**
 * Clear the session token and return the user to the login screen.
 */

import { redirect } from "@remix-run/react";

import { destroySession, getSession } from "../components/sessions";

export const action = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
};
