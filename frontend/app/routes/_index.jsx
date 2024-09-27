/**
 * App home that provides a sign-in page.
 */

import { Form } from "@remix-run/react";
import { useState } from "react";
import { redirect } from "@remix-run/node";

import { getSession, commitSession } from "../components/sessions";

// Process login requests.
export const action = async ({ request }) => {
  // Load email, password, and company slug.
  const form = await request.formData();
  const email = form.get("email");
  const password = form.get("password");
  const slug = request.url.split(".")[0].split("//")[1];

  // Attempt to retrieve a session token.
  const resp = await fetch(process.env.API_URL + "/login", {
    method: "POST",
    body: JSON.stringify({ email, password, slug }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  // If the user was verified, set the session token into the session and redirect the user to their workflows.
  if (resp.ok) {
    const session = await getSession(request.headers.get("Cookie"));
    const data = await resp.json();
    const session_token = await data.session_token;
    session.set("session_token", session_token);
    return redirect("/workflows", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  return null; // Something went wrong.
};

// Automatically redirect the user if logged in.
export const loader = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  if (session.has("session_token")) {
    return redirect("/workflows");
  }
  return null; // User not logged in.
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="form__background">
      <Form className="login__form" method="post">
        <label>EMAIL</label>
        <input
          type="text"
          name="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>PASSWORD</label>
        <input
          type="password"
          name="password"
          placeholder="********************"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Sign In</button>
      </Form>
    </div>
  );
}
