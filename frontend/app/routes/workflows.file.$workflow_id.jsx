/**
 * Upload a file to the API.
 */

import { getSession } from "../components/sessions";

export const action = async ({ params, request }) => {
  const formData = await request.formData();
  const session_token = (await getSession(request.headers.get("Cookie"))).get(
    "session_token"
  );
  await fetch(process.env.API_URL + "/workflows/file/" + params.workflow_id, {
    method: "POST",
    body: formData,
    headers: {
      Authorization: `Bearer ${session_token}`,
    },
  });
  return null;
};
