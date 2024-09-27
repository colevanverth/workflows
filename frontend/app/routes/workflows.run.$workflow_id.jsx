/**
 * Run a workflow.
 */

import { getSession } from "../components/sessions";

export const loader = async ({ params, request }) => {
  const session_token = (await getSession(request.headers.get("Cookie"))).get(
    "session_token"
  );
  const url = new URL(request.url);
  const task_id = url.searchParams.get("task_id");

  const resp = await fetch(
    process.env.API_URL +
      "/workflows/run/" +
      params.workflow_id +
      "?task_id=" +
      task_id,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session_token}`,
      },
    }
  );
  if (!resp.ok) {
    console.log("Waiting...");
    return new Response(null, { status: 500 });
  }

  console.log("returning file");
  const arrayBuffer = await resp.arrayBuffer();
  return new Response(arrayBuffer, {
    headers: {
      "Content-Disposition": 'attachment; filename="output.csv"',
      "Content-Type": "application/octet-stream",
    },
  });
};

export const action = async ({ params, request }) => {
  const session_token = (await getSession(request.headers.get("Cookie"))).get(
    "session_token"
  );
  const resp = await fetch(
    process.env.API_URL + "/workflows/run/" + params.workflow_id,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session_token}`,
      },
    }
  );
  const data = await resp.json();
  const task_id = data.task_id;
  return { task_id };
};
