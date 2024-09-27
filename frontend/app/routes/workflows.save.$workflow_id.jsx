/**
 * Create a blank workflow on Remix serverside.
 */

import { getSession } from "../components/sessions";

export const action = async ({ request, params }) => {
  const session_token = (await getSession(request.headers.get("Cookie"))).get(
    "session_token"
  );

  const formData = await request.formData();
  const workflow = Object.fromEntries(formData);

  await fetch(process.env.API_URL + "/workflows/" + params.workflow_id, {
    method: "PUT",
    body: JSON.stringify(workflow),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session_token}`,
    },
  });
  return null;
};
