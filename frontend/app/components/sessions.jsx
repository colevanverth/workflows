/**
 * Provides an interface to work with Remix sessions.
 */
import { createCookieSessionStorage } from "@remix-run/node";

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "__session",
      secure: true,
      secrets: ["sadfias8udfas8usfussdfjsdfjksfjkjkiadfuiosuiodfuiosaf"],
    },
  });

export { getSession, commitSession, destroySession };
