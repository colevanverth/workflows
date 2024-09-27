/**
 * Delete a workflow on Remix serverside.
 */

import { redirect } from "@remix-run/react";

import { getSession } from "../components/sessions";

export const action = async ({ params, request }) => {
  const session_token = (await getSession(request.headers.get("Cookie"))).get(
    "session_token"
  );
  await fetch(process.env.API_URL + "/workflows/" + params.workflow_id, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${session_token}`,
    },
  });
  return redirect("/workflows");
};
