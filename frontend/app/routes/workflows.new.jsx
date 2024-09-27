/**
 * Create a blank workflow on Remix serverside.
 */

import { redirect } from "@remix-run/react";

import { getSession } from "../components/sessions";

export const action = async ({ request }) => {
  const session_token = (await getSession(request.headers.get("Cookie"))).get(
    "session_token"
  );
  const res = await fetch(process.env.API_URL + "/workflows/new", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session_token}`,
    },
  });
  const { workflow_id } = await res.json();
  return redirect("/workflows/" + workflow_id);
};
