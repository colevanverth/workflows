/**
 * Displays workflow navigation bar and the selected workflow.
 */

import {
  Outlet,
  useLoaderData,
  NavLink,
  Form,
  useNavigate,
  useLocation,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import Fuse from "fuse.js";

import Nav from "../components/nav";
import Button from "../components/button";
import { getSession } from "../components/sessions";

// Fetch workflows.
export const loader = async ({ request }) => {
  const session_token = (await getSession(request.headers.get("Cookie"))).get(
    "session_token"
  );

  const res = await fetch(process.env.API_URL + "/workflows", {
    headers: {
      Authorization: `Bearer ${session_token}`,
    },
  });
  const data = await res.json();
  return { workflows: data };
};

export default function Workflows() {
  const { workflows } = useLoaderData();
  const location = useLocation();
  const navigate = useNavigate();
  const [fuse, setFuse] = useState(null);
  const [search, setSearch] = useState("");

  // Printable workflow save time.
  const convertTime = (workflow) => {
    const date = new Date(workflow.updated_at);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString(undefined, options);
  };

  // Fuse.js setup.
  useEffect(() => {
    setFuse(
      new Fuse(workflows, {
        keys: ["name"],
      })
    );
  }, [workflows]);

  // Navigate to the first workflow.
  useEffect(() => {
    if (location.pathname == "/workflows" && workflows.length > 0) {
      navigate("/workflows/" + workflows[0].id);
    }
  }, [location.pathname]);

  // Sorted Fuse.js workflow nav links.
  const sortedSearchedWorkflows =
    fuse &&
    fuse.search(search).map((workflow) => (
      <NavLink
        key={workflow.item.id}
        className={({ isActive }) =>
          isActive ? "workflow__select__on" : "workflow__select__off"
        }
        to={String(workflow.item.id)}
      >
        {workflow.item.name ? workflow.item.name : "Untitled Workflow"}
        <a> {convertTime(workflow.item)} </a>
      </NavLink>
    ));

  // Sorted workflow nav links.
  const sortedWorkflows = workflows
    .sort((a, b) => b.id - a.id)
    .map((workflow) => (
      <NavLink
        key={workflow.id}
        className={({ isActive }) =>
          isActive ? "workflow__select__on" : "workflow__select__off"
        }
        to={String(workflow.id)}
      >
        {workflow.name ? workflow.name : "Untitled Workflow"}
        <div> {convertTime(workflow)} </div>
      </NavLink>
    ));

  return (
    <>
      <Nav />
      <main className="workflows__container">
        <div className="workflows__header">
          <h1>Workflows</h1>
          <Form action={`/workflows/new`} method="post">
            <Button label="Create" icon="plus" color={true} />
          </Form>
        </div>
        <div className="workflows__body">
          <div className="workflows__body__menu">
            <div className="workflow__search__container">
              <i className="workflow__search__icon"></i>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="workflow__search"
                placeholder="Search for workflow"
              />
            </div>
            <div className="workflows__list__container">
              {sortedSearchedWorkflows}
              {!search && sortedWorkflows}
            </div>
          </div>
          <div className="workflows__body__container">
            <Outlet />
          </div>
        </div>
      </main>
    </>
  );
}
